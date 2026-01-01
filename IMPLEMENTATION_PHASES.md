# Finance Copilot - Implementation Phases

## Overview
This document outlines a sequential implementation plan for the Finance Copilot web application. Each phase builds directly on the previous phase, creating a continuous timeline where you can implement one phase at a time with a working application at each step.

**Timeline:** ~155 minutes total (can be implemented incrementally)

---

## RAG Knowledge Base Architecture

### How It Works

The RAG (Retrieval-Augmented Generation) knowledge base in this application is **static and predefined** - it does NOT update automatically in real-time. Here's how it works:

#### 1. **Static Knowledge Base (Predefined)**
- **Location:** `data/kb/*.md` files (10-20 markdown files)
- **Content:** Curated finance explainers (e.g., "What is P/E ratio?", "How ETFs work")
- **Creation:** Manually created and committed to the repository
- **Updates:** Manual - you edit/add markdown files and regenerate embeddings

#### 2. **Pre-computed Embeddings (One-time Generation)**
- **Location:** `data/kb_embeddings.json`
- **Generation:** Run a script once to generate embeddings for all KB files
- **Storage:** Embeddings are saved to JSON and committed to the repo
- **Why:** Avoids regenerating embeddings on every deployment/request (faster, cheaper)

#### 3. **Runtime Retrieval (Phase 7)**
- When a user asks a question, the system:
  1. Embeds the user's query using OpenAI
  2. Loads pre-computed KB embeddings from JSON file
  3. Performs cosine similarity search
  4. Returns top 3 most relevant snippets
  5. Includes snippets in the LLM context

### Update Process (Manual)

To update the knowledge base:

1. **Add/Edit Markdown Files:**
   ```bash
   # Add new file
   echo "# What is Market Cap?\n\nMarket cap is..." > data/kb/market_cap.md
   
   # Or edit existing file
   vim data/kb/pe_ratio.md
   ```

2. **Regenerate Embeddings:**
   ```bash
   # Run the generation script
   npm run generate-embeddings
   # or
   tsx scripts/generate-embeddings.ts
   ```

3. **Commit Changes:**
   ```bash
   git add data/kb/ data/kb_embeddings.json
   git commit -m "Update knowledge base"
   ```

### Why Static (Not Real-time)?

**Design Decision for Demo/Interview Context:**
- ✅ **Fast:** No embedding generation during requests (< 500ms retrieval)
- ✅ **Cost-effective:** Embeddings generated once, not per request
- ✅ **Reliable:** No dependency on embedding API during runtime
- ✅ **Simple:** Fits 45-60 minute demo timeline
- ✅ **Version-controlled:** KB changes are tracked in git

### Future Enhancement: Dynamic Updates

If you wanted real-time updates, you would need:

1. **Vector Database** (e.g., Pinecone, Weaviate, Chroma)
   - Store embeddings in a database
   - Support incremental updates
   - Handle versioning

2. **Update API Endpoint:**
   ```typescript
   POST /api/kb/update
   // Accept new markdown content
   // Generate embedding
   // Store in vector DB
   ```

3. **Scheduled Jobs or Webhooks:**
   - Periodically fetch new content
   - Auto-generate embeddings
   - Update vector database

**For this PRD:** Static approach is recommended for simplicity and speed.

---

## Phase 1: Project Foundation & Setup
**Duration:** ~15 minutes  
**Prerequisites:** None (starting point)  
**Builds On:** N/A  
**Next Phase:** Phase 2

### Goal
Establish the project structure, dependencies, and development environment.

### Scope
- Initialize Next.js 14+ project with App Router
- Configure TypeScript
- Set up Tailwind CSS
- Install and configure shadcn/ui (at least Button, Card, Table components)
- Create environment variables template (.env.example)
- Set up project structure:
  - `app/` - Next.js app directory
  - `app/api/` - API routes
  - `lib/` - Utility functions
  - `data/` - Static data files
  - `components/` - React components
