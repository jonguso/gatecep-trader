\# GateCEP Decision Dashboard



\## Purpose



Tracks major architecture decisions and their status.



| Decision | Status | ADR | Owner | Notes |

|---|---|---|---|---|

| Shared-first architecture | Accepted | ADR-001 | Architecture | shared/ is the source of reusable business logic |

| Monorepo shared package | Accepted | ADR-002 | Platform | target package is @gatecep/shared |

| Portfolio engine facade | Accepted | Pending ADR | Portfolio | apps import engine.js instead of internals |

| Market provider abstraction | Accepted | Pending ADR | Market | local/demo/NSE/future providers |

| Investor profile SSoT | Accepted | Pending ADR | Investor | investor\_profiles + constraints JSON |

| Cash engine | Planned | Pending ADR | Cash | centralize available cash/buying power |

| Broker catalog | Accepted | Pending ADR | Broker | shared/constants/brokers.js |

