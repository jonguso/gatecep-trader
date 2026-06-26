# Gatecep Roadmap

Updated: 2026-06-25

## Completed Foundation

### Phase 1 — Unified Portfolio Migration
Status: Complete

- Broker Mirror Architecture
- Portfolio Sync Center
- Dashboard Integration
- Portfolio Upload Pipeline

### Phase 2 — User Ownership
Status: Complete

- Authentication
- User Profile
- Investor Profile
- User Portfolio
- User Cash
- User Broker Accounts

### Phase 3 — Investment Engine
Status: Complete

- Transaction Ledger
- Activity Feed
- Portfolio Performance API
- Security Master Enrichment
- Sector Allocation
- Top Gainers / Losers

### Phase 4 — Wealth Planning
Status: Complete

- Goal API
- Goal Projection Engine

### Phase 5 — Coach G Wealth Advisor Backend
Status: Complete

- `/coach/dashboard`
- Portfolio score
- Risk score
- Cash score
- Concentration recommendations
- Diversification recommendations

## Current Phase

### Phase 6 — Gatecep 5.0 Harmonization
Status: In Progress

Goals:

- Harmonize Portfolio Hub and Coach G.
- Avoid duplicate analytics.
- Make Portfolio Hub factual.
- Make Coach G advisory.
- Route users from Coach G to the correct source screen.
- Use backend APIs as the single source of truth.

Screen ownership:

| Screen | Owns |
|---|---|
| Dashboard | Snapshot |
| Portfolio Hub | Holdings, allocation, portfolio facts |
| Coach G | Advice, recommendations, simulator, strategy |
| Performance | Returns and analytics |
| Transactions | Activity feed |
| Goals | Wealth planning |
| Trading | Execution |
| Profile | User management |

## Next Phases

### Phase 7 — Coach G Mobile Harmonization

- Add `/coach/dashboard` data into existing Coach G Insights.
- Avoid creating duplicate `coach-dashboard` if `coach-insights` already owns the domain.
- Refactor Coach G into tabs/sections:
  - Overview
  - Portfolio Review
  - Recommendations
  - Simulator
  - Behavior
  - Attribution
  - Strategy History

### Phase 8 — Dividend Intelligence

- Expected annual dividends
- Yield on cost
- Dividend calendar
- Passive income dashboard
- Coach G dividend recommendations

### Phase 9 — Broker Sync Center

- Sync portfolio
- Sync cash
- Sync transactions
- Per-broker sync status
- Last sync timestamps

### Phase 10 — Live Broker Integration

- AIB
- ABC Capital
- NCBA
- Faida
- Genghis
- Standard Investment Bank

### Phase 11 — Live NSE Market Data

- Live/delayed pricing
- Intraday changes
- Market movers
- Depth where supported

### Phase 12 — Production Trading Launch

- Live order routing
- Order status
- Cancellation
- Execution notifications
- Reconciliation
