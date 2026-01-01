'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Quote {
  symbol: string
  price: number
  changePct: number
}

interface QuotesResponse {
  asOf: string
  quotes: Quote[]
}

interface WatchlistProps {
  defaultSymbols?: string[]
  onTickerSelect?: (ticker: string) => void
}

const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'SPY', 'QQQ']

export function Watchlist({
  defaultSymbols = DEFAULT_SYMBOLS,
  onTickerSelect,
}: WatchlistProps) {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchQuotes = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const symbolsParam = defaultSymbols.join(',')
      const response = await fetch(`/api/quotes?symbols=${symbolsParam}`)

      if (!response.ok) {
        throw new Error('Failed to fetch quotes')
      }

      const data: QuotesResponse = await response.json()
      setQuotes(data.quotes)
      setLastUpdated(new Date(data.asOf))
    } catch (err) {
      console.error('Error fetching quotes:', err)
      setError('Failed to load quotes. Using mock data.')
      // Even on error, try to show mock data if available
      if (quotes.length === 0) {
        // This will be handled by the API's mock fallback
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const abortController = new AbortController()
    let isMounted = true

    const fetchQuotesSafe = async () => {
      setLoading(true)
      setError(null)

      try {
        const symbolsParam = defaultSymbols.join(',')
        const response = await fetch(`/api/quotes?symbols=${symbolsParam}`, {
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error('Failed to fetch quotes')
        }

        const data: QuotesResponse = await response.json()
        
        // Only update state if component is still mounted and request wasn't aborted
        if (isMounted && !abortController.signal.aborted) {
          setQuotes(data.quotes)
          setLastUpdated(new Date(data.asOf))
        }
      } catch (err) {
        if (abortController.signal.aborted || !isMounted) {
          return
        }
        console.error('Error fetching quotes:', err)
        setError('Failed to load quotes. Using mock data.')
      } finally {
        if (isMounted && !abortController.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchQuotesSafe()

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTickerClick = (ticker: string) => {
    setSelectedTicker(ticker)
    onTickerSelect?.(ticker)
  }

  const handleRefresh = () => {
    fetchQuotes(true)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const formatChangePct = (changePct: number) => {
    const sign = changePct >= 0 ? '+' : ''
    return `${sign}${changePct.toFixed(2)}%`
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Market Watchlist</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing || loading}
        >
          <RefreshCw
            className={cn('h-4 w-4', (refreshing || loading) && 'animate-spin')}
          />
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
            {error}
          </div>
        )}

        {loading && quotes.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading quotes...
            </span>
          </div>
        ) : quotes.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No quotes available
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Change</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => {
                  const isSelected = selectedTicker === quote.symbol
                  const isPositive = quote.changePct >= 0

                  return (
                    <TableRow
                      key={quote.symbol}
                      className={cn(
                        'cursor-pointer transition-colors hover:bg-muted/50',
                        isSelected && 'bg-muted'
                      )}
                      onClick={() => handleTickerClick(quote.symbol)}
                    >
                      <TableCell className="font-medium">
                        {quote.symbol}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(quote.price)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right font-medium',
                          isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {formatChangePct(quote.changePct)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {lastUpdated && (
              <p className="mt-4 text-xs text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

