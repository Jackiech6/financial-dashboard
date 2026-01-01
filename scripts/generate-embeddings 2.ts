import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'

interface KBFile {
  filename: string
  content: string
  embedding: number[]
}

interface EmbeddingsData {
  files: KBFile[]
  generatedAt: string
}

// Initialize OpenAI client
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required')
  }
  
  return new OpenAI({
    apiKey: apiKey.trim(),
    timeout: 60000,
  })
}

// Read all markdown files from KB directory
function readKBFiles(): { filename: string; content: string }[] {
  const kbDir = path.join(process.cwd(), 'data', 'kb')
  
  if (!fs.existsSync(kbDir)) {
    throw new Error(`KB directory not found: ${kbDir}`)
  }
  
  const files = fs.readdirSync(kbDir).filter(file => file.endsWith('.md'))
  
  return files.map(filename => {
    const filePath = path.join(kbDir, filename)
    const content = fs.readFileSync(filePath, 'utf-8')
    return { filename, content }
  })
}

// Generate embedding for a single text
async function generateEmbedding(text: string, openai: OpenAI): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })
    
    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

// Main function
async function main() {
  console.log('Starting embedding generation...')
  
  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is required')
    process.exit(1)
  }
  
  // Read KB files
  console.log('Reading KB files...')
  const kbFiles = readKBFiles()
  console.log(`Found ${kbFiles.length} KB files`)
  
  // Initialize OpenAI client
  const openai = getOpenAIClient()
  
  // Generate embeddings
  const embeddingsData: EmbeddingsData = {
    files: [],
    generatedAt: new Date().toISOString(),
  }
  
  for (let i = 0; i < kbFiles.length; i++) {
    const { filename, content } = kbFiles[i]
    console.log(`Generating embedding for ${filename} (${i + 1}/${kbFiles.length})...`)
    
    try {
      const embedding = await generateEmbedding(content, openai)
      embeddingsData.files.push({
        filename,
        content,
        embedding,
      })
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`Error processing ${filename}:`, error)
      throw error
    }
  }
  
  // Save embeddings to JSON file
  const outputPath = path.join(process.cwd(), 'data', 'kb_embeddings.json')
  const outputDir = path.dirname(outputPath)
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(embeddingsData, null, 2))
  console.log(`\n✅ Embeddings saved to ${outputPath}`)
  console.log(`Generated ${embeddingsData.files.length} embeddings`)
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

