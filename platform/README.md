\# GateCEP Developer Platform



\## Status



DEV



\## Release



GateCEP 3.2



\## Purpose



The platform folder contains workspace tooling, package boundaries, templates, generators, validators, scaffolds, and bootstrap utilities for GateCEP.



\## Goal



Make GateCEP easier to develop, safer to refactor, and ready for shared package consumption across backend, web, and mobile.



\## Target Packages



\- @gatecep/shared

\- @gatecep/config

\- @gatecep/types

\- @gatecep/testing

\- @gatecep/ui



\## Rule



Production runtimes must not import root shared/ by relative path. Shared logic must be consumed through package boundaries.

