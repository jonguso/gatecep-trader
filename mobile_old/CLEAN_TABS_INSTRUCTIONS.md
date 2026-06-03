# Clean Duplicate Tabs

Expo Router creates a tab for every `.js` file inside:

```text
mobile/app/(tabs)/
```

Delete or move these old files if they exist:

```text
mobile/app/(tabs)/coach.js
mobile/app/(tabs)/dashboard.js
mobile/app/(tabs)/brokers.js
```

Keep only:

```text
mobile/app/(tabs)/_layout.js
mobile/app/(tabs)/markets.js
mobile/app/(tabs)/trade.js
mobile/app/(tabs)/orders.js
mobile/app/(tabs)/portfolio.js
```

Then restart Expo cache:

```bash
npx expo start -c
```
