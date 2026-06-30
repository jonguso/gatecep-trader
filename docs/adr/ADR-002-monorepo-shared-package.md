\# ADR-002: Monorepo Shared Package



\## Status



Accepted



\## Date



2026-06-29



\## Context



GateCEP has backend, frontend, mobile, and shared folders. The backend can import shared logic directly, but Expo Metro cannot reliably import files outside the mobile project root without workspace configuration.



A temporary mobile bridge was created for ENG-PORT-001, but this duplicates business logic and violates the GateCEP shared-first principle.



\## Decision



GateCEP will modernize the repository into a workspace-style monorepo where shared business logic is exposed as a package and consumed by backend, frontend, and mobile.



Target package:



```text

@gatecep/shared