- Create initial README with setup instructions

### Deliverables
- ✅ Working Next.js app that runs locally
- ✅ Tailwind CSS configured and working
- ✅ shadcn/ui components accessible
- ✅ Project folder structure in place
- ✅ Environment variables documented in .env.example

### Acceptance Criteria
- `npm run dev` starts without errors
- Can import and render a shadcn/ui component (e.g., Button)
- TypeScript compilation succeeds
- Basic page renders at `http://localhost:3000`

### Handoff to Phase 2
After Phase 1, you have a working Next.js app ready to build features on top of.

---

## Phase 2: Market Dashboard - Quotes API & UI
**Duration:** ~20 minutes  
**Prerequisites:** Phase 1 complete  
**Builds On:** Next.js foundation, shadcn/ui components  
**Next Phase:** Phase 3

### Goal
Create the first working feature: a market watchlist that displays real-time stock quotes.

### Scope
- Implement `/api/quotes` route (`app/api/quotes/route.ts`)
  - Accept comma-separated symbols query parameter
  - Integrate with market data API (Yahoo Finance via yfinance or alternative)
  - Return structured JSON response: `{ asOf, quotes: [{ symbol, price, changePct }] }`
  - Add error handling with fallback to mock data
- Build watchlist UI component (`components/Watchlist.tsx`)
  - Table/list showing: symbol, price, changePct, timestamp
  - Click handler to set active ticker (use React state)
  - Visual indicators for positive/negative changes (green/red)
  - Refresh button that calls API
- Create main dashboard layout (`app/page.tsx`)
  - Left column for watchlist
  - Right column placeholder (for future news and chat)
  - Responsive grid layout
- Set default watchlist: AAPL, MSFT, NVDA, TSLA, AMZN, SPY, QQQ

### Deliverables
- ✅ `/api/quotes` endpoint working
- ✅ Watchlist component displaying 5-8 default tickers
- ✅ Click-to-select ticker functionality (state management)
- ✅ Auto-refresh button working
- ✅ Error handling with mock fallback
- ✅ Basic dashboard layout established

### Acceptance Criteria
- API returns quotes for multiple symbols
- Watchlist displays all default tickers
- Clicking a ticker updates application state (can verify in console/logs)
- Refresh button fetches new data
- Page loads in < 3 seconds
- Mock data works when API fails

### Handoff to Phase 3
After Phase 2, you have a working dashboard with market data. The active ticker state is ready to be used by the news panel.

---

## Phase 3: News Panel
**Duration:** ~15 minutes  
**Prerequisites:** Phase 2 complete  
**Builds On:** Dashboard layout, active ticker state from Phase 2  
**Next Phase:** Phase 4

### Goal
Add news headlines that update based on the selected ticker from Phase 2.

### Scope
- Implement `/api/news` route (`app/api/news/route.ts`)
  - Accept ticker query parameter
  - Integrate with news API (Finnhub or NewsAPI)
  - Return structured JSON response: `{ ticker, items: [{ title, source, url, publishedAt }] }`
  - Add error handling with fallback to mock data
- Build news panel UI component (`components/NewsPanel.tsx`)
  - List of 5-10 headlines
  - Display: title, source, published time, external link
  - Show loading state
  - Subscribe to active ticker changes from Phase 2
- Integrate into dashboard layout
  - Right column top section
  - Fetch news when ticker changes
  - Handle empty states

### Deliverables
- ✅ `/api/news` endpoint working
- ✅ News panel component displaying headlines
- ✅ External links functional (open in new tab)
- ✅ Updates automatically when ticker selected (uses Phase 2 state)
- ✅ Error handling with mock fallback

### Acceptance Criteria
- API returns news for a ticker
- News panel shows 5-10 headlines with all required fields
- Clicking a headline opens external link
- Panel updates when different ticker is selected (from Phase 2 watchlist)
- Loading states handled gracefully
- Mock data works when API fails

