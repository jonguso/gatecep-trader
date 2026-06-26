# Gatecep System Architecture

Updated: 2026-06-25

## Overview

Gatecep is a broker-agnostic investment and wealth management platform consisting of:

- Mobile Application
- Backend API
- Authentication Layer
- User Ownership Layer
- Broker Mirror Engine
- User Portfolio Engine
- Cash Engine
- Transaction Ledger
- Performance Engine
- Goal Engine
- Coach G AI Layer
- Order Management System
- Market Data Gateway
- Security Master

---

## Platform Architecture

```text
Mobile App
   │
   ▼
Backend API
   │
   ├── Auth
   ├── User Profile
   ├── Investor Profile
   ├── Broker Links
   ├── Portfolio
   ├── Cash
   ├── Transactions
   ├── Goals
   ├── Performance
   ├── Coach G
   ├── Broker Mirror
   ├── Execution
   └── Market Data
```

---

## Mobile Layer

Location:

```text
/mobile
```

Major modules:

```text
Dashboard
Portfolio Hub
Performance
Transactions
Goals
Portfolio Sync Center
Broker Account Center
Coach G
Trading
Markets
My Profile
Broker Profile
Account Edit
Investor Profile Edit
```

Screen responsibilities:

| Screen | Responsibility |
|---|---|
| Dashboard | Today's snapshot |
| Portfolio Hub | Factual portfolio explorer |
| Coach G | Intelligence and action recommendations |
| Performance | Returns and analytics |
| Transactions | Activity feed |
| Goals | Wealth planning |
| Trading | Order execution |
| Profile | User management |

---

## Backend Layer

Location:

```text
/backend/src
```

Responsibilities:

- Authentication
- User data ownership
- Portfolio calculations
- Cash management
- Broker integrations
- Market data
- Coach G analytics
- Trade execution
- Goals and projections
- Performance analytics

---

## User Ownership Layer

Primary APIs:

```text
GET/PATCH /user-profile
GET/PATCH /investor-profile
GET/POST  /user-brokers
GET/POST  /user-cash
GET/POST  /user-portfolio
GET/POST  /transactions
GET/POST/PATCH/DELETE /goals
```

All records are scoped to authenticated `req.user.id`.

---

## Broker Mirror Engine

Repository:

```text
backend/src/repositories/brokerMirror.repository.js
```

Purpose:

Store imported broker information.

Supported report types:

```text
valuation
cash
transactions
holdings
```

Primary APIs:

```text
POST /broker-reports/import
GET  /broker-reports/mirror/:broker/:reportType
GET  /broker-reports/summary/:broker
```

Broker Mirror is a staging and reconciliation layer, not the main mobile screen data source.

---

## User Portfolio Engine

Service/repository:

```text
backend/src/modules/portfolio
```

Purpose:

Create authenticated user-owned portfolio views.

Inputs:

```text
user_portfolios
Security Master
```

Outputs:

```text
holdings
totalValue
totalProfitLoss
sector-enriched holdings
```

Primary API:

```text
GET /user-portfolio
POST /user-portfolio
```

Security Master enrichment is required before returning holdings.

---

## Performance Engine

Route:

```text
backend/src/modules/performance/performance.routes.js
```

Purpose:

Calculate portfolio performance.

Primary API:

```text
GET /portfolio-performance
```

Outputs:

```text
currentValue
investedValue
unrealizedGain
unrealizedGainPct
allocation
topGainers
topLosers
bestHolding
worstHolding
```

---

## Coach G Engine

Routes:

```text
/coach
/coach-g
```

Current primary endpoint:

```text
GET /coach/dashboard
```

Purpose:

Provide investment intelligence.

Capabilities:

```text
Risk analysis
Portfolio review
Diversification review
Cash health review
Investor behavior analysis
Goal review
Broker recommendations
Investment planning
Trade basket preparation
```

Coach G is advisory. It does not execute trades directly.

---

## Goal Engine

Route:

```text
/goals
```

Purpose:

Track investor wealth goals.

Capabilities:

```text
target amount
current amount
monthly contribution
target date
expected return
progress percentage
remaining amount
projected completion
```

---

## Transaction Ledger

Route:

```text
/transactions
```

Purpose:

Track all investment activity.

Transaction types:

```text
BUY
SELL
DEPOSIT
WITHDRAWAL
DIVIDEND
BROKER_FEE
TAX
BONUS
RIGHTS
```

Future trading flows should update the ledger first.

---

## Market Data Gateway

Service:

```text
backend/src/services/marketData
```

Current state:

```text
Demo / Seed Pricing
```

Future state:

```text
Live NSE Pricing
Real-time updates
Market depth
```

---

## Security Master

Purpose:

Normalize securities.

Example:

```text
SCOM -> Safaricom PLC -> Telecom
EABL -> East African Breweries -> Manufacturing
KCB  -> KCB Group -> Banking
```

Used by:

```text
Portfolio Import
Broker Portfolio
User Portfolio
Unified Portfolio
Coach G
Performance
```

---

## Order Management System

Routes:

```text
/orders
/order-book
/execution
```

Purpose:

Manage order lifecycle.

Lifecycle:

```text
QUEUED
ROUTED
ACCEPTED
PARTIAL_FILL
FILLED
REJECTED
CANCELLED
```

---

## Current Source of Truth Hierarchy

Priority 1:

```text
Authenticated User-Owned Backend APIs
```

Priority 2:

```text
Broker Valuation / Cash / Transaction Imports
```

Priority 3:

```text
Transaction Ledger and Execution Updates
```

Priority 4:

```text
AsyncStorage UI Drafts
```

---

## Future Architecture

```text
Multiple Brokers
       │
       ▼
Broker Mirror Engine
       │
       ▼
User Portfolio / Unified Portfolio
       │
       ▼
Performance + Goals
       │
       ▼
Coach G AI Layer
       │
       ▼
Broker Routing Engine
       │
       ▼
Live Trade Execution
```
