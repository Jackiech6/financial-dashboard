import * as fs from 'fs'
import * as path from 'path'

export interface KBFile {
  filename: string
  content: string
  embedding: number[]
}

export interface EmbeddingsData {
  files: KBFile[]
  generatedAt: string
}

let cachedEmbeddings: EmbeddingsData | null = null

/**
 * Load embeddings from JSON file
 * Uses caching to avoid repeated file reads
 */
export function loadEmbeddings(): EmbeddingsData {
  if (cachedEmbeddings) {
    return cachedEmbeddings
  }
  
  const embeddingsPath = path.join(process.cwd(), 'data', 'kb_embeddings.json')
  
  if (!fs.existsSync(embeddingsPath)) {
    throw new Error(`Embeddings file not found: ${embeddingsPath}. Please run the generate-embeddings script first.`)
  }
  
  try {
    const fileContent = fs.readFileSync(embeddingsPath, 'utf-8')
    cachedEmbeddings = JSON.parse(fileContent) as EmbeddingsData
    
    if (!cachedEmbeddings.files || !Array.isArray(cachedEmbeddings.files)) {
      throw new Error('Invalid embeddings file format')
    }
    
    return cachedEmbeddings
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load embeddings: ${error.message}`)
    }
    throw error
  }
}

/**
 * Clear the cached embeddings (useful for testing or reloading)
 */
export function clearCache(): void {
  cachedEmbeddings = null
}

