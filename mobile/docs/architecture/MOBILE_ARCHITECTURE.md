# Gatecep Mobile Architecture

## Current Runtime Layer

`app/` remains the Expo Router runtime layer.

## Business Logic Layer

`src/services/` contains business logic grouped by domain.

## Compatibility Layer

Old folders such as `src/portfolio`, `src/auth`, `src/brokers`, and `src/trade` are compatibility wrappers that re-export the service implementations from `src/services`.

No new logic should be added to compatibility wrappers.

## Target Screen Layer

`src/screens/` is the target home for progressive screen migration.

Active route files in `app/` should eventually become thin wrappers that import screen components from `src/screens`.
