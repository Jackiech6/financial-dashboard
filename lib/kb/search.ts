import OpenAI from 'openai'
import { loadEmbeddings, KBFile } from './load'

export interface SearchResult {
  filename: string
  content: string
  score: number
  excerpt: string
}

// Initialize OpenAI client (lazy)
let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (openaiClient) {
    return openaiClient
  }
  
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required')
  }
  
  openaiClient = new OpenAI({
    apiKey: apiKey.trim(),
    timeout: 60000,
  })
  
  return openaiClient
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  const denominator = Math.sqrt(normA) * Math.sqrt(normB)
  if (denominator === 0) {
    return 0
  }
  
  return dotProduct / denominator
}

/**
 * Generate embedding for a query string
 */
async function embedQuery(query: string): Promise<number[]> {
  const openai = getOpenAIClient()
  
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  })
  
  return response.data[0].embedding
}

/**
 * Extract excerpt from content (first 200 characters)
 */
function getExcerpt(content: string, maxLength: number = 200): string {
  if (content.length <= maxLength) {
    return content
  }
  
  // Try to break at a sentence or word boundary
  const truncated = content.substring(0, maxLength)
  const lastPeriod = truncated.lastIndexOf('.')
  const lastSpace = truncated.lastIndexOf(' ')
  
  if (lastPeriod > maxLength * 0.7) {
    return truncated.substring(0, lastPeriod + 1)
  }
  
  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + '...'
  }
  
  return truncated + '...'
}

/**
 * Search the knowledge base for relevant content
 * Returns top N results sorted by similarity score
 */
export async function searchKB(
  query: string,
  topK: number = 3
): Promise<SearchResult[]> {
  const startTime = Date.now()
  
  // Load embeddings
  const embeddingsData = loadEmbeddings()
  
  // Generate query embedding
  const queryEmbedding = await embedQuery(query)
  
  // Calculate similarity scores
  const results: SearchResult[] = embeddingsData.files.map(file => {
    const score = cosineSimilarity(queryEmbedding, file.embedding)
    return {
      filename: file.filename,
      content: file.content,
      score,
      excerpt: getExcerpt(file.content),
    }
  })
  
  // Sort by score (descending) and take top K
  results.sort((a, b) => b.score - a.score)
  const topResults = results.slice(0, topK)
  
  const elapsed = Date.now() - startTime
  console.log(`[KB Search] Query: "${query}" - Found ${topResults.length} results in ${elapsed}ms`)
  
  return topResults
}

