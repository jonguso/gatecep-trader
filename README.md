# GATECEP Multi-Broker Phase 2

This package updates the platform toward the myStocks-style model:

- Customers can choose/connect a broker
- GATECEP acts as AI trading companion and broker connector
- Broker marketplace
- Broker account linking
- Broker-aware Coach G recommendations
- Broker-specific order routing
- Mock broker remains active for safe testing

## Backend

```bash
cd backend
cp .env.example .env
npm install
npm start
```

## Mobile

```bash
cd mobile
npm install
npx expo start -c
```

Edit mobile API URL:

```text
mobile/src/api.js
```

## Key backend endpoints

```text
GET  /brokers
GET  /brokers/links?userId=u1
POST /brokers/link
POST /brokers/select
POST /order
POST /ai/chat
GET  /recommendation/:symbol/:userId
```

## Product positioning

GATECEP is not the broker. GATECEP is:

```text
AI stock coach + broker connector + investor onboarding layer
```

Execution should go through the customer’s selected licensed broker.
