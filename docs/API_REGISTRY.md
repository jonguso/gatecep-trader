# Gatecep API Registry

Updated: 2026-06-25

## Core Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Create a Gatecep account |
| POST | `/auth/login` | Authenticate user and return JWT |
| GET | `/users/me` | Return authenticated user profile/session context |

## User Ownership APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/user-profile` | Get authenticated user's account profile |
| PATCH | `/user-profile` | Update account profile fields such as phone, country, preferred broker, theme |
| GET | `/investor-profile` | Get authenticated user's investor profile |
| PATCH | `/investor-profile` | Update investor profile: goal, risk, experience, horizon, contribution, investor type |
| GET | `/user-brokers` | List authenticated user's broker links |
| POST | `/user-brokers` | Add authenticated user's broker account |
| GET | `/user-cash` | List authenticated user's cash balances and summary |
| POST | `/user-cash` | Create/update authenticated user's broker cash balance |
| GET | `/user-portfolio` | List authenticated user's portfolio holdings enriched by Security Master |
| POST | `/user-portfolio` | Add authenticated user's holding |
| GET | `/transactions` | List authenticated user's transaction ledger |
| POST | `/transactions` | Add transaction and drive cash/holding updates |
| GET | `/goals` | List authenticated user's financial goals |
| POST | `/goals` | Create financial goal |
| PATCH | `/goals/:id` | Update financial goal |
| DELETE | `/goals/:id` | Delete financial goal |

## Portfolio & Performance

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/portfolio/unified` | Legacy unified portfolio route |
| GET | `/broker-portfolio/:broker` | Broker mirror portfolio view |
| GET | `/portfolio-performance` | Authenticated user portfolio performance, allocation, top gainers/losers |
| POST | `/broker-reports/import` | Import valuation/cash/transaction reports |
| GET | `/broker-reports/mirror/:broker/:reportType` | Read broker mirror report data |
| GET | `/broker-reports/summary/:broker` | Broker report summary |

## Coach G

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/coach/dashboard` | Coach G Wealth Advisor dashboard using user portfolio, cash, brokers, and risk signals |
| GET | `/coach` | Legacy Coach G route group |
| GET | `/coach-g` | Legacy Coach G route group |
| GET | `/coach-g-alerts` | Legacy Coach G alerts |

## Trading & Execution

| Method | Endpoint | Purpose |
|---|---|---|
| GET/POST | `/orders` | Order management |
| GET/POST | `/execution` | Execution engine |
| GET | `/order-book` | Order book and order history |

## New Investor / Planning

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/generate-portfolio` | Generate starter recommendation |
| GET | `/starter-basket` | Starter basket |
| GET | `/goal-tracker` | Legacy goal projection |
| GET | `/stress-test` | Stress-test portfolio scenarios |

## API Ownership Rule

All new app screens must prefer authenticated user-owned routes:

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

Legacy broker mirror and `/broker-portfolio/:broker` remain available for staging, reconciliation, and report import flows.
