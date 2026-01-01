/**
 * Tests for Watchlist component
 */

import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Watchlist } from '@/components/Watchlist'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch as jest.Mock

describe('Watchlist Component', () => {
  const mockQuotesResponse = {
    asOf: new Date().toISOString(),
    quotes: [
      { symbol: 'AAPL', price: 195.89, changePct: 1.23 },
      { symbol: 'MSFT', price: 378.85, changePct: -0.45 },
      { symbol: 'NVDA', price: 875.50, changePct: 2.15 },
    ],
  }

  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('renders watchlist with default symbols', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockQuotesResponse,
    })

    await act(async () => {
      render(<Watchlist />)
    })

    expect(screen.getByText('Market Watchlist')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument()
    })
  })

  it('displays quotes in table format', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockQuotesResponse,
    })

    await act(async () => {
      render(<Watchlist />)
    })

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument()
      expect(screen.getByText('MSFT')).toBeInTheDocument()
      expect(screen.getByText('NVDA')).toBeInTheDocument()
    })

    // Check table headers
    expect(screen.getByText('Symbol')).toBeInTheDocument()
    expect(screen.getByText('Price')).toBeInTheDocument()
    expect(screen.getByText('Change')).toBeInTheDocument()
  })

  it('calls onTickerSelect when ticker is clicked', async () => {
    const mockOnTickerSelect = jest.fn()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockQuotesResponse,
    })

    await act(async () => {
      render(<Watchlist onTickerSelect={mockOnTickerSelect} />)
    })

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument()
    })

    const aaplRow = screen.getByText('AAPL').closest('tr')
    expect(aaplRow).toBeInTheDocument()

    if (aaplRow) {
      await act(async () => {
        await userEvent.click(aaplRow)
      })
      expect(mockOnTickerSelect).toHaveBeenCalledWith('AAPL')
    }
  })

  it('shows refresh button', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockQuotesResponse,
    })

    await act(async () => {
      render(<Watchlist />)
    })
    
    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  it('refreshes data when refresh button is clicked', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuotesResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockQuotesResponse,
          quotes: [{ symbol: 'TSLA', price: 248.42, changePct: -1.87 }],
        }),
      })

    await act(async () => {
      render(<Watchlist />)
    })

    await waitFor(() => {
      expect(screen.getByText('AAPL')).toBeInTheDocument()
    })

    const refreshButton = screen.getByRole('button')
    
    await act(async () => {
      await userEvent.click(refreshButton)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  it('displays error message when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await act(async () => {
      render(<Watchlist />)
    })

    await waitFor(() => {
      expect(screen.getByText(/Failed to load quotes/i)).toBeInTheDocument()
    })
  })

  it('formats prices correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockQuotesResponse,
    })

    await act(async () => {
      render(<Watchlist />)
    })

    await waitFor(() => {
      // Check for formatted currency (should contain $)
      const priceElements = screen.getAllByText(/\$[\d,]+\.\d{2}/)
      expect(priceElements.length).toBeGreaterThan(0)
    })
  })

  it('displays positive change in green', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockQuotesResponse,
        quotes: [{ symbol: 'AAPL', price: 195.89, changePct: 1.23 }],
      }),
    })

    await act(async () => {
      render(<Watchlist />)
    })

    await waitFor(() => {
      const changeElement = screen.getByText('+1.23%')
      expect(changeElement).toHaveClass('text-green-600')
    })
  })

  it('displays negative change in red', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockQuotesResponse,
        quotes: [{ symbol: 'MSFT', price: 378.85, changePct: -0.45 }],
      }),
    })

    await act(async () => {
      render(<Watchlist />)
    })

    await waitFor(() => {
      const changeElement = screen.getByText('-0.45%')
      expect(changeElement).toHaveClass('text-red-600')
    })
  })

  it('shows last updated timestamp', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockQuotesResponse,
    })

    await act(async () => {
      render(<Watchlist />)
    })

    await waitFor(() => {
      expect(screen.getByText(/Last updated:/i)).toBeInTheDocument()
    })
  })
})

