import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { searchKB } from '@/lib/kb/search'

// Types
interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  ticker: string | null
  messages: ChatMessage[]
}

interface Source {
  type: 'kb' | 'quotes' | 'news'
  detail: string
}

interface ChatResponse {
  answer: string
  sources?: Source[]
}

// Initialize OpenAI client (lazy initialization)
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }
  
  // Verify API key format
  const apiKey = process.env.OPENAI_API_KEY.trim()
  if (!apiKey.startsWith('sk-')) {
    console.warn('Warning: API key format may be incorrect')
  }
  
  return new OpenAI({
    apiKey: apiKey,
    timeout: 20000, // Increased to 20 second timeout
    maxRetries: 1, // Reduced retries to avoid long waits
  })
}

/**
 * Detect user intent from message
 */
function detectIntent(message: string): {
  needsQuotes: boolean
  needsNews: boolean
  needsKB: boolean
} {
  const lowerMessage = message.toLowerCase()
  
  // Market data keywords
  const marketKeywords = ['price', 'today', 'move', 'why', 'news', 'happened', 'change', 'trading', 'current']
  const needsQuotes = marketKeywords.some(keyword => lowerMessage.includes(keyword))
  const needsNews = ['news', 'happened', 'announcement', 'update'].some(keyword => lowerMessage.includes(keyword))
  
  // Definition/explanation keywords
  const definitionKeywords = ['explain', 'what is', 'define', 'how does', 'what are', 'tell me about']
  const needsKB = definitionKeywords.some(keyword => lowerMessage.includes(keyword))
  
  return {
    needsQuotes: needsQuotes || needsNews,
    needsNews,
    needsKB: needsKB || !needsQuotes, // Default to KB if not clearly a market question
  }
}

/**
 * Fetch quotes data
 */
async function fetchQuotes(ticker: string | null, baseUrl: string): Promise<any> {
  try {
    const symbols = ticker ? [ticker] : ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'SPY', 'QQQ']
    const symbolsParam = symbols.join(',')
    
    const url = `${baseUrl}/api/quotes?symbols=${symbolsParam}`
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error fetching quotes:', error)
  }
  return null
}

/**
 * Fetch news data
 */
async function fetchNews(ticker: string | null, baseUrl: string): Promise<any> {
  try {
    const symbol = ticker || 'AAPL'
    
    const url = `${baseUrl}/api/news?ticker=${symbol}`
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Error fetching news:', error)
  }
  return null
}

/**
 * Build system prompt for finance assistant with context
 */
