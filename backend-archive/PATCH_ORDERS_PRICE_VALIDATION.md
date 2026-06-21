# Patch backend/src/routes/orders.js

Add imports:

```js
import { marketDataGateway } from "../services/marketData/MarketDataGateway.js";
import { validateLimitPrice } from "../services/trading/priceBands.js";
```

Inside `handleOrder`, after `cleanPrice` is calculated and before risk/accounting execution:

```js
const pricesResult = await marketDataGateway.getPrices();
const marketRow = (pricesResult.data || []).find(x => x.symbol === cleanSymbol);

const referencePrice = Number(
  marketRow?.offerPrice ||
  marketRow?.bestOffer ||
  marketRow?.price ||
  marketRow?.lastPrice ||
  cleanPrice
);

const priceValidation = validateLimitPrice({
  side: cleanSide,
  price: cleanPrice,
  referencePrice,
  lowerPct: 0.10,
  upperPct: 0.10
});

if (!priceValidation.ok) {
  return res.status(400).json({
    error: priceValidation.error,
    priceBand: priceValidation.band
  });
}
```

Add this to the order response:

```js
priceBand: priceValidation.band
```
