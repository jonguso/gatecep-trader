# GATECEP Complete Latest Package

This is a clean combined package so far, organized into:

```text
backend/
mobile/
frontend/
legal-site/
docs/
```

Included latest mobile/product upgrades:
- Portfolio global balance card
- Allocation by Securities chart
- Allocation by Industries chart
- Interactive chart drill-down
- AI Portfolio Analytics popup
- Portfolio Details popup
- Markets Watchlist/Gainers/Losers/Movers
- Swipe right to Buy, swipe left to Sell
- NSE-style order book UI
- NSE-style order entry
- Portfolio impact popup
- Coach G AI trade recommendation flow
- Duplicate order warning
- 2-second cooldown
- Buy price guardrails

## Run backend

```bash
cd backend
npm install
npm start
```

## Run mobile

```bash
cd mobile
npm install
npx expo start -c
```

## Notes

This package uses demo in-memory data. For production you still need:
- Licensed NSE/vendor data feed
- Broker API onboarding/partnership
- Database persistence
- KYC/AML compliance
- Production auth and audit logs
