\# GateCEP Domain Ownership



\## Purpose



GateCEP is organized by business domains. Backend, web, mobile, and shared code should align to these domains.



\## Domain IDs



| Domain | ID | Purpose |

|---|---|---|

| Authentication | AUTH-001 | Login, registration, session, JWT |

| Investor | INV-001 | Investor questionnaire, profile, risk profile |

| Broker | BRK-001 | Broker profile, broker linking, routing |

| Cash | CASH-001 | Cash balances, statement cash, available cash |

| Portfolio | PORT-001 | Holdings, valuation, P\&L, allocation |

| Market | MKT-001 | Prices, market feed, movers, sectors |

| Security Master | SEC-001 | NSE securities, symbols, metadata |

| Coach G | CG-001 | AI advice, scoring, recommendations |

| Trading | TRD-001 | Orders, execution, trade lifecycle |

| Notifications | NOT-001 | Alerts, events, messages |

| Reporting | RPT-001 | Reports, exports, audit trails |



\## Rules



1\. Every major file should map to one domain.

2\. Shared business logic belongs in shared/.

3\. Screens consume domains; they do not own business rules.

4\. Backend APIs are the source of truth for production data.

5\. Domain README and health files must be updated when core logic changes.

