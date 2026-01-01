# Finance Copilot

A modern web application providing real-time market data and AI-powered financial insights.

## Features

- **Market Watchlist**: Real-time stock quotes for major tickers
- **News Panel**: Latest news articles for selected tickers
- **AI Chat Assistant**: Powered by OpenAI GPT-4o-mini with RAG (Retrieval-Augmented Generation)
  - Answers financial questions using knowledge base
  - Provides market data and news context
  - Cites sources for transparency
- **Prompt Suggestions**: Quick-start prompts for common questions

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **AI**: OpenAI GPT-4o-mini
- **RAG**: Custom knowledge base with embeddings

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd "Financial Dashboard"
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=sk-your-api-key-here
```

5. Generate knowledge base embeddings (optional, for RAG):
```bash
npm run generate-embeddings
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file with the following variables:

- `OPENAI_API_KEY` (required): Your OpenAI API key for chat functionality
- `USE_MOCK_CHAT` (optional): Set to `true` to use mock responses when network access to OpenAI is blocked
- `NEXT_PUBLIC_BASE_URL` (optional): Base URL for API calls (auto-detected in production)

## Knowledge Base

The application includes a knowledge base with 15+ markdown files covering financial topics:
- P/E Ratio
- ETFs
- Market Cap
- Dividends
- Options
- CPI
- Volatility
- Bonds
- ROE
- EPS
- Beta
- And more...

To regenerate embeddings after updating KB files:
```bash
npm run generate-embeddings
```

## Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Deployment

### Deploy to AWS (Recommended)

**Quick Start**: See `AWS_QUICK_START.md` for the fastest deployment path.

**Full Guide**: See `DEPLOY_AWS.md` for detailed AWS deployment options:
- **AWS Amplify** (Easiest - Recommended)
- **AWS EC2** (For more control)
- **AWS App Runner** (Container-based)

#### AWS Amplify (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
3. Create new app → Connect repository
4. Set environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `NODE_ENV`: `production`
5. Deploy!

The application will be automatically deployed on every push to your main branch.

### Deploy to Vercel (Alternative)

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard:
   - `OPENAI_API_KEY`: Your OpenAI API key
4. Deploy!

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/          # Chat API with RAG integration
│   │   ├── quotes/        # Market quotes API
│   │   └── news/          # News API
│   └── page.tsx           # Main dashboard page
├── components/
│   ├── Chat.tsx           # Chat component with sources
│   ├── Watchlist.tsx      # Market watchlist
│   ├── NewsPanel.tsx      # News panel
│   └── ui/                # shadcn/ui components
├── lib/
│   └── kb/                # Knowledge base utilities
│       ├── load.ts        # Load embeddings
│       └── search.ts      # Search KB with cosine similarity
├── data/
│   └── kb/                # Knowledge base markdown files
│   └── kb_embeddings.json # Generated embeddings (committed)
└── scripts/
    └── generate-embeddings.ts # Embedding generation script
```

## Performance

- Page load time: < 3 seconds
- API response caching: 5 seconds for quotes
- Optimized bundle size
- Lazy loading for embeddings

## Error Handling

- Graceful degradation for all API failures
- User-friendly error messages
- Network error handling
- Fallback to mock data when APIs fail

## Disclaimer

This application provides financial information and AI-powered insights for educational purposes only. It does not constitute financial advice, investment recommendations, or solicitation to buy or sell securities. All market data is provided for informational purposes and may be delayed or inaccurate. Past performance does not guarantee future results. Always consult with a qualified financial advisor before making investment decisions.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
