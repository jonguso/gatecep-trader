# Patch `/prices`

In `backend/src/server.js`, make sure `/prices` uses the gateway:

```js
import { marketDataGateway } from "./services/marketData/MarketDataGateway.js";

app.get("/prices", async (req, res) => {
  const payload = await marketDataGateway.getPrices();
  res.json(payload);
});
```

If you already have a hard-coded `/prices` route, replace it.
