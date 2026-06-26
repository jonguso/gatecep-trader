# NSE Data Pipeline

Modes:

```env
MARKET_DATA_PROVIDER=SIMULATED
MARKET_DATA_PROVIDER=DELAYED_PUBLIC
MARKET_DATA_PROVIDER=LICENSED_NSE_VENDOR
```

Production mode requires:

```env
NSE_VENDOR_BASE_URL=
NSE_VENDOR_API_KEY=
```

Do not scrape restricted broker or NSE systems without permission.
