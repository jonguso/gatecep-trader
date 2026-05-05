# GATECEP Real NSE + Broker Integration Upgrade

This is a compact backend upgrade package for moving Gatecep from demo trading toward real NSE data and broker integration.

## Adds

- Real market-data provider interface
- Demo NSE provider fallback
- NSE direct/provider placeholder
- Vendor/provider placeholder
- Broker adapter interface
- Mock broker adapter
- Partner REST broker adapter placeholder
- Broker account linking
- Broker order routing
- Real market routes:
  - GET /market/live
  - GET /market/depth/:symbol
  - GET /market/rankings
- Broker routes:
  - GET /brokers
  - POST /brokers/link
  - POST /broker/order

## Add to backend/src/server.js

```js
import { getLiveMarket, getMarketDepth, getRankings } from "./routes/realMarket.js";
import { listBrokers, linkBroker, routeBrokerOrder } from "./routes/brokerIntegration.js";

app.get("/market/live", getLiveMarket);
app.get("/market/depth/:symbol", getMarketDepth);
app.get("/market/rankings", getRankings);

app.get("/brokers", listBrokers);
app.post("/brokers/link", linkBroker);
app.post("/broker/order", routeBrokerOrder);
```

## Environment

```bash
NSE_DATA_MODE=demo
NSE_API_BASE_URL=
NSE_API_KEY=
NSE_VENDOR_NAME=

BROKER_MODE=mock
PARTNER_BROKER_BASE_URL=
PARTNER_BROKER_API_KEY=
REQUIRE_BROKER_LINK=true
```

## Production note

Real trading must be routed through a licensed broker/trading participant or your own properly licensed entity. Real NSE data should come from NSE Data Services or an authorised NSE data vendor under agreement.
