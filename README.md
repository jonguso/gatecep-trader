# Gatecep Full NSE Securities Backend Fix

The Watchlist is only showing 10 because `/prices` returns only 10 demo rows.

This patch makes `/prices` return a full NSE security master merged with demo/live prices.

Apply:
```bash
copy backend folder into your existing backend/
cd backend
npm start
```

Then test:
```bash
curl http://localhost:4000/prices
```

You should see `count` greater than 10.

If mobile uses Railway, commit and push backend so Railway redeploys:
```bash
git add .
git commit -m "Return full NSE securities in prices feed"
git push
```
