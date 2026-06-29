\# GateCEP Dependency Graph



\## Release



GateCEP 3.1 – Platform Consolidation



\## Purpose



Tracks how GateCEP domains, engines, APIs, and screens depend on each other.



\## Core Engines



| Engine | ID | Depends On | Used By |

|---|---|---|---|

| Portfolio Engine | ENG-PORT-001 | MKT-001, CASH-001, SEC-001 | Dashboard, Portfolio Hub, Coach G, Goal Tracker |

| Market Engine | ENG-MKT-001 | SEC-001 | Dashboard, Portfolio, Trading, Watchlist, Smart Portfolio |

| Cash Engine | ENG-CASH-001 | CASH-001 | Dashboard, Funds, Portfolio, Trading |

| Risk Engine | ENG-RISK-001 | INV-001, PORT-001 | Coach G, Investor Profile |

| Goal Engine | ENG-GOAL-001 | INV-001, PORT-001 | Goal Tracker, Coach G |



\## Screen Dependencies



| Screen | Depends On |

|---|---|

| Dashboard | ENG-PORT-001, ENG-MKT-001, CASH-001, BRK-001, CG-001 |

| Live Dashboard | ENG-PORT-001, ENG-MKT-001, BRK-001, TRD-001 |

| Portfolio Hub | ENG-PORT-001, MKT-001, CASH-001 |

| Smart Portfolio | ENG-MKT-001, ENG-PORT-001, INV-001 |

| My Profile | INV-001, BRK-001, CASH-001, PORT-001 |

| Broker Profile | BRK-001, shared/constants/brokers.js |

| Funds | CASH-001, BRK-001 |

| Watchlist | ENG-MKT-001, SEC-001, CG-001 |



\## Rule



If a screen performs a business calculation that belongs to an engine, it must be migrated into shared/.

