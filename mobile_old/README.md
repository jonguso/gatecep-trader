# GATECEP Mobile

```bash
npm install
npx expo start -c
```

Configure backend in `app.json`:

```json
"extra": {
  "apiUrl": "https://your-railway-backend.up.railway.app"
}
```

For App Store / Play Store builds:

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile production
eas build -p ios --profile production
```
