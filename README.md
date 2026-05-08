# Gatecep Unified Portfolio + Broker Mirror Engine

This module turns Gatecep into a broker-agnostic portfolio mirror.

## Adds

Backend:
- Unified portfolio aggregation service
- Broker holdings merge by symbol
- Broker exposure breakdown
- Sector allocation breakdown
- P&L and risk metrics
- Unified portfolio API route

Mobile:
- Unified Portfolio screen
- Broker breakdown cards
- Sector allocation cards
- Security-level consolidated holdings
- Coach G portfolio risk insights

## Files

```text
backend/src/services/portfolio/UnifiedPortfolioEngine.js
backend/src/routes/unifiedPortfolioRoutes.js
backend/src/docs/UNIFIED_PORTFOLIO_SERVER_PATCH.md

mobile/src/services/unifiedPortfolioApi.js
mobile/app/(tabs)/portfolio.js
```

## Patch backend server.js

Add:

```js
import { unifiedPortfolioRouter } from "./routes/unifiedPortfolioRoutes.js";
app.use("/unified-portfolio", unifiedPortfolioRouter);
```

## Test

```bash
cd backend
npm start
```

Open:

```text
http://localhost:4000/unified-portfolio/u1
```

## Result

Gatecep will show:
- Total portfolio value across AIB + ABC
- Consolidated holdings e.g. SCOM from all brokers combined
- Broker exposure
- Sector exposure
- Coach G risk summary
