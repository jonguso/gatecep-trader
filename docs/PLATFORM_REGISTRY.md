\# GateCEP Platform Registry



\## Release



GateCEP 3.0.3 – Migration Sprint



\## Purpose



Tracks domain ownership, shared engines, implementation status, and migration progress across backend, mobile, web, and shared.



\## Status Legend



\- STABLE: Production-ready

\- ACTIVE: Currently used

\- DEV: Under active development

\- PARTIAL: Partially migrated

\- PLANNED: Not started

\- DEPRECATED: Should not be extended

\- OBSOLETE: Candidate for archive



\## Platform Domains



| Domain | ID | Engine | Status | Shared | Backend | Mobile | Web | Notes |

|---|---|---|---|---|---|---|---|---|

| Authentication | AUTH-001 | — | STABLE | N/A | ACTIVE | ACTIVE | PARTIAL | Login/register/JWT working |

| Investor | INV-001 | ENG-RISK-001 | DEV | PARTIAL | ACTIVE | PARTIAL | PARTIAL | Investor profile SSoT started |

| Broker | BRK-001 | — | DEV | PARTIAL | ACTIVE | PARTIAL | PARTIAL | Broker catalog moving to shared |

| Cash | CASH-001 | ENG-CASH-001 | DEV | ACTIVE | ACTIVE | PARTIAL | PARTIAL | Cash engine created; migration pending |

| Portfolio | PORT-001 | ENG-PORT-001 | DEV | ACTIVE | PARTIAL | PARTIAL | PARTIAL | Shared portfolio engine created |

| Market | MKT-001 | ENG-MKT-001 | DEV | ACTIVE | PARTIAL | PARTIAL | PARTIAL | Shared market engine created |

| Security Master | SEC-001 | — | DEV | ACTIVE | PARTIAL | PARTIAL | PARTIAL | NSE master exists; needs expansion |

| Coach G | CG-001 | ENG-REC-001 | DEV | PARTIAL | PARTIAL | PARTIAL | PARTIAL | Should consume portfolio + market engines |

| Trading | TRD-001 | — | DEV | PARTIAL | PARTIAL | PARTIAL | PARTIAL | Execution engine exists |

| Notifications | NOT-001 | — | PLANNED | PLANNED | PARTIAL | PARTIAL | PARTIAL | Needs consolidation |

| Reporting | RPT-001 | — | PLANNED | PLANNED | PLANNED | PARTIAL | PARTIAL | Future reporting layer |



\## Release 3.0.3 Goals



1\. Migrate Dashboard to shared portfolio/market logic.

2\. Migrate Smart Portfolio away from hardcoded prices.

3\. Migrate Broker screens to shared broker catalog.

4\. Migrate Investor onboarding/edit/profile to one shared shape.

5\. Identify obsolete duplicated files.

