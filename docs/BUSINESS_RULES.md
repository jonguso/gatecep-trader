# Gatecep Business Rules

Updated: 2026-06-25

## Core Principle

Gatecep is an advisory, portfolio management, and wealth planning platform.

The system must always reflect the authenticated investor's actual account, broker relationships, portfolio, cash, transactions, and goals.

---

## Rule 1: User Ownership

All personal data must be scoped to the authenticated `userId`.

This applies to:

- Portfolio holdings
- Cash balances
- Broker links
- Investor profile
- User profile
- Transactions
- Goals
- Coach G recommendations

No screen should show data from another user, legacy demo state, or unscoped local storage.

---

## Rule 2: Holdings Source of Truth

Current production source:

- User-owned `/user-portfolio`

Broker valuation reports remain the official external source of holdings when imported.

When valuation data is imported:

- Holdings are refreshed.
- Market values are refreshed.
- Portfolio allocation is refreshed.
- Previous broker valuation data may be replaced.

Valuation data takes precedence during reconciliation.

---

## Rule 3: Cash Source of Truth

Current production source:

- User-owned `/user-cash`

Cash statements are the official external source of available cash when imported.

Cash statements determine:

- Available cash
- Trading power
- Ledger balance
- Settlement cash

Dashboard, My Profile, Trading, and Coach G must use backend cash instead of `AsyncStorage.availableCash`.

---

## Rule 4: Transaction Ledger

Transactions represent investor activity.

Transaction types include:

- BUY
- SELL
- DEPOSIT
- WITHDRAWAL
- DIVIDEND
- BROKER_FEE
- TAX
- BONUS
- RIGHTS

All future buy/sell flows should follow:

```text
transaction -> cash update -> holdings update -> dashboard refresh
```

Transactions support:

- Activity Feed
- Coach G behavioral analysis
- Buy/sell pattern detection
- Realized P/L
- Holding period analysis
- Performance attribution

---

## Rule 5: Unified Portfolio Service

All portfolio screens must consume the user-owned unified portfolio layer.

Examples:

- Dashboard
- Portfolio Hub
- Holdings
- Portfolio Analysis
- Coach G
- Performance
- Allocation
- Risk Analysis

No screen should independently rebuild portfolio positions if the backend already provides the user-owned portfolio response.

---

## Rule 6: Security Master

Security Master is the authoritative source for:

- Symbol normalization
- Company name
- Sector
- Classification
- ETF/security metadata

`/user-portfolio` must enrich holdings with Security Master before returning results.

Example:

```text
SCOM -> Safaricom PLC -> Telecom
KCB  -> KCB Group -> Banking
EABL -> East African Breweries -> Manufacturing
```

---

## Rule 7: Broker Mirror Engine

Broker Mirror stores imported broker reports.

Supported report types:

- valuation
- cash
- transactions
- holdings

Broker Mirror acts as the staging and reconciliation layer between broker data and Gatecep user-owned services.

---

## Rule 8: Gatecep Trade Execution

When trading is activated:

- Gatecep orders create incremental portfolio updates.
- Cash is reduced/increased.
- Holdings are adjusted.
- Transactions are recorded.
- Performance and allocation refresh.

Example:

```text
Investor buys 100 SCOM through Gatecep.
System records BUY transaction.
System updates cash.
System updates holding quantity/cost.
System updates performance/allocation.
```

---

## Rule 9: Broker Reconciliation

When a new broker valuation report arrives:

- Broker valuation becomes the new external source of truth.
- Temporary incremental position calculations are reconciled against broker data.
- User portfolio is refreshed.

---

## Rule 10: Coach G Responsibilities

Coach G provides:

- Portfolio review
- Recommendations
- Diversification analysis
- Risk analysis
- Behavioral analysis
- Cash guidance
- Goal review
- Rebalancing suggestions
- Trade basket preparation

Coach G never executes trades directly.

Coach G can prepare actions, but execution must be user-confirmed.

---

## Rule 11: Dashboard Rules

Dashboard must display:

- Total portfolio value
- Invested value
- Holdings count
- Cash balance
- Portfolio gain/loss
- Recent activity
- Coach G alert summary

Values must originate from user-owned backend APIs.

---

## Rule 12: Screen Responsibility

Gatecep screens must not duplicate each other's core responsibility.

| Screen | Responsibility |
|---|---|
| Dashboard | Current snapshot |
| Portfolio Hub | Factual portfolio explorer |
| Coach G | Intelligence, recommendations, simulation, action planning |
| Performance | Historical analytics and returns |
| Trading | Execution |
| Goals | Wealth planning |
| Profile | User management |
| Broker Account Center | Broker ownership and account links |
| Portfolio Sync Center | Sync/reconciliation status |

---

## Rule 13: Multi-Broker Support

An investor may connect multiple brokers.

Unified Portfolio must aggregate:

- AIB-AXYS
- ABC Capital
- NCBA
- Standard Investment Bank
- Faida
- Genghis
- Any future broker

into one consolidated investor view.

---

## Rule 14: Local Storage

AsyncStorage can be used for:

- Temporary UI drafts
- Offline form drafts
- Non-authoritative preferences

AsyncStorage must not be the long-term source of truth for:

- Authenticated identity
- Portfolio
- Cash
- Broker links
- Investor profile
- User profile
- Goals
- Transactions
