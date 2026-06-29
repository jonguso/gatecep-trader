\# GateCEP Shared Engine Guidelines



\## Purpose



Shared engines contain reusable business logic for backend, web, mobile, and Coach G.



\## Rules



An engine must not contain:



\- React

\- React Native

\- Express route logic

\- Database queries

\- Railway-specific code

\- UI components



An engine must:



\- Accept plain JavaScript objects and arrays

\- Return plain JavaScript objects

\- Be deterministic

\- Be unit-testable

\- Be reusable by backend, web, and mobile



\## Engine IDs



| Engine | ID |

|---|---|

| Portfolio Engine | ENG-PORT-001 |

| Market Engine | ENG-MKT-001 |

| Cash Engine | ENG-CASH-001 |

| Risk Engine | ENG-RISK-001 |

| Goal Engine | ENG-GOAL-001 |

| Dividend Engine | ENG-DIV-001 |

| Recommendation Engine | ENG-REC-001 |

