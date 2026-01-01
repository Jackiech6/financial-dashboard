'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Source {
  type: 'kb' | 'quotes' | 'news'
  detail: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
}

interface ChatProps {
  ticker?: string | null
}

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: "Hello! I'm your Finance Copilot. Ask me anything about the markets, stocks, or financial concepts. Try the suggestions below or ask your own question!",
}

const PROMPT_SUGGESTIONS = [
  "What is P/E ratio?",
  "Explain ETFs",
  "What is market cap?",
  "What happened to AAPL today?",
]

export function Chat({ ticker }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current?.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = async () => {
    const trimmedInput = input.trim()
    if (!trimmedInput || isLoading) return

    // Validate input length
    if (trimmedInput.length > 2000) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Message is too long. Please keep it under 2000 characters.',
      }
      setMessages((prev) => [...prev, errorMessage])
      return
    }

    const userMessage: Message = {
      role: 'user',
      content: trimmedInput,
    }

    // Add user message immediately and get updated messages for API call
    let updatedMessages: Message[] = []
    setMessages((prev) => {
      updatedMessages = [...prev, userMessage]
      return updatedMessages
    })
    
    setInput('')
    setIsLoading(true)

    try {
      // Call chat API with updated messages
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticker,
          messages: updatedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer || 'Sorry, I could not generate a response.',
        sources: data.sources,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      
      let errorContent = 'Sorry, an error occurred. Please try again.'
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()
        
        if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
          errorContent = 'The request timed out. This might be due to network issues or the API taking too long. Please try again with a shorter question.'
        } else if (errorMessage.includes('api key') || errorMessage.includes('401') || errorMessage.includes('403')) {
          errorContent = 'API key error. Please check your OpenAI API key configuration in .env.local'
        } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
          errorContent = 'Rate limit exceeded. Please wait a moment and try again.'
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          errorContent = 'Network error. Please check your internet connection and try again.'
        } else {
          errorContent = `Error: ${error.message}. If this persists, please check your API key configuration.`
        }
      }
      
      const errorMessage: Message = {
        role: 'assistant',
        content: errorContent,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer || 'Sorry, I could not generate a response.',
        sources: data.sources,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      
      let errorContent = 'Sorry, an error occurred. Please try again.'
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase()
        
        if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
          errorContent = 'The request timed out. This might be due to network issues or the API taking too long. Please try again with a shorter question.'
        } else if (errorMessage.includes('api key') || errorMessage.includes('401') || errorMessage.includes('403')) {
          errorContent = 'API key error. Please check your OpenAI API key configuration in .env.local'
        } else if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
          errorContent = 'Rate limit exceeded. Please wait a moment and try again.'
        } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          errorContent = 'Network error. Please check your internet connection and try again.'
        } else {
          errorContent = `Error: ${error.message}. If this persists, please check your API key configuration.`
        }
      }
      
      const errorMessage: Message = {
        role: 'assistant',
        content: errorContent,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="flex h-[600px] flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle>Finance Copilot Chat</CardTitle>
        {ticker && (
          <p className="text-xs text-muted-foreground">
            Active ticker: {ticker}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden p-4">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto rounded-lg border bg-muted/30 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex w-full',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-4 py-2',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border text-foreground'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Sources:</p>
                      <div className="space-y-1">
                        {message.sources.map((source, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground">
                            <span className="font-medium capitalize">{source.type}:</span>{' '}
                            <span className="text-xs">
                              {source.type === 'kb' 
                                ? source.detail.replace(/_/g, ' ')
                                : source.detail.length > 100 
                                  ? source.detail.substring(0, 100) + '...'
                                  : source.detail
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-background border px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Prompt Suggestions */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 px-4">
            {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInput(suggestion)
                  inputRef.current?.focus()
                }}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="flex-shrink-0 space-y-2">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about finance..."
              className="flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={2}
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="shrink-0"
              data-testid="send-button"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

