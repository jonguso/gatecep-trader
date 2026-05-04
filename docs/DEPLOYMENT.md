# Deployment

## Backend on Railway

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Environment variables:

```env
PORT=4000
JWT_SECRET=replace_with_secure_secret
BROKER_MODE=MOCK
MARKET_DATA_PROVIDER=SIMULATED
```

## Frontend on Vercel

```text
Root Directory: frontend
Build Command: npm run build
Output Directory: build
```

Environment variable:

```env
REACT_APP_API_URL=https://your-railway-backend.up.railway.app
```

## Mobile

Set `mobile/app.json` extra.apiUrl to backend URL.
