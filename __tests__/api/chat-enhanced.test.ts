import { searchKB } from '@/lib/kb/search'

// Mock Next.js server modules
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, init) => {
    return {
      url: typeof url === 'string' ? url : url.toString(),
      method: init?.method || 'POST',
      json: async () => {
        if (init?.body) {
          return typeof init.body === 'string' ? JSON.parse(init.body) : init.body
        }
        return {}
      },
    }
  }),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      ok: (init?.status || 200) < 400,
    })),
  },
}))

// Mock dependencies
jest.mock('@/lib/kb/search')
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  }))
})

// Mock fetch for quotes and news
global.fetch = jest.fn()

// Import after mocks
const { POST } = require('@/app/api/chat/route')

describe('Enhanced Chat API - Phase 7', () => {
  const mockOpenAI = require('openai')
  let mockCompletion: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.OPENAI_API_KEY = 'test-key'
    
    mockCompletion = jest.fn().mockResolvedValue({
      choices: [{
        message: {
          content: 'Test response',
        },
      }],
    })
    
    const mockClient = new mockOpenAI({ apiKey: 'test-key' })
    mockClient.chat.completions.create = mockCompletion
    mockOpenAI.mockReturnValue(mockClient)
  })

  afterEach(() => {
    delete process.env.OPENAI_API_KEY
  })

  describe('Intent Detection', () => {
    it('should detect definition questions and use KB', async () => {
      const mockKBResults = [
        {
          filename: 'pe_ratio.md',
          content: 'P/E ratio explanation',
          score: 0.9,
          excerpt: 'P/E ratio...',
        },
      ]

      ;(searchKB as jest.Mock).mockResolvedValue(mockKBResults)

      const request = {
        url: 'http://localhost:3000/api/chat',
        json: async () => ({
          ticker: null,
          messages: [
            { role: 'user', content: 'What is P/E ratio?' },
          ],
        }),
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(searchKB).toHaveBeenCalledWith('What is P/E ratio?', 3)
      expect(data.answer).toBe('Test response')
      expect(data.sources).toBeDefined()
      expect(data.sources?.some((s: any) => s.type === 'kb')).toBe(true)
    })

    it('should detect market questions and fetch quotes', async () => {
      const mockQuotesResponse = {
        quotes: [
          { symbol: 'AAPL', price: 150.0, changePct: 1.5 },
        ],
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuotesResponse,
      })

      const request = {
        url: 'http://localhost:3000/api/chat',
        json: async () => ({
          ticker: 'AAPL',
          messages: [
            { role: 'user', content: 'What is the price of AAPL today?' },
          ],
        }),
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/quotes'),
        expect.any(Object)
      )
      expect(data.sources).toBeDefined()
      expect(data.sources?.some((s: any) => s.type === 'quotes')).toBe(true)
    })

    it('should detect news questions and fetch news', async () => {
      const mockNewsResponse = {
        articles: [
          { title: 'Test News', source: 'Test Source', publishedAt: '2024-01-01' },
        ],
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: false }) // Quotes fails
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockNewsResponse,
        })

      const request = {
        url: 'http://localhost:3000/api/chat',
        json: async () => ({
          ticker: 'AAPL',
          messages: [
            { role: 'user', content: 'What news happened to AAPL?' },
          ],
        }),
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/news'),
        expect.any(Object)
      )
      expect(data.sources).toBeDefined()
      expect(data.sources?.some((s: any) => s.type === 'news')).toBe(true)
    })

    it('should handle mixed questions (KB + quotes)', async () => {
      const mockKBResults = [
        {
          filename: 'pe_ratio.md',
          content: 'P/E ratio explanation',
          score: 0.9,
          excerpt: 'P/E ratio...',
        },
      ]

      const mockQuotesResponse = {
        quotes: [
          { symbol: 'AAPL', price: 150.0, changePct: 1.5 },
        ],
      }

      ;(searchKB as jest.Mock).mockResolvedValue(mockKBResults)
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuotesResponse,
      })

      const request = {
        url: 'http://localhost:3000/api/chat',
        json: async () => ({
          ticker: 'AAPL',
          messages: [
            { role: 'user', content: 'Explain P/E ratio and what is AAPL price?' },
          ],
        }),
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(searchKB).toHaveBeenCalled()
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/quotes'),
        expect.any(Object)
      )
      expect(data.sources).toBeDefined()
      expect(data.sources?.some((s: any) => s.type === 'kb')).toBe(true)
      expect(data.sources?.some((s: any) => s.type === 'quotes')).toBe(true)
    })
  })

  describe('Source Citations', () => {
    it('should include KB sources in response', async () => {
      const mockKBResults = [
        {
          filename: 'etf_basics.md',
          content: 'ETF explanation',
          score: 0.9,
          excerpt: 'ETF...',
        },
        {
          filename: 'market_cap.md',
          content: 'Market cap explanation',
          score: 0.8,
          excerpt: 'Market cap...',
        },
      ]

      ;(searchKB as jest.Mock).mockResolvedValue(mockKBResults)

      const request = {
        url: 'http://localhost:3000/api/chat',
        json: async () => ({
          ticker: null,
          messages: [
            { role: 'user', content: 'What is an ETF?' },
          ],
        }),
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(data.sources).toBeDefined()
      const kbSources = data.sources?.filter((s: any) => s.type === 'kb')
      expect(kbSources?.length).toBeGreaterThan(0)
      expect(kbSources?.[0].detail).toBe('etf_basics')
    })

    it('should include quotes sources with symbols', async () => {
      const mockQuotesResponse = {
        quotes: [
          { symbol: 'AAPL', price: 150.0, changePct: 1.5 },
          { symbol: 'MSFT', price: 300.0, changePct: -0.5 },
        ],
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuotesResponse,
      })

      const request = {
        url: 'http://localhost:3000/api/chat',
        json: async () => ({
          ticker: null,
          messages: [
            { role: 'user', content: 'What are the prices today?' },
          ],
        }),
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(data.sources).toBeDefined()
      const quotesSource = data.sources?.find((s: any) => s.type === 'quotes')
      expect(quotesSource).toBeDefined()
      expect(quotesSource?.detail).toContain('AAPL')
      expect(quotesSource?.detail).toContain('MSFT')
    })

    it('should include news sources with headlines', async () => {
      const mockNewsResponse = {
        articles: [
          { title: 'Breaking News 1', source: 'Source 1', publishedAt: '2024-01-01' },
          { title: 'Breaking News 2', source: 'Source 2', publishedAt: '2024-01-01' },
        ],
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: false })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockNewsResponse,
        })

      const request = {
        url: 'http://localhost:3000/api/chat',
        json: async () => ({
          ticker: 'AAPL',
          messages: [
            { role: 'user', content: 'What news happened?' },
          ],
        }),
      } as any

      const response = await POST(request)
      const data = await response.json()

      expect(data.sources).toBeDefined()
      const newsSource = data.sources?.find((s: any) => s.type === 'news')
      expect(newsSource).toBeDefined()
      expect(newsSource?.detail).toContain('Breaking News')
    })
  })

  describe('Error Handling', () => {
    it('should continue without KB if search fails', async () => {
      ;(searchKB as jest.Mock).mockRejectedValue(new Error('KB search failed'))

      const request = {
        url: 'http://localhost:3000/api/chat',
        json: async () => ({
          ticker: null,
          messages: [
            { role: 'user', content: 'What is P/E ratio?' },
          ],
        }),
      } as any

      const response = await POST(request)
      const data = await response.json()

      // Should still return a response even if KB fails
      expect(data.answer).toBeDefined()
    })

    it('should continue without quotes if fetch fails', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      })

      const request = {
        url: 'http://localhost:3000/api/chat',
        json: async () => ({
          ticker: 'AAPL',
          messages: [
            { role: 'user', content: 'What is the price today?' },
          ],
        }),
      } as any

      const response = await POST(request)
      const data = await response.json()

      // Should still return a response even if quotes fail
      expect(data.answer).toBeDefined()
    })
  })
})