### Handoff to Phase 4
After Phase 3, you have a complete dashboard with market data and news. The layout is ready for the chat component.

---

## Phase 4: Basic Chat Interface
**Duration:** ~15 minutes  
**Prerequisites:** Phase 3 complete  
**Builds On:** Dashboard layout, existing right column structure from Phase 3  
**Next Phase:** Phase 5

### Goal
Add the chat UI component to the dashboard. Chat will be functional but not connected to backend yet.

### Scope
- Build chat UI component (`components/Chat.tsx`)
  - Message history display (scrollable container)
  - Input box with send button
  - Message bubbles (user vs assistant styling)
  - Loading indicator for pending messages
- Integrate into dashboard layout
  - Right column bottom section (below news panel)
  - Responsive sizing
- Implement local state management for messages
  - Use React state to store message array
  - Format: `[{ role: 'user' | 'assistant', content: string }]`
  - Add welcome message on mount
- Add basic styling and responsive design
  - Match existing dashboard aesthetic
  - Proper scrolling behavior

### Deliverables
- ✅ Chat component with message history
- ✅ Input and send functionality (local state only)
- ✅ Message rendering (user/assistant distinction)
- ✅ Responsive layout integrated into dashboard
- ✅ Welcome message displayed

### Acceptance Criteria
- Users can type and send messages
- Messages appear in chat history immediately
- UI is responsive and visually clear
- Chat area scrolls properly
- Welcome message shows on load
- Send button disabled when input is empty

### Handoff to Phase 5
After Phase 4, you have a complete UI with chat interface. The message state structure is ready to be connected to the backend API.

---

## Phase 5: Chat Backend - LLM Integration
**Duration:** ~20 minutes  
**Prerequisites:** Phase 4 complete  
**Builds On:** Chat UI component and message state from Phase 4  
**Next Phase:** Phase 6

### Goal
Make the chat functional by connecting it to OpenAI API. Chat will respond to user messages but without RAG or tools yet.

### Scope
- Implement `/api/chat` route (`app/api/chat/route.ts`)
  - Accept POST request with body: `{ ticker, messages: [{ role, content }] }`
  - Call OpenAI API (gpt-4o-mini) with basic system prompt
  - System prompt: "You are a finance assistant. Be factual and do not provide financial advice."
  - Return structured format: `{ answer: string }`
  - Add error handling
- Integrate chat API with frontend (`components/Chat.tsx`)
  - Send user messages to `/api/chat` on submit
  - Display assistant responses in chat
  - Handle loading states (show loading indicator)
  - Handle error states (display error message)
  - Pass current ticker from Phase 2 state to API
- Update message state management
  - Append user message immediately
  - Append assistant response after API call
  - Handle async flow properly

### Deliverables
- ✅ `/api/chat` endpoint working
- ✅ Chat sends messages and receives LLM responses
- ✅ Error handling in place
- ✅ Basic finance assistant behavior
- ✅ Loading and error states in UI

### Acceptance Criteria
- Chat can send messages and receive LLM responses
- Responses are displayed correctly in chat UI
- Errors are handled gracefully with user-friendly messages
- API latency is acceptable (< 5 seconds)
- Current ticker is passed to API (even if not used yet)
- Loading indicator shows during API call

### Handoff to Phase 6
After Phase 5, you have a functional chat that can answer questions. The API structure is ready to be enhanced with RAG and tools.

---

## Phase 6: RAG Knowledge Base Setup
**Duration:** ~25 minutes  
**Prerequisites:** Phase 5 complete  
**Builds On:** Existing project structure, ready to enhance chat API  
**Next Phase:** Phase 7

### Goal
Create the **static knowledge base infrastructure** that will be used by the enhanced chat in Phase 7. This is a **one-time setup** - the KB is predefined and does not update automatically.

