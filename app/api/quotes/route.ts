import { NextRequest, NextResponse } from 'next/server'

// Types
interface Quote {
  symbol: string
  price: number
  changePct: number
}

interface QuotesResponse {
  asOf: string
  quotes: Quote[]
}

// Mock data for fallback
const MOCK_QUOTES: Record<string, Quote> = {
  AAPL: { symbol: 'AAPL', price: 195.89, changePct: 1.23 },
  MSFT: { symbol: 'MSFT', price: 378.85, changePct: -0.45 },
  NVDA: { symbol: 'NVDA', price: 875.50, changePct: 2.15 },
  TSLA: { symbol: 'TSLA', price: 248.42, changePct: -1.87 },
  AMZN: { symbol: 'AMZN', price: 151.94, changePct: 0.78 },
  SPY: { symbol: 'SPY', price: 476.50, changePct: 0.34 },
  QQQ: { symbol: 'QQQ', price: 412.30, changePct: 0.56 },
}

/**
 * Fetch real-time quotes from Yahoo Finance (free, no API key required)
 * Falls back to mock data if API fails
 */
async function fetchQuotes(symbols: string[]): Promise<Quote[]> {
  try {
    // Using Yahoo Finance API (free, no key required)
    // Format: https://query1.finance.yahoo.com/v8/finance/chart/{symbol}
    const quotes: Quote[] = []
    
    for (const symbol of symbols) {
      try {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0',
            },
            next: { revalidate: 60 }, // Cache for 60 seconds
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch ${symbol}`)
        }

        const data = await response.json()
        const result = data.chart?.result?.[0]
        
        if (result && result.meta) {
          const currentPrice = result.meta.regularMarketPrice
          const previousClose = result.meta.previousClose
          const changePct = previousClose 
            ? ((currentPrice - previousClose) / previousClose) * 100 
            : 0

          quotes.push({
            symbol,
            price: Number(currentPrice.toFixed(2)),
            changePct: Number(changePct.toFixed(2)),
          })
        } else {
          // Fallback to mock if data structure is unexpected
          throw new Error('Unexpected data structure')
        }
      } catch (error) {
        // Use mock data for this symbol if API fails
        console.warn(`Failed to fetch ${symbol}, using mock data:`, error)
        if (MOCK_QUOTES[symbol]) {
          quotes.push(MOCK_QUOTES[symbol])
        }
      }
    }

    return quotes.length > 0 ? quotes : getMockQuotes(symbols)
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return getMockQuotes(symbols)
  }
}

/**
 * Get mock quotes for symbols
 */
function getMockQuotes(symbols: string[]): Quote[] {
  return symbols
    .map((symbol) => MOCK_QUOTES[symbol])
    .filter((quote): quote is Quote => quote !== undefined)
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const symbolsParam = searchParams.get('symbols')

    if (!symbolsParam) {
      return NextResponse.json(
        { error: 'Missing symbols parameter' },
        { status: 400 }
      )
    }

    const symbols = symbolsParam
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length > 0)

    if (symbols.length === 0) {
      return NextResponse.json(
        { error: 'No valid symbols provided' },
        { status: 400 }
      )
    }

    const quotes = await fetchQuotes(symbols)

    const response: QuotesResponse = {
      asOf: new Date().toISOString(),
      quotes,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in quotes API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

