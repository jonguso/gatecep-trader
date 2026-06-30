\# ADR-003



\## Runtime Boundary



\### Decision



GateCEP production applications (Backend, Mobile, Web) shall not import root shared/ directly until the @gatecep/shared workspace package has been completed.



\### Reason



Different runtimes resolve filesystem boundaries differently.



Backend:



Node



Mobile:



Expo Metro



Web:



React/Vite



Each runtime must consume shared business logic through a package rather than relative filesystem imports.



\### Status



Accepted



\### Target



GateCEP 3.2



\# ADR-003: Runtime Boundary



\## Status



Accepted



\## Date



2026-06-30



\## Context



GateCEP contains backend, frontend, mobile, and shared folders. Direct relative imports from production runtimes into root shared/ caused Railway backend startup failure because shared/ was not available in the deployed backend runtime.



Expo Metro also cannot reliably import root shared/ without workspace configuration.



\## Decision



Production runtimes must not import root shared/ directly using relative paths.



Shared logic must be exposed through package boundaries, starting with:



@gatecep/shared



\## Consequences



\- Backend, web, and mobile must consume shared logic through package/workspace configuration.

\- Temporary bridge files are allowed only when marked TEMPORARY.

\- Shared engines remain canonical design assets.

\- Runtime migration resumes only after package consumption is validated.

