\# Mobile Portfolio Layer



\## Current Architecture



Portfolio display screens must use:



`loadUnifiedPortfolio()`



from:



`mobile/src/portfolio/unifiedPortfolioApi.js`



This reads from backend Broker Mirror:



`GET /broker-portfolio/:broker`



\## Source of Truth



Broker valuation upload is the source of truth for holdings.



Cash statement is the source of truth for available cash.



Transaction history is used for Coach G behavior analysis only.



\## Legacy Compatibility



`portfolioStore.js` is now legacy/local compatibility only.



Allowed temporary users:



\- first-trade.js

\- trade.js

\- manual-portfolio-entry.js

\- review-portfolio-import.js

\- onboarding/smart-portfolio.js

\- brokerPortfolioSync.js



These files may still prepare or simulate local portfolio records, but they are not authoritative.



\## Future Migration



All writers must eventually POST to backend:



\- valuation -> POST /broker-reports/import

\- cash -> POST /broker-reports/import

\- transactions -> POST /broker-reports/import

\- Gatecep trades -> execution engine / portfolio ledger

