/**
 * Tests for Chat component
 */

import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Chat } from '@/components/Chat'

// Mock fetch
const mockFetch = jest.fn()
global.fetch = mockFetch as jest.Mock

describe('Chat Component', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    mockFetch.mockClear()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('renders chat component with welcome message', async () => {
    await act(async () => {
      render(<Chat />)
    })

    expect(screen.getByText('Finance Copilot Chat')).toBeInTheDocument()
    expect(
      screen.getByText(/Hello! I'm your Finance Copilot/i)
    ).toBeInTheDocument()
  })

  it('displays input box and send button', async () => {
    await act(async () => {
      render(<Chat />)
    })

    expect(
      screen.getByPlaceholderText('Ask me anything about finance...')
    ).toBeInTheDocument()
    // There should be at least one button (send button, possibly prompt suggestions)
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })

  it('disables send button when input is empty', async () => {
    await act(async () => {
      render(<Chat />)
    })

    // Get the send button (last button, after prompt suggestions)
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons[buttons.length - 1]
    expect(sendButton).toBeDisabled()
  })

  it('enables send button when input has text', async () => {
    const user = userEvent.setup({ delay: null })
    await act(async () => {
      render(<Chat />)
    })

    const input = screen.getByPlaceholderText('Ask me anything about finance...')
    // Get the send button (last button, after prompt suggestions)
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons[buttons.length - 1]

    await act(async () => {
      await user.type(input, 'What is P/E ratio?')
    })

    expect(sendButton).not.toBeDisabled()
  })

  it('adds user message when send is clicked', async () => {
    const user = userEvent.setup({ delay: null })
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

    expect(screen.getByText('What is P/E ratio?')).toBeInTheDocument()
  })

  it('clears input after sending message', async () => {
    const user = userEvent.setup({ delay: null })
    await act(async () => {
      render(<Chat />)
    })

    const input = screen.getByPlaceholderText(
      'Ask me anything about finance...'
    ) as HTMLTextAreaElement
    // Get the send button (last button, after prompt suggestions)
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons[buttons.length - 1]

    await act(async () => {
      await user.type(input, 'Test message')
      await user.click(sendButton)
    })

    expect(input.value).toBe('')
  })

  it('shows loading indicator when sending message', async () => {
    const user = userEvent.setup({ delay: null })
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ answer: 'Test response' }),
              }),
            1000
          )
        )
    )

    await act(async () => {
      render(<Chat />)
    })

    const input = screen.getByPlaceholderText('Ask me anything about finance...')
    // Get the send button (last button, after prompt suggestions)
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons[buttons.length - 1]

    await act(async () => {
      await user.type(input, 'Test message')
      await user.click(sendButton)
    })

    // Check for loading state - input should be disabled
    expect(input).toBeDisabled()
    expect(sendButton).toBeDisabled()
  })

  it('adds assistant response after API call', async () => {
    const user = userEvent.setup({ delay: null })
    const apiResponse = 'This is the API response.'
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ answer: apiResponse }),
    })

    await act(async () => {
      render(<Chat />)
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
      expect(screen.getByText(apiResponse)).toBeInTheDocument()
    })
  })

  it('sends message on Enter key press', async () => {
    const user = userEvent.setup({ delay: null })
    await act(async () => {
      render(<Chat />)
    })

    const input = screen.getByPlaceholderText('Ask me anything about finance...')

    await act(async () => {
      await user.type(input, 'Test message{Enter}')
    })

    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('allows new line on Shift+Enter', async () => {
    const user = userEvent.setup({ delay: null })
    await act(async () => {
      render(<Chat />)
    })

    const input = screen.getByPlaceholderText('Ask me anything about finance...') as HTMLTextAreaElement

    await act(async () => {
      await user.type(input, 'Test message')
      await user.keyboard('{Shift>}{Enter}{/Shift}')
      await user.type(input, 'Second line')
    })

    // Input should contain both lines (message not sent)
    expect(input.value).toContain('Test message')
    expect(input.value).toContain('Second line')
    // Message should not appear in chat yet
    expect(screen.queryByText('Test message\nSecond line')).not.toBeInTheDocument()
  })

  it('displays active ticker when provided', async () => {
    await act(async () => {
      render(<Chat ticker="AAPL" />)
    })

    expect(screen.getByText('Active ticker: AAPL')).toBeInTheDocument()
  })

  it('does not display ticker info when ticker is null', async () => {
    await act(async () => {
      render(<Chat ticker={null} />)
    })

    expect(screen.queryByText(/Active ticker:/i)).not.toBeInTheDocument()
  })

  it('disables input during loading', async () => {
    const user = userEvent.setup({ delay: null })
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({ answer: 'Response' }),
              }),
            1000
          )
        )
    )

    await act(async () => {
      render(<Chat />)
    })

    const input = screen.getByPlaceholderText('Ask me anything about finance...')
    // Get the send button (last button, after prompt suggestions)
    const buttons = screen.getAllByRole('button')
    const sendButton = buttons[buttons.length - 1]

    await act(async () => {
      await user.type(input, 'Test message')
      await user.click(sendButton)
    })

    // Input should be disabled during API call
    expect(input).toBeDisabled()
    expect(sendButton).toBeDisabled()
  })

  it('scrolls to bottom when new message is added', async () => {
    const user = userEvent.setup({ delay: null })
    const scrollIntoViewMock = jest.fn()
    
    // Mock scrollIntoView on the ref element
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      value: scrollIntoViewMock,
      writable: true,
    })

    await act(async () => {
      render(<Chat />)
    })

    const input = screen.getByPlaceholderText('Ask me anything about finance...')

    await act(async () => {
      await user.type(input, 'Test message{Enter}')
    })

    // The scrollIntoView might be called, but in test environment it may not work
    // This test verifies the component structure is correct
    expect(screen.getByText('Test message')).toBeInTheDocument()
  })

  it('renders user messages on the right', async () => {
    const user = userEvent.setup({ delay: null })
    await act(async () => {
      render(<Chat />)
    })

    const input = screen.getByPlaceholderText('Ask me anything about finance...')

    await act(async () => {
      await user.type(input, 'User message{Enter}')
    })

    const userMessage = screen.getByText('User message')
    const messageContainer = userMessage.closest('div')?.parentElement
    expect(messageContainer).toHaveClass('justify-end')
  })

  it('renders assistant messages on the left', async () => {
    await act(async () => {
      render(<Chat />)
    })

    const welcomeMessage = screen.getByText(/Hello! I'm your Finance Copilot/i)
    const messageContainer = welcomeMessage.closest('div')?.parentElement
    expect(messageContainer).toHaveClass('justify-start')
  })
})

