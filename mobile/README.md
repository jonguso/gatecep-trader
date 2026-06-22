# Gatecep Mobile

Clean architecture mobile app for Gatecep Coach G.

## Active Routing

Expo Router active screens remain under:

`app/`

## Clean Service Layer

Business logic is grouped under:

`src/services/`

Legacy folders under `src/` are compatibility wrappers and should not receive new business logic.

## Source of Truth

Portfolio holdings come from backend Broker Mirror valuation through:

`GET /broker-portfolio/:broker`

Mobile reads this through:

`loadUnifiedPortfolio()`

## Environment

Set:

`EXPO_PUBLIC_API_URL`

Local:

`http://localhost:4000`

Production:

`https://gatecep-trader-production.up.railway.app`
