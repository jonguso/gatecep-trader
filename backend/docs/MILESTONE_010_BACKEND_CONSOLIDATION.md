# Milestone 010 - Backend Consolidation

This backend is based on `backend - New.zip` clean architecture and has been populated with the working route/service/repository files from `backend - current.zip`.

## Clean route grouping

- `src/routes/broker/`
- `src/routes/coachg/`
- `src/routes/market/`
- `src/routes/portfolio/`

## Core copied routes

- src/routes/broker/brokerLink.routes.js
- src/routes/broker/brokerReportImport.routes.js
- src/routes/broker/brokerPortfolio.routes.js
- src/routes/broker/brokerHeatmap.routes.js
- src/routes/coachg/brokerMirrorScore.routes.js
- src/routes/coachg/brokerMirrorRebalance.routes.js
- src/routes/coachg/investmentPlanner.routes.js
- src/routes/coachg/generatePortfolio.routes.js
- src/routes/coachg/goalTracker.routes.js
- src/routes/coachg/stressTest.routes.js
- src/routes/coachg/starterBasket.routes.js
- src/routes/coachg/newInvestorPlan.routes.js

## Core architecture decision

Broker valuation reports are the source of truth for holdings. Broker cash reports are the source of truth for cash. Transactions are for Coach G behavior analysis.

## API baseline

- `POST /coach-g/broker-link`
- `POST /broker-reports/import`
- `POST /broker-reports/upload`
- `GET /broker-reports/mirror/:broker/:reportType`
- `GET /broker-portfolio/:broker?clientNumber=&cdsNumber=`
- `GET /broker-heatmap/:broker?clientNumber=&cdsNumber=`
- `GET /broker-mirror-score/:broker?clientNumber=&cdsNumber=`
- `GET /broker-mirror-rebalance/:broker?risk=&goal=&clientNumber=&cdsNumber=`
- `GET /investment-planner/:broker?amount=&goal=&risk=&clientNumber=&cdsNumber=`
- `GET /generate-portfolio`
- `GET /goal-tracker`
- `GET /stress-test`
- `GET /starter-basket/:bucket`

## Notes

- `node_modules` and local `.env` files were intentionally not copied.
- The backend has a clean `src/server.js` mounting grouped routes.
- File-based Broker Mirror repository from current backend was copied to preserve the working behavior immediately.
- Database migration files from the clean backend were retained for the next identity/persistence milestone.