### Scope
- Create knowledge base markdown files (10-20 files) - **Static, predefined content**
  - Topics: ETFs, CPI, P/E ratio, options basics, dividend yield, market cap, etc.
  - Store in `data/kb/` directory
  - Each file: short, focused explanation (200-500 words)
  - **Note:** These files are manually created and committed to the repo (not auto-updated)
- Implement embedding generation script (`scripts/generate-embeddings.ts`) - **One-time setup**
  - Use OpenAI text-embedding-3-small
  - Read all KB markdown files
  - Generate embeddings for each file
  - Save to `data/kb_embeddings.json` with metadata:
  - **Note:** Run this script once during setup, then commit the JSON file to the repo
    ```json
    {
      "files": [
        {
          "filename": "pe_ratio.md",
          "content": "...",
          "embedding": [...]
        }
      ]
    }
    ```
- Build retrieval system (`lib/kb/load.ts`, `lib/kb/search.ts`)
  - `load.ts`: Load embeddings from JSON file
  - `search.ts`: 
    - Embed user query
    - Implement cosine similarity search
    - Return top 3 snippets with filename and excerpt
- Test retrieval independently
  - Create simple test to verify search works
  - Verify embeddings file loads quickly

### Deliverables
- ✅ Knowledge base markdown files created (10-20 files)
- ✅ Embeddings generated and saved to JSON
- ✅ Retrieval function returning top 3 snippets
- ✅ Utilities for loading and searching KB
- ✅ Embeddings file committed to repo

### Acceptance Criteria
- KB contains 10-20 markdown files in `data/kb/`
- Embeddings file exists and is valid JSON
- Search function returns relevant top 3 snippets
- Retrieval completes in < 500ms
- Can test retrieval with sample queries

### Handoff to Phase 7
After Phase 6, you have a working knowledge base and retrieval system ready to be integrated into the chat API.

---

## Phase 7: Enhanced Chat - Tools & Sources
**Duration:** ~25 minutes  
**Prerequisites:** Phase 5 and Phase 6 complete  
**Builds On:** Chat API from Phase 5, RAG system from Phase 6, Quotes/News APIs from Phases 2-3  
**Next Phase:** Phase 8

### Goal
Transform the basic chat into an intelligent assistant that uses RAG, tools, and cites sources.

### Scope
- Enhance `/api/chat` route
  - Implement intent detection (simple heuristic):
    - If message contains: "price", "today", "move", "why", "news", "happened" → call quotes and news tools
    - If message contains: "explain", "what is", "define", "how does" → rely mainly on retrieval
  - Call retrieval for definition questions (use Phase 6 utilities)
  - Call quotes/news tools for "what happened" questions (reuse Phase 2-3 APIs)
  - Build grounded prompt with context bundle:
    - System prompt: Enhanced with instructions about citing sources
    - Context: Quotes JSON, News JSON, Retrieved snippets
    - Ask model to answer and include Sources section
  - Return structured format: `{ answer: string, sources: [{ type, detail }] }`
- Update chat UI (`components/Chat.tsx`)
  - Display sources section below each response
  - Format sources by type (quotes, news, kb)
  - Show which sources were used
  - Style sources section appropriately
- Refine system prompt for structured responses
  - Instruct model to format sources clearly
  - Ensure factual, no-advice tone

### Deliverables
- ✅ Chat uses retrieval for definition questions
- ✅ Chat calls tools (quotes/news) for market questions
- ✅ Responses include sources section
- ✅ Sources displayed in UI with proper formatting
- ✅ Intent detection working

### Acceptance Criteria
- Chat answers "What is P/E ratio?" using KB snippet (sources show kb type)
- Chat answers "What happened to AAPL today?" using quotes and news (sources show both)
- Each response includes a Sources section
- Sources are formatted appropriately in UI
- Intent detection routes questions correctly
- Mixed questions (e.g., "Explain P/E and what's AAPL price?") work

