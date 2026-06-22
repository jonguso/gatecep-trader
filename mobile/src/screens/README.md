# Mobile Screens Clean Structure

The active Expo Router screens still live under `app/` for compatibility.

This `src/screens/` structure is the target clean architecture for progressive migration.

## Target Domains

- `auth/` - login, signup, session screens
- `onboarding/` - investor questionnaire and onboarding flow
- `portfolio/` - dashboard portfolio, portfolio hub, analysis, holdings, sync center
- `broker/` - broker profile, broker upload, broker marketplace, broker accounts
- `coachg/` - Coach G insights and recommendations
- `trading/` - trade, order book, execution, baskets
- `market/` - markets, watchlist, security details
- `profile/` - my profile, investor profile, settings
- `settings/` - app preferences and account controls

## Rule

Do not move active route files from `app/` until imports are updated and tested.
For now, `app/` is the routing layer and `src/services/` is the business/service layer.
