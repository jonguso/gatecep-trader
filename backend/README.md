# GATECEP Backend

## Run

```bash
cp .env.example .env
npm install
npm start
```

## Main endpoints

```text
GET  /brokers
POST /brokers/link
POST /brokers/select

POST /onboarding/start
POST /onboarding/personal
POST /onboarding/cds
POST /onboarding/document
POST /onboarding/risk
POST /onboarding/terms
POST /onboarding/submit
POST /onboarding/approve

GET /securities
GET /prices
GET /market/summary
GET /candles/:symbol

POST /order
POST /preview
POST /ai/chat
```