### Handoff to Phase 8
After Phase 7, you have a fully functional Finance Copilot with all core features. Ready for polish and deployment.

---

## Phase 8: Polish, Testing & Deployment
**Duration:** ~20 minutes  
**Prerequisites:** Phase 7 complete  
**Builds On:** Complete application from Phase 7  
**Next Phase:** Complete (production ready)

### Goal
Finalize the application, optimize performance, and deploy to production.

### Scope
- Performance optimization
  - Ensure page loads < 3 seconds
  - Optimize API calls (add caching if needed)
  - Add loading states everywhere (if missing)
  - Check bundle size
- Error handling improvements
  - User-friendly error messages throughout
  - Graceful degradation for all API failures
  - Network error handling
- Optional enhancements (if time permits)
  - Basic chart for selected ticker (1D or 5D using Recharts)
  - Prompt suggestion chips (e.g., "What is P/E ratio?", "What happened to AAPL?")
  - Risk disclaimer footer
- Deploy to Vercel
  - Set up Vercel project
  - Configure environment variables:
    - OPENAI_API_KEY
    - NEWS_API_KEY or FINNHUB_API_KEY
    - Optional QUOTES_API_KEY if needed
  - Configure build settings
  - Deploy and test deployed URL
- Final smoke tests
  - All acceptance criteria from PRD
  - Test all features in production
  - Verify environment variables work
- Update documentation
  - README with deployment instructions
  - Environment variables documented

### Deliverables
- ✅ Application deployed to Vercel
- ✅ All environment variables configured
- ✅ Performance targets met
- ✅ Optional enhancements (if completed)
- ✅ Documentation updated
- ✅ Production URL working

### Acceptance Criteria
- Deployed URL works correctly
- All features functional in production
- Page loads < 3 seconds
- All PRD acceptance tests pass:
  - Page loads under 3 seconds on first load
  - Clicking a ticker updates both quotes focus and news list
  - Chat can answer definition question using retrieved snippet
  - Chat can answer "what happened" question using tool called quotes and news
  - Each chat answer includes Sources section
- Environment variables properly set
- Error handling works in production

### Handoff
After Phase 8, you have a production-ready Finance Copilot application deployed and fully functional.

---

## Continuous Timeline Summary

```
Phase 1 (15 min) → Foundation
    ↓
Phase 2 (20 min) → Quotes API + Watchlist UI
    ↓
Phase 3 (15 min) → News API + News Panel
    ↓
Phase 4 (15 min) → Chat UI
    ↓
Phase 5 (20 min) → Chat LLM Integration
    ↓
Phase 6 (25 min) → Knowledge Base Setup
    ↓
Phase 7 (25 min) → Enhanced Chat with RAG & Tools
    ↓
Phase 8 (20 min) → Polish & Deploy
    ↓
Complete Application
```

**Total Time:** ~155 minutes (~2.5 hours)

Each phase produces a working, testable application that builds on the previous phase.

---

## Implementation Guidelines

### Working Incrementally
- **Stop and test after each phase** - Each phase produces a working application
- **Commit after each phase** - Makes it easy to roll back if needed
- **Verify acceptance criteria** - Don't proceed until current phase is complete

### State Management
- Phase 2 introduces active ticker state (used by Phase 3)
- Phase 4 introduces message state (used by Phase 5)
- Keep state management simple (React useState) until needed

### API Integration Order
1. **Phase 2:** Quotes API (external market data)
2. **Phase 3:** News API (external news data)
3. **Phase 5:** OpenAI API (LLM)
4. **Phase 6:** OpenAI Embeddings API (one-time generation)
5. **Phase 7:** Combines all APIs intelligently

### Testing Strategy
- Test each API endpoint independently before integrating
- Use mock data fallbacks to continue development if APIs fail
- Test in production environment (Phase 8) before considering complete

---

## Risk Mitigation Strategies

