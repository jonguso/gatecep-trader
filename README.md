# Gatecep Broker Mirror Engine

This build changes the direction from local/demo portfolio to broker-mirrored architecture.

## What it adds

Backend:
- Mock AIB broker adapter
- Mock ABC broker adapter
- Broker adapter factory
- Broker mirror API routes
- Portfolio/funds/orders mirrored from selected brokers
- Buy/Sell routes through broker adapter
- Cancel order placeholder

Mobile:
- Portfolio reads broker-side portfolio
- Funds reads broker-side balances
- Orders reads broker-side orders
- Order entry can send brokerId/broker account info
- Broker filter support

## Backend files

```text
backend/src/brokerAdapters/BrokerAdapter.js
backend/src/brokerAdapters/MockAibAdapter.js
backend/src/brokerAdapters/MockAbcAdapter.js
backend/src/brokerAdapters/BrokerAdapterFactory.js
backend/src/routes/brokerMirrorRoutes.js
backend/src/docs/BROKER_MIRROR_SERVER_PATCH.md
```

## Mobile files

```text
mobile/src/services/brokerMirrorApi.js
mobile/app/(tabs)/portfolio.js
mobile/app/(tabs)/funds.js
mobile/app/(tabs)/orders.js
```

## Patch backend server.js

See:

```text
backend/src/docs/BROKER_MIRROR_SERVER_PATCH.md
```

## Test backend

```bash
cd backend
npm start
```

Open:

```text
http://localhost:4000/broker-mirror/portfolio/u1
http://localhost:4000/broker-mirror/funds/u1
http://localhost:4000/broker-mirror/orders/u1
```

## Important

This is mock broker-side data, but the architecture is production-ready:
replace MockAibAdapter / MockAbcAdapter with real broker APIs later.
