# Knowledge Base

This directory contains static markdown files that form the knowledge base for the Finance Copilot RAG system.

## Files

The knowledge base currently contains 15 markdown files covering various financial topics:

- `pe_ratio.md` - Price-to-Earnings ratio
- `etf_basics.md` - Exchange-Traded Funds basics
- `market_cap.md` - Market capitalization
- `dividend_yield.md` - Dividend yield
- `options_basics.md` - Options trading basics
- `cpi.md` - Consumer Price Index
- `volatility.md` - Market volatility
- `bonds_basics.md` - Bonds basics
- `roe.md` - Return on Equity
- `eps.md` - Earnings Per Share
- `beta.md` - Beta in stock analysis
- `mutual_funds.md` - Mutual funds basics
- `asset_allocation.md` - Asset allocation strategies
- `dollar_cost_averaging.md` - Dollar-cost averaging
- `rebalancing.md` - Portfolio rebalancing

## Generating Embeddings

To generate embeddings for these files, run:

```bash
npm run generate-embeddings
```

This script will:
1. Read all `.md` files from this directory
2. Generate embeddings using OpenAI's `text-embedding-3-small` model
3. Save the embeddings to `../kb_embeddings.json`

**Note:** This requires:
- `OPENAI_API_KEY` environment variable to be set
- Network access to OpenAI's API

The embeddings file is then used by the retrieval system in `lib/kb/search.ts` to find relevant content for user queries.

