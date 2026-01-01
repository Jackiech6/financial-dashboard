import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Chat } from '@/components/Chat'

// Mock fetch
global.fetch = jest.fn()

describe('Chat Component - Sources Display', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should display KB sources in assistant messages', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      answer: 'P/E ratio is a valuation metric...',
      sources: [
        { type: 'kb', detail: 'pe_ratio' },
        { type: 'kb', detail: 'market_cap' },
      ],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<Chat ticker={null} />)

    // Find and type in the input
    const input = screen.getByPlaceholderText(/ask me anything about finance/i)
    await user.type(input, 'What is P/E ratio?')

    // Find and click send button (the last button, which is the send button)
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons[buttons.length - 1] // Last button is the send button
    await user.click(sendButton)

    // Wait for the response
    await waitFor(() => {
      expect(screen.getByText(/P\/E ratio is a valuation metric/)).toBeInTheDocument()
    })

    // Check for sources section
    await waitFor(() => {
      expect(screen.getByText(/Sources:/)).toBeInTheDocument()
      expect(screen.getByText(/kb:/i)).toBeInTheDocument()
      expect(screen.getByText(/pe_ratio/i)).toBeInTheDocument()
    })
  })

  it('should display quotes sources in assistant messages', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      answer: 'AAPL is currently trading at $150.00...',
      sources: [
        { type: 'quotes', detail: 'AAPL, MSFT, NVDA' },
      ],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<Chat ticker="AAPL" />)

    const input = screen.getByPlaceholderText(/ask me anything about finance/i)
    await user.type(input, 'What is the price?')

    const sendButton = screen.getByRole('button')
    await user.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText(/AAPL is currently trading/)).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText(/Sources:/)).toBeInTheDocument()
      expect(screen.getByText(/quotes:/i)).toBeInTheDocument()
      expect(screen.getByText(/AAPL, MSFT, NVDA/)).toBeInTheDocument()
    })
  })

  it('should display news sources in assistant messages', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      answer: 'Recent news about AAPL...',
      sources: [
        { type: 'news', detail: 'Breaking News: AAPL announces...' },
      ],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<Chat ticker="AAPL" />)

    const input = screen.getByPlaceholderText(/ask me anything about finance/i)
    await user.type(input, 'What news happened?')

    const sendButton = screen.getByRole('button')
    await user.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText(/Recent news about AAPL/)).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText(/Sources:/)).toBeInTheDocument()
      expect(screen.getByText(/news:/i)).toBeInTheDocument()
    })
  })

  it('should display multiple source types', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      answer: 'P/E ratio explanation and current prices...',
      sources: [
        { type: 'kb', detail: 'pe_ratio' },
        { type: 'quotes', detail: 'AAPL, MSFT' },
        { type: 'news', detail: 'Recent announcement' },
      ],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<Chat ticker="AAPL" />)

    const input = screen.getByPlaceholderText(/ask me anything about finance/i)
    await user.type(input, 'Explain P/E and what happened today?')

    const sendButton = screen.getByRole('button')
    await user.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText(/P\/E ratio explanation/)).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText(/Sources:/)).toBeInTheDocument()
      expect(screen.getByText(/kb:/i)).toBeInTheDocument()
      expect(screen.getByText(/quotes:/i)).toBeInTheDocument()
      expect(screen.getByText(/news:/i)).toBeInTheDocument()
    })
  })

  it('should not display sources section if no sources provided', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      answer: 'General response without sources',
      sources: undefined,
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<Chat ticker={null} />)

    const input = screen.getByPlaceholderText(/ask me anything about finance/i)
    await user.type(input, 'Hello')

    const sendButton = screen.getByRole('button')
    await user.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText(/General response without sources/)).toBeInTheDocument()
    })

    // Sources section should not be present
    expect(screen.queryByText(/Sources:/)).not.toBeInTheDocument()
  })

  it('should format KB source details (replace underscores)', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      answer: 'Test response',
      sources: [
        { type: 'kb', detail: 'pe_ratio' },
        { type: 'kb', detail: 'market_cap' },
      ],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    })

    render(<Chat ticker={null} />)

    const input = screen.getByPlaceholderText(/ask me anything about finance/i)
    await user.type(input, 'Test question')

    const sendButton = screen.getByRole('button')
    await user.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText(/pe ratio/i)).toBeInTheDocument()
      expect(screen.getByText(/market cap/i)).toBeInTheDocument()
    })
  })
})

