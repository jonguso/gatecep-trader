# Milestone 010B - Mobile Clean Structure Consolidation

## Goal

Move mobile business logic into a clean `src/services/` structure while keeping Expo Router `app/` routes operational.

## Completed

- Centralized API URL in `src/config/apiConfig.js`
- Created domain-based `src/services/` folders
- Moved service implementations into domain folders
- Replaced old domain folders with compatibility wrappers
- Preserved legacy `app/` routing layer
- Added screen migration target structure under `src/screens/`

## Portfolio Architecture

Portfolio read screens must use backend Broker Mirror through:

`loadUnifiedPortfolio()`

Allowed temporary compatibility writers:

- first-trade.js
- trade.js
- manual-portfolio-entry.js
- review-portfolio-import.js
- onboarding/smart-portfolio.js
- brokerPortfolioSync.js

## Next Phase

Progressively migrate active route screens from `app/` into `src/screens/` and leave route files as thin wrappers.
