import { searchKB, SearchResult } from '@/lib/kb/search'
import { loadEmbeddings } from '@/lib/kb/load'
import OpenAI from 'openai'

// Mock OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    embeddings: {
      create: jest.fn(),
    },
  }))
})

// Mock loadEmbeddings
jest.mock('@/lib/kb/load', () => ({
  loadEmbeddings: jest.fn(),
}))

describe('searchKB', () => {
  let mockOpenAI: jest.Mocked<OpenAI>

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup mock OpenAI instance
    mockOpenAI = new OpenAI({ apiKey: 'test-key' }) as jest.Mocked<OpenAI>
    ;(OpenAI as jest.Mock).mockReturnValue(mockOpenAI)

    // Mock environment variable
    process.env.OPENAI_API_KEY = 'test-key'
  })

  afterEach(() => {
    delete process.env.OPENAI_API_KEY
  })

  it('should return top 3 results by default', async () => {
    const mockEmbeddings = {
      files: [
        {
          filename: 'pe_ratio.md',
          content: 'Price-to-Earnings ratio explanation',
          embedding: [0.9, 0.1, 0.0],
        },
        {
          filename: 'etf_basics.md',
          content: 'ETF basics explanation',
          embedding: [0.8, 0.2, 0.0],
        },
        {
          filename: 'market_cap.md',
          content: 'Market cap explanation',
          embedding: [0.7, 0.3, 0.0],
        },
        {
          filename: 'bonds_basics.md',
          content: 'Bonds explanation',
          embedding: [0.6, 0.4, 0.0],
        },
      ],
      generatedAt: '2024-01-01T00:00:00.000Z',
    }

    ;(loadEmbeddings as jest.Mock).mockReturnValue(mockEmbeddings)

    // Mock embedding response
    const mockEmbeddingResponse = {
      data: [
        {
          embedding: [0.95, 0.05, 0.0], // Similar to pe_ratio
        },
      ],
    }
    ;(mockOpenAI.embeddings.create as jest.Mock).mockResolvedValue(mockEmbeddingResponse as any)

    const results = await searchKB('What is P/E ratio?')

    expect(results).toHaveLength(3)
    expect(results[0].filename).toBe('pe_ratio.md') // Should be most similar
    expect(results[0].score).toBeGreaterThan(0)
    expect(results[0].excerpt).toBeTruthy()
  })

  it('should return top K results when specified', async () => {
    const mockEmbeddings = {
      files: [
        {
          filename: 'test1.md',
          content: 'Test 1',
          embedding: [0.9, 0.1, 0.0],
        },
        {
          filename: 'test2.md',
          content: 'Test 2',
          embedding: [0.8, 0.2, 0.0],
        },
        {
          filename: 'test3.md',
          content: 'Test 3',
          embedding: [0.7, 0.3, 0.0],
        },
      ],
      generatedAt: '2024-01-01T00:00:00.000Z',
    }

    ;(loadEmbeddings as jest.Mock).mockReturnValue(mockEmbeddings)

    const mockEmbeddingResponse = {
      data: [{ embedding: [0.95, 0.05, 0.0] }],
    }
    ;(mockOpenAI.embeddings.create as jest.Mock).mockResolvedValue(mockEmbeddingResponse as any)

    const results = await searchKB('test query', 2)

    expect(results).toHaveLength(2)
  })

  it('should throw error if OPENAI_API_KEY is not set', async () => {
    // Clear the module cache to reset the OpenAI client
    jest.resetModules()
    
    // Save original env
    const originalKey = process.env.OPENAI_API_KEY
    delete process.env.OPENAI_API_KEY

    // Re-import to get fresh module
    const { searchKB: freshSearchKB } = await import('@/lib/kb/search')
    const { loadEmbeddings: freshLoadEmbeddings } = await import('@/lib/kb/load')
    
    const mockEmbeddings = {
      files: [],
      generatedAt: '2024-01-01T00:00:00.000Z',
    }
    jest.spyOn(await import('@/lib/kb/load'), 'loadEmbeddings').mockReturnValue(mockEmbeddings)

    await expect(freshSearchKB('test')).rejects.toThrow('OPENAI_API_KEY')
    
    // Restore env
    if (originalKey) {
      process.env.OPENAI_API_KEY = originalKey
    }
  })

  it('should include excerpt in results', async () => {
    const longContent = 'A'.repeat(300) // Longer than default excerpt length
    const mockEmbeddings = {
      files: [
        {
          filename: 'test.md',
          content: longContent,
          embedding: [0.9, 0.1, 0.0],
        },
      ],
      generatedAt: '2024-01-01T00:00:00.000Z',
    }

    ;(loadEmbeddings as jest.Mock).mockReturnValue(mockEmbeddings)

    const mockEmbeddingResponse = {
      data: [{ embedding: [0.95, 0.05, 0.0] }],
    }
    ;(mockOpenAI.embeddings.create as jest.Mock).mockResolvedValue(mockEmbeddingResponse as any)

    const results = await searchKB('test')

    expect(results[0].excerpt.length).toBeLessThanOrEqual(203) // 200 + '...'
    expect(results[0].excerpt).toContain('...')
  })

  it('should sort results by similarity score (descending)', async () => {
    const mockEmbeddings = {
      files: [
        {
          filename: 'low.md',
          content: 'Low similarity',
          embedding: [0.1, 0.9, 0.0],
        },
        {
          filename: 'high.md',
          content: 'High similarity',
          embedding: [0.9, 0.1, 0.0],
        },
      ],
      generatedAt: '2024-01-01T00:00:00.000Z',
    }

    ;(loadEmbeddings as jest.Mock).mockReturnValue(mockEmbeddings)

    const mockEmbeddingResponse = {
      data: [{ embedding: [0.95, 0.05, 0.0] }], // Similar to high.md
    }
    ;(mockOpenAI.embeddings.create as jest.Mock).mockResolvedValue(mockEmbeddingResponse as any)

    const results = await searchKB('test')

    expect(results[0].filename).toBe('high.md')
    expect(results[0].score).toBeGreaterThan(results[1].score)
  })
})

