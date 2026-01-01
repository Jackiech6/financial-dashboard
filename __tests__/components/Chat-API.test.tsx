/**
 * Tests for Chat component API integration
 */

import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Chat } from '@/components/Chat'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch as jest.Mock

describe('Chat Component - API Integration', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  it('calls API when sending message', async () => {
    const user = userEvent.setup({ delay: null })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        answer: 'This is a test response from the API.',
      }),
    })

    await act(async () => {
      render(<Chat />)
    })

    const input = screen.getByPlaceholderText('Ask me anything about finance...')
    // Get the send button (last button, after prompt suggestions)
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons[buttons.length - 1]

    await act(async () => {
      await user.type(input, 'What is P/E ratio?')
      await user.click(sendButton)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }))
    })
  })

  it('sends ticker to API when provided', async () => {
    const user = userEvent.setup({ delay: null })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        answer: 'Test response',
      }),
    })

    await act(async () => {
      render(<Chat ticker="AAPL" />)
    })

    const input = screen.getByPlaceholderText('Ask me anything about finance...')
    // Get the send button (last button, after prompt suggestions)
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons[buttons.length - 1]

    await act(async () => {
      await user.type(input, 'Test message')
      await user.click(sendButton)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled()
      const callArgs = mockFetch.mock.calls[0]
      const body = JSON.parse(callArgs[1].body)
      expect(body.ticker).toBe('AAPL')
    })
  })

  it('displays API response in chat', async () => {
    const user = userEvent.setup({ delay: null })
    const apiResponse = 'This is the API response.'
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        answer: apiResponse,
      }),
    })

    await act(async () => {
      render(<Chat />)
    })

    const input = screen.getByPlaceholderText('Ask me anything about finance...')
    // Get the send button (last button, after prompt suggestions)
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons[buttons.length - 1]

    await act(async () => {
      await user.type(input, 'Test question')
      await user.click(sendButton)
    })

    await waitFor(() => {
      expect(screen.getByText(apiResponse)).toBeInTheDocument()
    })
  })

  it('displays error message when API fails', async () => {
    const user = userEvent.setup({ delay: null })
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await act(async () => {
      render(<Chat />)
    })

    const input = screen.getByPlaceholderText('Ask me anything about finance...')
    // Get the send button (last button, after prompt suggestions)
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons[buttons.length - 1]

    await act(async () => {
      await user.type(input, 'Test question')
      await user.click(sendButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument()
    })
  })

  it('displays error message when API returns error', async () => {
    const user = userEvent.setup({ delay: null })
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'API key not configured',
      }),
    })

    await act(async () => {
      render(<Chat />)
    })

    const input = screen.getByPlaceholderText('Ask me anything about finance...')
    // Get the send button (last button, after prompt suggestions)
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons[buttons.length - 1]

    await act(async () => {
      await user.type(input, 'Test question')
      await user.click(sendButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/Error:/i)).toBeInTheDocument()
    })
  })

  it('sends all messages in conversation to API', async () => {
    const user = userEvent.setup({ delay: null })
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          answer: 'First response',
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          answer: 'Second response',
        }),
      })

    await act(async () => {
      render(<Chat />)
    })

    const input = screen.getByPlaceholderText('Ask me anything about finance...')
    // Get the send button (last button, after prompt suggestions)
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons[buttons.length - 1]

    // Send first message
    await act(async () => {
      await user.type(input, 'First question')
      await user.click(sendButton)
    })

    await waitFor(() => {
      expect(screen.getByText('First response')).toBeInTheDocument()
    })

    // Send second message
    await act(async () => {
      await user.type(input, 'Second question')
      await user.click(sendButton)
    })

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2)
      const secondCall = mockFetch.mock.calls[1]
      const body = JSON.parse(secondCall[1].body)
      // Should include welcome message, first user message, first assistant response, and second user message
      expect(body.messages.length).toBeGreaterThanOrEqual(3)
    })
  })

  it('handles empty API response gracefully', async () => {
    const user = userEvent.setup({ delay: null })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        answer: '',
      }),
    })

    await act(async () => {
      render(<Chat />)
    })

    const input = screen.getByPlaceholderText('Ask me anything about finance...')
    // Get the send button (last button, after prompt suggestions)
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons[buttons.length - 1]

    await act(async () => {
      await user.type(input, 'Test question')
      await user.click(sendButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/Sorry, I could not generate a response/i)).toBeInTheDocument()
    })
  })
})

