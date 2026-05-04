# Backend Patch Instructions

## 1. Copy files

Copy these files into your backend:

```text
backend/src/services/marketData/rankings.js
backend/src/routes/rankings.js
```

## 2. Update `backend/src/server.js`

Add import:

```js
import { getMarketRankings } from "./routes/rankings.js";
```

Add route near market routes:

```js
app.get("/market/rankings", getMarketRankings);
```

## 3. Restart backend

```bash
npm start
```

## 4. Test

Open:

```text
http://localhost:4000/market/rankings
```

or Railway:

```text
https://your-backend.up.railway.app/market/rankings
```

## Real NSE ranking logic

This endpoint uses real fields when your market-data adapter provides them:

```js
lastPrice or price
prevClose or previousClose
volume or tradedVolume
turnover
```

If your licensed NSE/vendor feed provides `turnover` directly, that value is used. Otherwise turnover is calculated as:

```text
lastPrice * volume
```

If volume is missing, the endpoint falls back to a demo volume but flags it:

```json
"dataQuality": {
  "hasRealVolume": false
}
```
