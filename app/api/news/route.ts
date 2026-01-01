import { NextRequest, NextResponse } from 'next/server'

// Types
interface NewsItem {
  title: string
  source: string
  url: string
  publishedAt: string
}

interface NewsResponse {
  ticker: string
  items: NewsItem[]
}

// Mock data for fallback
const MOCK_NEWS: Record<string, NewsItem[]> = {
  AAPL: [
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
    {
      title: 'Apple Announces New Product Line',
      source: 'Reuters',
      url: 'https://reuters.com/apple-products',
      publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
  ],
  MSFT: [
    {
      title: 'Microsoft Cloud Revenue Surges',
      source: 'The Verge',
      url: 'https://theverge.com/microsoft-cloud',
      publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: 'Microsoft Teams Reaches 300M Users',
      source: 'CNBC',
      url: 'https://cnbc.com/microsoft-teams',
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
  ],
  NVDA: [
    {
      title: 'NVIDIA AI Chips in High Demand',
      source: 'WSJ',
      url: 'https://wsj.com/nvidia-ai',
      publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: 'NVIDIA Stock Hits New High',
      source: 'MarketWatch',
      url: 'https://marketwatch.com/nvidia-stock',
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
  ],
  TSLA: [
    {
      title: 'Tesla Deliveries Exceed Expectations',
      source: 'Reuters',
      url: 'https://reuters.com/tesla-deliveries',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ],
  AMZN: [
    {
      title: 'Amazon AWS Growth Continues',
      source: 'TechCrunch',
      url: 'https://techcrunch.com/amazon-aws',
      publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ],
  SPY: [
    {
      title: 'S&P 500 Reaches Record High',
      source: 'Bloomberg',
      url: 'https://bloomberg.com/sp500',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
  ],
  QQQ: [
    {
      title: 'NASDAQ ETF Shows Strong Performance',
      source: 'CNBC',
      url: 'https://cnbc.com/nasdaq-etf',
      publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
  ],
}

/**
 * Fetch news from NewsAPI (free tier available)
 * Falls back to mock data if API fails
 */
async function fetchNews(ticker: string): Promise<NewsItem[]> {
  try {
    const newsApiKey = process.env.NEWS_API_KEY
    const finnhubApiKey = process.env.FINNHUB_API_KEY

    // Try NewsAPI first if key is available
    if (newsApiKey) {
      try {
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=${ticker}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${newsApiKey}`,
          {
            next: { revalidate: 300 }, // Cache for 5 minutes
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.articles && data.articles.length > 0) {
            return data.articles.slice(0, 10).map((article: any) => ({
              title: article.title || 'No title',
              source: article.source?.name || 'Unknown',
              url: article.url || '#',
              publishedAt: article.publishedAt || new Date().toISOString(),
            }))
          }
        }
      } catch (error) {
        console.warn('NewsAPI failed, trying Finnhub:', error)
      }
    }

    // Try Finnhub if key is available
    if (finnhubApiKey) {
      try {
        const response = await fetch(
          `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&to=${new Date().toISOString().split('T')[0]}&token=${finnhubApiKey}`,
          {
            next: { revalidate: 300 }, // Cache for 5 minutes
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data && data.length > 0) {
            return data.slice(0, 10).map((item: any) => ({
              title: item.headline || 'No title',
              source: item.source || 'Unknown',
              url: item.url || item.weburl || '#',
              publishedAt: new Date(item.datetime * 1000).toISOString(),
            }))
          }
        }
      } catch (error) {
        console.warn('Finnhub API failed:', error)
      }
    }

    // Fallback to mock data
    return getMockNews(ticker)
  } catch (error) {
    console.error('Error fetching news:', error)
    return getMockNews(ticker)
  }
}

/**
 * Get mock news for ticker
 */
function getMockNews(ticker: string): NewsItem[] {
  return MOCK_NEWS[ticker] || [
    {
      title: `Latest news about ${ticker}`,
      source: 'Financial News',
      url: '#',
      publishedAt: new Date().toISOString(),
    },
  ]
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const ticker = searchParams.get('ticker')

    if (!ticker) {
      return NextResponse.json(
        { error: 'Missing ticker parameter' },
        { status: 400 }
      )
    }

    const tickerUpper = ticker.trim().toUpperCase()
    const items = await fetchNews(tickerUpper)

    const response: NewsResponse = {
      ticker: tickerUpper,
      items: items.slice(0, 10), // Limit to 10 items
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in news API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

