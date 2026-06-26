# Gatecep Data Flow

Updated: 2026-06-25

## High-Level Architecture

```text
                       AUTHENTICATED USER
                              │
                              ▼
      ┌───────────────────────┼────────────────────────┐
      │                       │                        │
      ▼                       ▼                        ▼
 User Profile          Investor Profile           Broker Links
 /user-profile         /investor-profile          /user-brokers
      │                       │                        │
      └───────────────────────┼────────────────────────┘
                              ▼
                   User-Owned Wealth Layer
                              │
       ┌──────────────────────┼───────────────────────┐
       │                      │                       │
       ▼                      ▼                       ▼
 /user-portfolio          /user-cash             /transactions
       │                      │                       │
       └───────────────┬──────┴───────────────┬───────┘
                       ▼                      ▼
             /portfolio-performance       /goals
                       │                      │
                       └──────────┬───────────┘
                                  ▼
                           /coach/dashboard
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
           Dashboard          Portfolio Hub          Coach G
```

---

## Current Production Source of Truth

| Data Type | Source |
|---|---|
| Authenticated user | JWT + `/users/me` |
| User account profile | `/user-profile` |
| Investor profile | `/investor-profile` |
| Broker accounts | `/user-brokers` |
| Holdings | `/user-portfolio` enriched by Security Master |
| Cash | `/user-cash` |
| Transactions | `/transactions` |
| Goals | `/goals` |
| Performance | `/portfolio-performance` |
| Coach G intelligence | `/coach/dashboard` |

---

## Valuation Upload Flow

Purpose:

Determine the investor's actual holdings from broker valuation reports.

```text
Investor uploads valuation
        │
        ▼
Import Portfolio Screen
        │
        ▼
Review Portfolio Import
        │
        ▼
POST /broker-reports/import
        │
        ▼
Broker Mirror (valuation)
        │
        ▼
Reconciliation / User Portfolio
        │
        ▼
GET /user-portfolio
        │
        ▼
Dashboard / Portfolio Hub / Coach G
```

Expected fields:

- symbol
- quantity
- averagePrice
- marketPrice
- marketValue

---

## Cash Upload Flow

Purpose:

Determine available funds.

```text
Investor uploads cash statement
        │
        ▼
Cash Import
        │
        ▼
POST /broker-reports/import
reportType = cash
        │
        ▼
Broker Mirror (cash)
        │
        ▼
User Cash
/user-cash
        │
        ▼
Dashboard / Trading / Order Validation / Coach G
```

---

## Transaction Flow

Purpose:

Record investor actions and drive the future ledger-based platform.

```text
User action or broker import
        │
        ▼
POST /transactions
        │
        ▼
Transaction Ledger
        │
        ├── BUY/SELL updates holdings
        ├── DEPOSIT/WITHDRAWAL updates cash
        ├── DIVIDEND updates cash/income
        └── FEES/TAX update cash/performance
        │
        ▼
Activity Feed / Performance / Coach G
```

Transactions support:

- Activity Feed
- Behavior Analysis
- Performance Attribution
- Realized P/L
- Dividend tracking
- Future tax reporting

---

## User Portfolio Flow

Purpose:

Provide one authenticated portfolio source.

```text
user_portfolios table
        │
        ▼
Security Master enrichment
        │
        ▼
GET /user-portfolio
        │
        ▼
Dashboard
Portfolio Hub
Performance
Allocation
Risk
Coach G
```

Security Master must enrich:

- symbol
- name
- sector
- classification

---

## Performance Flow

Purpose:

Turn holdings into investor analytics.

```text
/user-portfolio
        │
        ▼
GET /portfolio-performance
        │
        ├── current value
        ├── invested value
        ├── unrealized gain
        ├── allocation
        ├── top gainers
        └── top losers
        │
        ▼
Performance Screen / Coach G
```

---

## Coach G Flow

Purpose:

Use platform data to produce intelligence and recommendations.

```text
/user-portfolio
/user-cash
/user-brokers
/transactions
/goals
/portfolio-performance
        │
        ▼
GET /coach/dashboard
        │
        ├── portfolio score
        ├── risk score
        ├── cash score
        ├── largest sector
        ├── largest holding
        └── recommendations
        │
        ▼
Coach G
```

---

## Future Trading Flow

Purpose:

Support live Gatecep trading.

```text
Investor places order
        │
        ▼
OMS
        │
        ▼
Execution Engine
        │
        ▼
Broker
        │
        ▼
Filled Order
        │
        ▼
Transaction Ledger
        │
        ▼
Holdings Update
Cash Update
P&L Update
```

---

## Reconciliation Flow

Purpose:

Keep Gatecep aligned with broker records.

```text
New broker valuation uploaded
        │
        ▼
Broker Mirror updated
        │
        ▼
User Portfolio rebuilt
        │
        ▼
Gatecep holdings reconciled
```

Broker valuation wins during reconciliation.
