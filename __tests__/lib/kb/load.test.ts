import { loadEmbeddings, clearCache, EmbeddingsData } from '@/lib/kb/load'
import * as fs from 'fs'
import * as path from 'path'

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}))

describe('loadEmbeddings', () => {
  beforeEach(() => {
    clearCache()
    jest.clearAllMocks()
  })

  it('should load embeddings from JSON file', () => {
    const mockEmbeddings: EmbeddingsData = {
      files: [
        {
          filename: 'test.md',
          content: 'Test content',
          embedding: [0.1, 0.2, 0.3],
        },
      ],
      generatedAt: '2024-01-01T00:00:00.000Z',
    }

    ;(fs.existsSync as jest.Mock).mockReturnValue(true)
    ;(fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockEmbeddings))

    const result = loadEmbeddings()

    expect(result).toEqual(mockEmbeddings)
    expect(fs.existsSync).toHaveBeenCalledWith(
      expect.stringContaining('kb_embeddings.json')
    )
    expect(fs.readFileSync).toHaveBeenCalledWith(
      expect.stringContaining('kb_embeddings.json'),
      'utf-8'
    )
  })

  it('should cache embeddings after first load', () => {
    const mockEmbeddings: EmbeddingsData = {
      files: [],
      generatedAt: '2024-01-01T00:00:00.000Z',
    }

    ;(fs.existsSync as jest.Mock).mockReturnValue(true)
    ;(fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockEmbeddings))

    const result1 = loadEmbeddings()
    const result2 = loadEmbeddings()

    expect(result1).toBe(result2) // Same reference due to caching
    expect(fs.readFileSync).toHaveBeenCalledTimes(1) // Only called once
  })

  it('should throw error if embeddings file does not exist', () => {
    ;(fs.existsSync as jest.Mock).mockReturnValue(false)

    expect(() => loadEmbeddings()).toThrow('Embeddings file not found')
  })

  it('should throw error if embeddings file is invalid JSON', () => {
    ;(fs.existsSync as jest.Mock).mockReturnValue(true)
    ;(fs.readFileSync as jest.Mock).mockReturnValue('invalid json')

    expect(() => loadEmbeddings()).toThrow('Failed to load embeddings')
  })

  it('should throw error if embeddings file has invalid format', () => {
    ;(fs.existsSync as jest.Mock).mockReturnValue(true)
    ;(fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({ invalid: 'format' }))

    expect(() => loadEmbeddings()).toThrow('Invalid embeddings file format')
  })

  it('should clear cache when clearCache is called', () => {
    const mockEmbeddings: EmbeddingsData = {
      files: [],
      generatedAt: '2024-01-01T00:00:00.000Z',
    }

    ;(fs.existsSync as jest.Mock).mockReturnValue(true)
    ;(fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockEmbeddings))

    loadEmbeddings()
    clearCache()
    loadEmbeddings()

    expect(fs.readFileSync).toHaveBeenCalledTimes(2) // Called twice after cache clear
  })
})

