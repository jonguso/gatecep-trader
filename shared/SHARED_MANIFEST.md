\# GateCEP Shared Manifest



\## Purpose



The shared folder is the single source of truth for business logic, constants, broker definitions, security master data, market rules, portfolio calculations, and Coach G engines.



\## Status Labels



\- ACTIVE: Used by backend/mobile/web.

\- DEV: Under active build.

\- PLACEHOLDER: Created but not implemented.

\- DEPRECATED: Replaced by newer shared logic.

\- OBSOLETE: Safe to archive.



\## Current Status



| File | Status | Purpose |

|---|---|---|

| shared/constants/brokers.js | ACTIVE | Broker catalog |

| shared/constants/investorProfiles.js | ACTIVE | Investor profile types |

| shared/constants/riskProfiles.js | ACTIVE | Risk definitions |

| shared/securityMaster/nseSecurities.js | ACTIVE | NSE securities seed |

| shared/securityMaster/securityMaster.js | ACTIVE | Security master helpers |

| shared/utils/normalizeBroker.js | ACTIVE | Broker code normalization |

| shared/version/versionRegistry.js | ACTIVE | Version registry |

| shared/portfolio/calculations.js | DEV | Portfolio valuation engine |

| shared/portfolio/allocation.js | DEV | Allocation calculations |

| shared/market/ | DEV | Market data contracts |

| shared/coachg/riskEngine.js | DEV | Coach G risk logic |

| shared/coachg/recommendations.js | DEV | Coach G recommendations |

