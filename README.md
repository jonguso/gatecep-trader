# Gatecep Account Menu + Profile + Settings Logic

Adds only logic/UI for:
- Top-left hamburger menu
- Side menu with Sign Out and Settings
- Top-right account profile icon
- Account Profile screen
- Basic Settings screen
- Logout using existing AuthContext

Does not change trading flow.

## New / updated files

```text
mobile/src/components/AppTopBar.js
mobile/src/components/SideMenu.js
mobile/app/account-profile.js
mobile/app/settings.js
mobile/app/(tabs)/dashboard.js
```

## Apply

Copy `mobile` into your existing mobile folder.

Then:

```bash
cd mobile
npx expo start -c
```

## Important

Use `AppTopBar` on any screen where you want the hamburger + profile icon.
This package updates Dashboard as the example.