### API Failures
- **Mitigation:** Mock data fallbacks implemented in Phases 2 and 3
- **When:** During development if API keys unavailable
- **Testing:** Disable API keys to test fallback behavior

### LLM Latency
- **Mitigation:** Keep context small (top 3 snippets, top 5 headlines)
- **When:** Phase 5 and Phase 7
- **Testing:** Monitor response times, optimize prompts

### Embedding Generation Time
- **Mitigation:** Pre-compute embeddings in Phase 6 and commit to repo
- **When:** Phase 6 (one-time setup)
- **Testing:** Verify embeddings file loads quickly (< 100ms)

### Deployment Issues
- **Mitigation:** Test build locally before deploying (Phase 8)
- **When:** Phase 8
- **Testing:** Use `npm run build` locally, then Vercel preview deployments

---

## Success Metrics

### Performance
- ✅ Page load time < 3 seconds (tested in Phase 8)
- ✅ Chat response time < 5 seconds (tested in Phase 5 and 7)
- ✅ Retrieval completes in < 500ms (tested in Phase 6)

### Functionality
- ✅ All API endpoints return data or graceful errors
- ✅ Sources cited in every chat response (Phase 7)
- ✅ Application works in production environment (Phase 8)

### PRD Acceptance Tests (Phase 8)
- ✅ Page loads under 3 seconds on first load
- ✅ Clicking a ticker updates both quotes focus and news list
- ✅ Chat can answer definition question using retrieved snippet
- ✅ Chat can answer "what happened" question using tool called quotes and news
- ✅ Each chat answer includes Sources section
- ✅ Deployed URL works with environment variables set

---

## Deployment Guide

### Pre-Deployment Checklist

Before deploying, ensure you have:

- ✅ All phases completed and tested locally
- ✅ Application runs without errors (`npm run dev`)
- ✅ Build succeeds (`npm run build`)
- ✅ All API keys obtained:
  - OpenAI API key (required)
  - News API key (Finnhub or NewsAPI)
  - Quotes API key (if using paid service)
- ✅ Knowledge base embeddings generated and committed
- ✅ `.env.example` file created (without actual keys)
- ✅ README.md updated with setup instructions

### Step-by-Step: Deploy to Vercel

#### Option 1: Deploy via Vercel CLI (Recommended for First Time)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Navigate to project directory:**
   ```bash
   cd "/Users/chenjackie/Desktop/Financial Dashboard"
   ```

4. **Deploy:**
   ```bash
   vercel
   ```
   - Follow prompts:
     - "Set up and deploy? Yes"
     - "Which scope? [Your account]"
     - "Link to existing project? No"
     - "Project name? financial-dashboard" (or your choice)
     - "Directory? ./"
     - "Override settings? No"

5. **Set Environment Variables:**
   ```bash
   vercel env add OPENAI_API_KEY
   vercel env add NEWS_API_KEY
   # Or FINNHUB_API_KEY if using Finnhub
   # Add QUOTES_API_KEY if needed
   ```
   - Enter each value when prompted
   - Select "Production" environment for each

6. **Redeploy with environment variables:**
   ```bash
   vercel --prod
   ```

#### Option 2: Deploy via Vercel Dashboard (Easier for Updates)

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings

3. **Configure Environment Variables:**
   - In Vercel project dashboard → Settings → Environment Variables
   - Add each variable:
     - `OPENAI_API_KEY` = `your-openai-key`
     - `NEWS_API_KEY` = `your-news-api-key` (or `FINNHUB_API_KEY`)
     - `QUOTES_API_KEY` = `your-quotes-key` (if needed)
   - Select "Production", "Preview", and "Development" environments
   - Click "Save"

4. **Deploy:**
   - Vercel will automatically deploy
   - Or click "Redeploy" in the dashboard

### Environment Variables Reference

Create a `.env.example` file in your repo (never commit `.env.local`):

