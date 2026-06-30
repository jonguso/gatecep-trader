\# GateCEP Technical Debt Register



\## Purpose



Tracks duplicated logic, obsolete files, static data, and migration targets.



\## Status Labels



\- OPEN

\- IN PROGRESS

\- RESOLVED

\- DEFERRED



\## Register



| ID | Area | Issue | Status | Target |

|---|---|---|---|---|

| TD-001 | Market | Static prices remain in Smart Portfolio | OPEN | ENG-MKT-001 |

| TD-002 | Broker | Broker lists still duplicated in some mobile screens | OPEN | shared/constants/brokers.js |

| TD-003 | Portfolio | Multiple valuation calculations across screens | IN PROGRESS | ENG-PORT-001 |

| TD-004 | Investor | Questionnaire/profile/edit shape not fully shared | OPEN | INV-001 |

| TD-005 | Cash | Cash calculations not yet in shared cash engine | OPEN | ENG-CASH-001 |

| TD-006 | Monorepo | Mobile has temporary shared engine bridge because Metro cannot import root shared directly | OPEN | @gatecep/shared |

| TD-007 | Runtime | Backend/mobile cannot safely consume root shared/ until @gatecep/shared package boundary is complete | OPEN | GateCEP 3.2 |

