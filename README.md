# Gatecep Trade Security Dropdown + Defaults Fix

Fixes the Trade page:

- Security is now a dropdown.
- Changing security refreshes:
  - order book
  - open/high/low/close/change
  - price bands
  - security name
- Quantity defaults to best offer quantity for BUY.
- Quantity defaults to best bid quantity for SELL.
- Price defaults to best offer price for BUY.
- Price defaults to best bid price for SELL.
- Price input accepts up to 2 decimal places only.
- Reset button resets price/quantity to current best bid/offer.

Apply:

```bash
copy mobile folder into your existing mobile/
cd mobile
npx expo start -c
```
