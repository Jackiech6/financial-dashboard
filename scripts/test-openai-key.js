/**
 * Simple script to test OpenAI API key
 * Run with: node scripts/test-openai-key.js
 */

require('dotenv').config({ path: '.env.local' })

async function testOpenAIKey() {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in .env.local')
    process.exit(1)
  }
  
  console.log('✅ API Key found')
  console.log(`   Key starts with: ${apiKey.substring(0, 10)}...`)
  console.log(`   Key length: ${apiKey.length} characters`)
  
  try {
    const OpenAI = require('openai')
    const openai = new OpenAI({
      apiKey: apiKey.trim(),
      timeout: 10000, // 10 second timeout for test
    })
    
    console.log('\n🔄 Testing API connection...')
    console.log('   This may take a few seconds...')
    
    const startTime = Date.now()
    
    // Try with a very simple, fast request
    const completion = await Promise.race([
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: 'Hi' }
        ],
        max_tokens: 5,
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Test timeout after 10 seconds')), 10000)
      )
    ])
    
    const elapsed = Date.now() - startTime
    const response = completion.choices[0]?.message?.content
    
    console.log(`✅ API test successful! (${elapsed}ms)`)
    console.log(`   Response: ${response}`)
    console.log('\n✅ Your API key is working correctly!')
    
  } catch (error) {
    console.error('\n❌ API test failed:')
    console.error(`   Error: ${error.message}`)
    
    if (error.status === 401 || error.status === 403) {
      console.error('\n⚠️  This looks like an authentication error.')
      console.error('   Please check that your API key is correct and active.')
    } else if (error.message.includes('timeout')) {
      console.error('\n⚠️  Request timed out.')
      console.error('   This might be a network issue. Try again later.')
    } else {
      console.error('\n⚠️  Unexpected error. Check your network connection.')
    }
    
    process.exit(1)
  }
}

testOpenAIKey()

