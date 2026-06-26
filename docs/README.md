# Gatecep

Gatecep is a broker-agnostic, AI-assisted investment and wealth management platform.

It combines:

- User-owned portfolio management
- Broker account linking
- Cash tracking
- Transaction ledger
- Performance analytics
- Financial goals
- Coach G wealth advisor
- Future live broker execution

## Current Platform State

Gatecep now includes the core production architecture:

```text
Authentication
  ├── User Profile
  ├── Investor Profile
  ├── Broker Accounts
  ├── Portfolio
  ├── Cash
  ├── Transactions
  ├── Goals
  ├── Performance
  └── Coach G
```

## Core Product Areas

| Area | Purpose |
|---|---|
| Dashboard | Today's snapshot |
| Portfolio Hub | Factual portfolio explorer |
| Coach G | Intelligence, recommendations, simulation, action planning |
| Performance | Analytics and returns |
| Trading | Order execution |
| Goals | Wealth planning |
| My Profile | User profile, investor profile, broker and cash summary |
| Broker Account Center | User-owned broker accounts |
| Portfolio Sync Center | Sync and reconciliation status |

## Backend

Location:

```text
/backend
```

Primary modules:

```text
auth
users
user-profile
investor-profile
portfolio
cash
broker-links
transactions
goals
performance
coach
execution
broker-reports
marketData
```

## Mobile

Location:

```text
/mobile
```

Primary app screens:

```text
Dashboard
Portfolio Hub
Coach G
Performance
Transactions
Goals
Trading
Markets
My Profile
Broker Account Center
Portfolio Sync Center
```

## Source of Truth

All new screens should use authenticated user-owned backend APIs:

```text
/user-profile
/investor-profile
/user-brokers
/user-cash
/user-portfolio
/transactions
/goals
/portfolio-performance
/coach/dashboard
```

Legacy broker mirror routes remain for import, staging, and reconciliation.

## Current Strategic Direction

Gatecep 5.0 is focused on harmonization:

- Avoid duplicate screens.
- Portfolio Hub owns factual portfolio exploration.
- Coach G owns recommendations and intelligence.
- Dashboard owns the current snapshot.
- Performance owns analytics.
- Transactions own the audit trail.
- Goals own wealth planning.
