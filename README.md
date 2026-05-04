# GATECEP Full Production Trading UI Patch

This patch upgrades the mobile app to a production-grade broker-agnostic trading UI.

## Adds

- Trade tab now shows:
  - Recent trade activity
  - Open orders
  - Quick order ticket
  - Portfolio impact after order

- Markets tab now supports:
  - Tap/long-press stock row to open Buy/Sell action sheet
  - Coach G prompt before trading
  - Buy/Sell routing to trade screen

- Portfolio tab now:
  - Refreshes after trade
  - Shows updated portfolio values
  - Has clean investment/current value/P&L card

- Better app navigation:
  - Portfolio
  - Markets
  - Trade
  - Coach G

## Apply

Copy the `mobile/` folder over your existing:

```text
gatecep-clean-full-package/mobile/
```

Then run:

```bash
cd mobile
npx expo start -c
```
