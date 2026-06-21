\# Gatecep System Architecture



\## Overview



Gatecep is a broker-agnostic investment platform consisting of:



\* Mobile Application

\* Backend API

\* Broker Mirror Engine

\* Unified Portfolio Engine

\* Coach G AI Layer

\* Order Management System (OMS)

\* Market Data Gateway



\---



\# Mobile Layer



Location:



```text

/mobile

```



Major Modules:



```text

Dashboard

Portfolio Hub

Portfolio Analysis

Portfolio Sync Center

Import Portfolio

Broker Upload

Coach G

Trading

Markets

My Profile

Broker Profile

```



\---



\# Backend Layer



Location:



```text

/backend/src

```



Responsibilities:



\* Portfolio calculations

\* Broker integrations

\* Market data

\* Coach G analytics

\* Trade execution

\* Cash management



\---



\# Broker Mirror Engine



Repository:



```text

backend/src/repositories/brokerMirror.repository.js

```



Purpose:



Store imported broker information.



Supported report types:



```text

valuation

cash

transactions

holdings

```



Primary APIs:



```text

POST /broker-reports/import

GET  /broker-reports/mirror/:broker/:reportType

GET  /broker-reports/summary/:broker

```



\---



\# Unified Portfolio Engine



Service:



```text

backend/src/services/portfolio/unifiedPortfolio.service.js

```



Purpose:



Create one consolidated portfolio view.



Inputs:



```text

Broker Mirror (valuation)

Market Data Gateway

Security Master

```



Outputs:



```text

totalMarketValue

totalPnL

holdings

brokerSummary

allocation

```



Primary API:



```text

GET /portfolio/unified

```



\---



\# Broker Portfolio Engine



Route:



```text

backend/src/routes/brokerPortfolio.routes.js

```



Purpose:



Return broker-level portfolio views.



Primary API:



```text

GET /broker-portfolio/:broker

```



Current production portfolio source.



\---



\# Coach G Engine



Routes:



```text

/coach

/coach-g

```



Purpose:



Provide investment intelligence.



Capabilities:



```text

Risk analysis

Portfolio review

Diversification review

Investor behavior analysis

Broker recommendations

Investment planning

```



\---



\# Market Data Gateway



Service:



```text

backend/src/services/marketData

```



Purpose:



Provide market pricing.



Current state:



```text

Demo / Seed Pricing

```



Future state:



```text

Live NSE Pricing

Real-time updates

```



\---



\# Order Management System (OMS)



Routes:



```text

/orders

/order-book

/execution

```



Purpose:



Manage order lifecycle.



Lifecycle:



```text

QUEUED

ROUTED

ACCEPTED

PARTIAL\_FILL

FILLED

REJECTED

```



\---



\# Portfolio Sync Center



Purpose:



Allow investors to verify synchronization status.



Displays:



```text

Broker Connected

Holdings Count

Transaction Count

Cash Status

Portfolio Source

```



\---



\# Security Master



Purpose:



Normalize securities.



Example:



```text

SCOM -> Safaricom PLC

EABL -> East African Breweries

KCB  -> KCB Group

```



Used by:



```text

Portfolio Import

Broker Portfolio

Unified Portfolio

Coach G

```



\---



\# Current Source of Truth Hierarchy



Priority 1



```text

Broker Valuation

```



Priority 2



```text

Cash Statement

```



Priority 3



```text

Transaction History

```



Priority 4



```text

Execution Engine Updates

```



\---



\# Future Architecture



```text

Multiple Brokers

&#x20;       │

&#x20;       ▼

Broker Mirror Engine

&#x20;       │

&#x20;       ▼

Unified Portfolio

&#x20;       │

&#x20;       ▼

Coach G AI Layer

&#x20;       │

&#x20;       ▼

Broker Routing Engine

&#x20;       │

&#x20;       ▼

Live Trade Execution

```



