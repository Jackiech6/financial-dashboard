'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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

interface NewsPanelProps {
  ticker: string | null
}

export function NewsPanel({ ticker }: NewsPanelProps) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ticker) {
      setNews([])
      setError(null)
      return
    }

    const abortController = new AbortController()

    const fetchNews = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/news?ticker=${ticker}`, {
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error('Failed to fetch news')
        }

        const data: NewsResponse = await response.json()
        
        // Only update state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setNews(data.items || [])
        }
      } catch (err) {
        // Don't update state if request was aborted
        if (abortController.signal.aborted) {
          return
        }
        console.error('Error fetching news:', err)
        setError('Failed to load news. Using mock data.')
        // The API should return mock data on error, but if it doesn't,
        // we'll show an empty state
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchNews()

    // Cleanup: abort request if ticker changes or component unmounts
    return () => {
      abortController.abort()
    }
  }, [ticker])

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)

      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      } else {
        const diffMins = Math.floor(diffMs / (1000 * 60))
        return diffMins > 0 ? `${diffMins} minute${diffMins > 1 ? 's' : ''} ago` : 'Just now'
      }
    } catch {
      return 'Recently'
    }
  }

  if (!ticker) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>News Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a ticker from the watchlist to view news.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{ticker} News</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              Loading news...
            </span>
          </div>
        ) : news.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No news available for {ticker}
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item, index) => (
              <a
                key={index}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'block rounded-lg border p-4 transition-colors',
                  'hover:bg-muted/50 hover:border-primary/50',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <h3 className="font-medium leading-tight text-foreground">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.source}</span>
                      <span>•</span>
                      <span>{formatTime(item.publishedAt)}</span>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

