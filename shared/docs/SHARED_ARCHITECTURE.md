\# Gatecep Shared Architecture



The shared folder contains reusable business logic used by backend, mobile, and web.



Shared should contain:



\- constants

\- security master

\- portfolio calculations

\- Coach G scoring logic

\- version registry

\- pure utility functions



Shared must not contain:



\- React components

\- Express routes

\- database repositories

\- mobile screens

\- web pages

\- local storage logic



Core rule:



backend = APIs and persistence  

mobile = mobile UI  

web = web UI  

shared = reusable business rules

