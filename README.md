# GATECEP Clean Full Package

Clean project structure:

```text
gatecep-clean-full-package/
├── backend/      # Node/Express API, broker routing, onboarding, market data pipeline
├── frontend/     # React web dashboard
├── mobile/       # Expo Router mobile app
├── legal-site/   # Privacy, Terms, Risk Disclosure static site
└── docs/         # Deployment and product notes
```

## Quick start

### Backend
```bash
cd backend
cp .env.example .env
npm install
npm start
```

### Frontend
```bash
cd frontend
npm install
npm start
```

### Mobile
```bash
cd mobile
npm install
npx expo start -c
```

### Legal site
Deploy `legal-site/` to Vercel, Netlify, or GitHub Pages.

## Demo user

```text
demo@gatecep.local / demo123
```

## Important

This package is broker-ready and app-store-ready foundation code. It is not live regulated trading software until:
- broker partnership is signed
- licensed NSE/vendor data feed is connected
- KYC and compliance are productionized
- legal review is completed
- security review is completed
