\# GateCEP Architecture Status



\## Status Labels



\- ACTIVE: Currently used by app/backend.

\- STABLE: Production-ready and verified.

\- DEV: Actively being enhanced.

\- DEPRECATED: Still exists but should not be extended.

\- OBSOLETE: No longer used; candidate for archive.

\- ARCHIVED: Historical reference only.



\## Current Foundation Direction



GateCEP uses:



\- backend/ for APIs and services

\- mobile/ for Expo mobile app

\- frontend/ for web

\- shared/ for reusable business logic, constants, market/security data, portfolio calculations, and Coach G engines



\## Rules Going Forward



1\. No new hardcoded market prices.

2\. No duplicated broker lists.

3\. No duplicated investor questionnaire logic.

4\. Shared business logic belongs in shared/.

5\. Every major file we touch gets a status header.

6\. Obsolete files are archived, not deleted immediately.