```env
# Required
OPENAI_API_KEY=sk-...

# News API (choose one)
NEWS_API_KEY=...
# OR
FINNHUB_API_KEY=...

# Optional (if using paid quotes API)
QUOTES_API_KEY=...
```

**In Vercel Dashboard:**
- Go to Project → Settings → Environment Variables
- Add each variable for Production, Preview, and Development
- Values are encrypted and never exposed in client code

### Build Configuration

Vercel auto-detects Next.js, but verify these settings:

**Build Command:** `npm run build` (default)  
**Output Directory:** `.next` (default)  
**Install Command:** `npm install` (default)  
**Node Version:** 18.x or 20.x (auto-detected)

If needed, create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### Post-Deployment Testing

1. **Visit your deployed URL:**
   - Format: `https://your-project-name.vercel.app`
   - Check that page loads < 3 seconds

2. **Test Features:**
   - ✅ Watchlist displays quotes
   - ✅ Click ticker updates news panel
   - ✅ News links open correctly
   - ✅ Chat sends messages
   - ✅ Chat receives LLM responses
   - ✅ Chat shows sources
   - ✅ Error handling works (test with invalid API keys)

3. **Check Logs:**
   - Vercel Dashboard → Project → Deployments → [Latest] → Functions
   - Check for any runtime errors
   - Monitor API route execution

4. **Performance Check:**
   - Use browser DevTools → Network tab
   - Verify API response times
   - Check bundle sizes

### Troubleshooting

#### Build Fails
- **Error:** "Module not found"
  - **Fix:** Ensure all dependencies in `package.json`
  - Run `npm install` locally to verify

- **Error:** "TypeScript errors"
  - **Fix:** Fix all TypeScript errors before deploying
  - Run `npm run build` locally first

#### Runtime Errors
- **Error:** "API key not found"
  - **Fix:** Verify environment variables set in Vercel dashboard
  - Redeploy after adding variables

- **Error:** "Cannot find module"
  - **Fix:** Check file paths are correct
  - Verify `data/kb_embeddings.json` is committed

#### API Errors
- **Error:** "OpenAI API error"
  - **Fix:** Check API key is valid and has credits
  - Verify key is set in Vercel environment variables

- **Error:** "News API rate limit"
  - **Fix:** Implement better error handling
  - Consider using mock data fallback

### Alternative Deployment Options

#### Netlify
1. Push to GitHub
2. Import to Netlify
3. Set environment variables in Netlify dashboard
4. Deploy

#### Railway
1. Connect GitHub repo
2. Set environment variables
3. Deploy automatically

#### Self-Hosted (VPS)
1. Build: `npm run build`
2. Start: `npm start`
3. Use PM2 or similar for process management
4. Set up reverse proxy (nginx)

### Continuous Deployment

Once set up, Vercel will:
- ✅ Auto-deploy on every push to `main` branch
- ✅ Create preview deployments for pull requests
- ✅ Rollback to previous deployments if needed

### Security Best Practices

- ✅ Never commit `.env.local` or `.env` files
- ✅ Use `.env.example` for documentation
- ✅ Rotate API keys if exposed
- ✅ Use Vercel's environment variable encryption
- ✅ Enable Vercel's DDoS protection (automatic)

### Monitoring

- **Vercel Analytics:** Enable in dashboard for performance metrics
- **Logs:** Check function logs in Vercel dashboard
- **Alerts:** Set up Vercel notifications for failed deployments

---

## Quick Deployment Checklist

```
[ ] Code pushed to GitHub
[ ] Vercel project created
[ ] Environment variables configured:
    [ ] OPENAI_API_KEY
    [ ] NEWS_API_KEY (or FINNHUB_API_KEY)
    [ ] QUOTES_API_KEY (if needed)
[ ] Build succeeds locally (`npm run build`)
[ ] Deployed successfully
[ ] Production URL tested
[ ] All features working in production
[ ] Performance targets met (< 3s load time)
[ ] Error handling verified
```

