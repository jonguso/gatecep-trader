\# Gatecep Data Flow



\## High Level Architecture



```text

&#x20;                   BROKER REPORTS

&#x20;                         │

&#x20;         ┌───────────────┼───────────────┐

&#x20;         │               │               │

&#x20;     Valuation         Cash        Transactions

&#x20;         │               │               │

&#x20;         ▼               ▼               ▼

&#x20;  Broker Mirror    Broker Mirror   Broker Mirror

&#x20;   (valuation)        (cash)      (transactions)

&#x20;         │               │               │

&#x20;         └───────┬───────┴───────┬───────┘

&#x20;                 │               │

&#x20;                 ▼               ▼

&#x20;         Unified Portfolio   Coach G Analytics

&#x20;                 │

&#x20;                 ▼

&#x20;     ┌───────────┼────────────┐

&#x20;     │           │            │

&#x20;     ▼           ▼            ▼

&#x20;Dashboard   Portfolio Hub   Holdings

&#x20;     │

&#x20;     ▼

&#x20;Performance / Allocation / Risk

```



\---



\## Valuation Upload Flow



Purpose:

Determine the investor's actual holdings.



Flow:



```text

Investor Uploads Valuation

&#x20;           │

&#x20;           ▼

&#x20;Import Portfolio Screen

&#x20;           │

&#x20;           ▼

&#x20;Review Portfolio Import

&#x20;           │

&#x20;           ▼

&#x20;POST /broker-reports/import

&#x20;           │

&#x20;           ▼

&#x20;Broker Mirror (valuation)

&#x20;           │

&#x20;           ▼

&#x20;Unified Portfolio

&#x20;           │

&#x20;           ▼

&#x20;Dashboard

&#x20;Portfolio Hub

&#x20;Holdings

&#x20;Coach G

```



Fields expected:



\* symbol

\* quantity

\* averagePrice

\* marketPrice

\* marketValue



\---



\## Cash Upload Flow



Purpose:

Determine available funds.



Flow:



```text

Investor Uploads Cash Statement

&#x20;           │

&#x20;           ▼

&#x20;Cash Import

&#x20;           │

&#x20;           ▼

&#x20;POST /broker-reports/import

&#x20;reportType = cash

&#x20;           │

&#x20;           ▼

&#x20;Broker Mirror (cash)

&#x20;           │

&#x20;           ▼

&#x20;Available Cash

&#x20;           │

&#x20;           ▼

&#x20;Dashboard

&#x20;Trading

&#x20;Order Validation

```



\---



\## Transaction Upload Flow



Purpose:

Understand investor behavior.



Flow:



```text

Investor Uploads Transactions

&#x20;           │

&#x20;           ▼

&#x20;Transaction Import

&#x20;           │

&#x20;           ▼

&#x20;Broker Mirror (transactions)

&#x20;           │

&#x20;           ▼

&#x20;Coach G Analytics

&#x20;           │

&#x20;           ▼

&#x20;Risk Profile

&#x20;Behavior Analysis

&#x20;Investor Scoring

```



Transactions do not create holdings.



Transactions do not override valuation data.



\---



\## Unified Portfolio Flow



Purpose:

Provide a single portfolio source for the application.



Flow:



```text

Broker Mirror (valuation)

&#x20;           │

&#x20;           ▼

&#x20;Unified Portfolio Service

&#x20;           │

&#x20;           ▼

&#x20;Dashboard

&#x20;Portfolio Hub

&#x20;Holdings

&#x20;Performance

&#x20;Allocation

&#x20;Risk

&#x20;Coach G

```



\---



\## Future Trading Flow



Purpose:

Support live Gatecep trading.



Flow:



```text

Investor Places Order

&#x20;           │

&#x20;           ▼

&#x20;OMS

&#x20;           │

&#x20;           ▼

&#x20;Execution Engine

&#x20;           │

&#x20;           ▼

&#x20;Broker

&#x20;           │

&#x20;           ▼

&#x20;Filled Order

&#x20;           │

&#x20;           ▼

&#x20;Incremental Portfolio Update

&#x20;           │

&#x20;           ▼

&#x20;Holdings Update

&#x20;Cash Update

&#x20;P\&L Update

```



\---



\## Reconciliation Flow



Purpose:

Keep Gatecep aligned with broker records.



Flow:



```text

New Broker Valuation Uploaded

&#x20;           │

&#x20;           ▼

&#x20;Broker Mirror Updated

&#x20;           │

&#x20;           ▼

&#x20;Unified Portfolio Rebuilt

&#x20;           │

&#x20;           ▼

&#x20;Gatecep Holdings Reconciled

```



Broker valuation always wins during reconciliation.



\---



\## Current Production Source of Truth



| Data Type         | Source                                 |

| ----------------- | -------------------------------------- |

| Holdings          | Broker Valuation                       |

| Market Value      | Broker Valuation (until live NSE feed) |

| Available Cash    | Cash Statement                         |

| Transactions      | Transaction Upload                     |

| Investor Behavior | Coach G Analytics                      |

| Portfolio View    | Unified Portfolio                      |

| Trading Updates   | Execution Engine                       |



