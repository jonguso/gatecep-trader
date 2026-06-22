# Mobile Services Clean Structure

Business logic now lives under `src/services/` grouped by domain.

Legacy folders such as `src/portfolio`, `src/auth`, and `src/brokers` are compatibility wrappers only.

## Portfolio Rule

Read-only portfolio consumers must use:

`loadUnifiedPortfolio()`

from:

`src/services/portfolio/unifiedPortfolioApi.js`

The backend Broker Mirror valuation is the source of truth for holdings.

`portfolioStore.js` remains temporary compatibility for local write/simulation flows only.