function buildSystemPrompt(
  ticker: string | null,
  kbContext: string[],
  quotesData: any,
  newsData: any
): string {
  let prompt = "You are a finance assistant. Be factual and do not provide financial advice.\n\n"
  
  if (ticker) {
    prompt += `The user is currently viewing information about ${ticker}. You can reference this ticker in your responses if relevant.\n\n`
  }
  
  // Add KB context
  if (kbContext.length > 0) {
    prompt += "## Knowledge Base Context:\n"
    kbContext.forEach((snippet, index) => {
      prompt += `${index + 1}. ${snippet}\n\n`
    })
  }
  
  // Add quotes context
  if (quotesData?.quotes && quotesData.quotes.length > 0) {
    prompt += "## Current Market Data:\n"
    quotesData.quotes.forEach((quote: any) => {
      prompt += `- ${quote.symbol}: $${quote.price.toFixed(2)} (${quote.changePct > 0 ? '+' : ''}${quote.changePct.toFixed(2)}%)\n`
    })
    prompt += "\n"
  }
  
  // Add news context
  if (newsData?.articles && newsData.articles.length > 0) {
    prompt += "## Recent News:\n"
    newsData.articles.slice(0, 3).forEach((article: any, index: number) => {
      prompt += `${index + 1}. ${article.title} (${article.source})\n`
    })
    prompt += "\n"
  }
  
  prompt += "## Instructions:\n"
  prompt += "- Answer questions clearly and concisely using the provided context.\n"
  prompt += "- If you reference information from the knowledge base, market data, or news, mention it naturally in your response.\n"
  prompt += "- Always end your response with a 'Sources' section listing what you used:\n"
  prompt += "  - Knowledge Base: [topic/file]\n"
  prompt += "  - Market Data: [symbols]\n"
  prompt += "  - News: [headlines]\n"
  prompt += "- If you don't know something, say so.\n"
  prompt += "- Do not provide financial advice."
  
  return prompt
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  // Development fallback mode if network can't reach OpenAI
  const USE_MOCK_MODE = process.env.USE_MOCK_CHAT === 'true'
  
  try {
    // Check for API key
    if (!process.env.OPENAI_API_KEY && !USE_MOCK_MODE) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Mock mode for development when network is blocked
    if (USE_MOCK_MODE) {
      const body: ChatRequest = await request.json()
      const { messages } = body
      const lastMessage = messages[messages.length - 1]?.content || ''
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate a mock response based on the question
      const question = lastMessage.toLowerCase()
      let mockAnswer = ""
      
      if (question.includes('p/e') || question.includes('price to earnings') || question.includes('price-to-earnings')) {
        mockAnswer = "P/E ratio (Price-to-Earnings) is a valuation metric calculated by dividing a company's stock price by its earnings per share. It helps investors assess if a stock is overvalued or undervalued. A lower P/E ratio might indicate a better value, but context matters - compare it to industry averages."
      } else if (question.includes('etf') || question.includes('exchange-traded fund')) {
        mockAnswer = "An ETF (Exchange-Traded Fund) is a type of investment fund that holds a collection of assets like stocks, bonds, or commodities. ETFs trade on stock exchanges like individual stocks, providing diversification and liquidity. They typically have lower fees than mutual funds."
      } else if (question.includes('market cap') || question.includes('market capitalization')) {
        mockAnswer = "Market capitalization is the total value of a company's outstanding shares, calculated by multiplying the current stock price by the total number of shares. It's used to categorize companies as large-cap, mid-cap, or small-cap."
      } else if (question.includes('dividend')) {
        mockAnswer = "A dividend is a payment made by a corporation to its shareholders, usually as a distribution of profits. Dividends are typically paid quarterly and can provide a steady income stream for investors."
      } else if (question.includes('volatility')) {
        mockAnswer = "Volatility measures how much a stock's price fluctuates over time. Higher volatility means larger price swings, which can indicate higher risk but also potential for higher returns."
      } else if (question.includes('what is') || question.includes('explain') || question.includes('define')) {
        mockAnswer = `I understand you're asking about "${lastMessage}". In a production environment with network access to OpenAI's API, I would provide a comprehensive answer. Currently, I'm in mock mode due to network connectivity issues. The chat functionality is working correctly - you just need network access to OpenAI's API for real responses.`
      } else {
        mockAnswer = `You asked: "${lastMessage}". I'm currently in mock mode because the network cannot reach OpenAI's API. The chat system is working correctly - once network access to OpenAI is available, you'll get real AI-powered responses. For now, try asking about financial concepts like "What is P/E ratio?" or "Explain ETFs" for sample responses.`
      }
      
      return NextResponse.json({ answer: mockAnswer })
    }

    const body: ChatRequest = await request.json()
    const { ticker, messages } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid messages array' },
        { status: 400 }
      )
    }

    // Get base URL from request
    const url = new URL(request.url)
    const baseUrl = `${url.protocol}//${url.host}`

    // Get last user message for intent detection
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .slice(-1)[0]?.content || ''
    
    // Detect intent
    const intent = detectIntent(lastUserMessage)
    console.log(`[Chat API] Intent detected:`, intent)

    // Gather context based on intent
    const sources: Source[] = []
    let kbContext: string[] = []
    let quotesData: any = null
    let newsData: any = null

    // Fetch KB context for definition questions
    if (intent.needsKB) {
      try {
        const kbResults = await searchKB(lastUserMessage, 3)
        kbContext = kbResults.map(result => {
          sources.push({
            type: 'kb',
            detail: result.filename.replace('.md', ''),
          })
          return result.content.substring(0, 500) // Limit context length
        })
        console.log(`[Chat API] Retrieved ${kbResults.length} KB snippets`)
      } catch (error) {
        console.error('[Chat API] Error retrieving KB:', error)
        // Continue without KB context
      }
    }

    // Fetch quotes for market questions
    if (intent.needsQuotes) {
      quotesData = await fetchQuotes(ticker, baseUrl)
      if (quotesData?.quotes) {
        const symbols = quotesData.quotes.map((q: any) => q.symbol).join(', ')
        sources.push({
          type: 'quotes',
          detail: symbols,
        })
        console.log(`[Chat API] Fetched quotes for: ${symbols}`)
      }
    }

    // Fetch news for market questions
    if (intent.needsNews) {
      newsData = await fetchNews(ticker, baseUrl)
      if (newsData?.articles && newsData.articles.length > 0) {
        const headlines = newsData.articles.slice(0, 3).map((a: any) => a.title).join('; ')
        sources.push({
          type: 'news',
          detail: headlines.substring(0, 200), // Limit detail length
        })
        console.log(`[Chat API] Fetched ${newsData.articles.length} news articles`)
      }
    }

    // Limit message history to avoid very long requests
    const recentMessages = messages.slice(-10) // Only last 10 messages

    // Build messages array for OpenAI with context
    const systemPrompt = buildSystemPrompt(ticker, kbContext, quotesData, newsData)
    const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...recentMessages.map((msg) => ({
        role: msg.role,
        content: msg.content.substring(0, 2000), // Limit message length
      })) as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    ]

    console.log(`[Chat API] Starting request with ${openaiMessages.length} messages, ${sources.length} sources`)

    // Initialize OpenAI client and call API
    const openai = getOpenAIClient()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 500, // Increased for more detailed responses with sources
    })
    
    const elapsed = Date.now() - startTime
    console.log(`[Chat API] Request completed in ${elapsed}ms`)

    const answer = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    const response: ChatResponse = {
      answer,
      sources: sources.length > 0 ? sources : undefined,
    }

    return NextResponse.json(response)
  } catch (error) {
    const elapsed = Date.now() - startTime
    console.error(`[Chat API] Error after ${elapsed}ms:`, error)

    // Handle timeout errors
    if (error instanceof Error && (error.message.includes('timed out') || error.message.includes('timeout'))) {
      return NextResponse.json(
        { error: `Request timed out after ${elapsed}ms. This may be due to network issues or API slowness. Please try again.` },
        { status: 504 }
      )
    }

    // Handle OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      // Check for specific error types
      if (error.status === 401 || error.status === 403) {
        return NextResponse.json(
          { error: 'Invalid API key. Please check your OpenAI API key configuration.' },
          { status: error.status }
        )
      }
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again in a moment.' },
          { status: error.status }
        )
      }
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 }
      )
    }

    // Handle network errors
    if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('network'))) {
      return NextResponse.json(
        { error: 'Network error. Please check your internet connection and try again.' },
        { status: 503 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

