/**
 * Tests for NewsPanel component
 */

import { render, screen, waitFor, act } from '@testing-library/react'
import { NewsPanel } from '@/components/NewsPanel'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch as jest.Mock

describe('NewsPanel Component', () => {
  const mockNewsResponse = {
    ticker: 'AAPL',
    items: [
      {
        title: 'Apple Reports Strong Q4 Earnings',
        source: 'TechCrunch',
        url: 'https://techcrunch.com/apple-earnings',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: 'Apple Stock Rises on iPhone Sales',
        source: 'Bloomberg',
        url: 'https://bloomberg.com/apple-stock',
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
    ],
  }

  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('renders placeholder when no ticker is selected', async () => {
    await act(async () => {
      render(<NewsPanel ticker={null} />)
    })

    expect(screen.getByText('News Panel')).toBeInTheDocument()
    expect(
      screen.getByText('Select a ticker from the watchlist to view news.')
    ).toBeInTheDocument()
  })

  it('displays loading state when fetching news', async () => {
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => mockNewsResponse,
              }),
            100
          )
        )
    )

    await act(async () => {
      render(<NewsPanel ticker="AAPL" />)
    })

    expect(screen.getByText('Loading news...')).toBeInTheDocument()
  })

  it('displays news items when loaded', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockNewsResponse,
    })

    await act(async () => {
      render(<NewsPanel ticker="AAPL" />)
    })

    await waitFor(() => {
      expect(screen.getByText('AAPL News')).toBeInTheDocument()
      expect(
        screen.getByText('Apple Reports Strong Q4 Earnings')
      ).toBeInTheDocument()
      expect(screen.getByText('Apple Stock Rises on iPhone Sales')).toBeInTheDocument()
    })
  })

  it('displays news source and time', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockNewsResponse,
    })

    await act(async () => {
      render(<NewsPanel ticker="AAPL" />)
    })

    await waitFor(() => {
      expect(screen.getByText('TechCrunch')).toBeInTheDocument()
      expect(screen.getByText('Bloomberg')).toBeInTheDocument()
    })
  })

  it('renders external links correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockNewsResponse,
    })

    await act(async () => {
      render(<NewsPanel ticker="AAPL" />)
    })

    await waitFor(() => {
      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)
      links.forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      })
    })
  })

  it('displays error message when fetch fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await act(async () => {
      render(<NewsPanel ticker="AAPL" />)
    })

    await waitFor(() => {
      expect(screen.getByText(/Failed to load news/i)).toBeInTheDocument()
    })
  })

  it('displays empty state when no news available', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ticker: 'AAPL',
        items: [],
      }),
    })

    await act(async () => {
      render(<NewsPanel ticker="AAPL" />)
    })

    await waitFor(() => {
      expect(screen.getByText(/No news available for AAPL/i)).toBeInTheDocument()
    })
  })

  it('updates when ticker changes', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockNewsResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ticker: 'MSFT',
          items: [
            {
              title: 'Microsoft Cloud Revenue Surges',
              source: 'The Verge',
              url: 'https://theverge.com/microsoft-cloud',
              publishedAt: new Date().toISOString(),
            },
          ],
        }),
      })

    const { rerender } = await act(async () => {
      return render(<NewsPanel ticker="AAPL" />)
    })

    await waitFor(() => {
      expect(screen.getByText('Apple Reports Strong Q4 Earnings')).toBeInTheDocument()
    })

    await act(async () => {
      rerender(<NewsPanel ticker="MSFT" />)
    })

    await waitFor(() => {
      expect(screen.getByText('MSFT News')).toBeInTheDocument()
      expect(screen.getByText('Microsoft Cloud Revenue Surges')).toBeInTheDocument()
    })
  })

  it('formats time correctly', async () => {
    const recentTime = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ticker: 'AAPL',
        items: [
          {
            title: 'Recent News',
            source: 'Source',
            url: 'https://example.com',
            publishedAt: recentTime,
          },
        ],
      }),
    })

    await act(async () => {
      render(<NewsPanel ticker="AAPL" />)
    })

    await waitFor(() => {
      expect(screen.getByText(/2 hour/i)).toBeInTheDocument()
    })
  })
})

