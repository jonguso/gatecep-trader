# GATECEP Buy Price Limit Guardrails

Adds broker-style price validation:

- BUY price must be within allowed NSE/broker price range
- Shows Min / Max allowed price on Trade screen
- Defaults BUY price to best offer price
- Defaults quantity to best offer quantity when available
- Backend rejects invalid order prices even if mobile is bypassed

Apply:
```bash
copy backend and mobile folders into your project
cd mobile
npx expo start -c
```

Backend:
See `backend/PATCH_ORDERS_PRICE_VALIDATION.md`.
