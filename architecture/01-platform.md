\# 01 - GateCEP Platform Architecture



\## Status



ACTIVE



\## Version



GateCEP 3.1 Platform Consolidation



\## Vision



GateCEP is a multi-client investment platform with:



\- Backend APIs

\- Web client

\- Mobile client

\- Shared business engines

\- Coach G intelligence

\- Broker integration layer

\- Market data layer



\## Core Principle



Business logic belongs in `shared/`.



Production data belongs behind backend APIs.



Web and mobile are presentation clients.



\## High-Level Architecture



```text

&#x20;                GateCEP Platform



&#x20;                      shared/

&#x20;       ┌─────────────────────────────────┐

&#x20;       │ Portfolio Engine ENG-PORT-001   │

&#x20;       │ Market Engine ENG-MKT-001       │

&#x20;       │ Cash Engine ENG-CASH-001        │

&#x20;       │ Risk Engine ENG-RISK-001        │

&#x20;       │ Goal Engine ENG-GOAL-001        │

&#x20;       │ Coach Engine ENG-REC-001        │

&#x20;       └─────────────────────────────────┘

&#x20;                        ▲

&#x20;                        │

&#x20;       ┌────────────────┼────────────────┐

&#x20;       │                │                │

&#x20;    backend          frontend          mobile

&#x20;       │                │                │

&#x20;       └──────────── PostgreSQL ────────┘

