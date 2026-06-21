\# Gatecep Business Rules



\## Core Principle



Gatecep is an advisory and portfolio management platform.



The system must always reflect the investor's actual broker portfolio.



\---



\## Rule 1: Holdings Source of Truth



Broker Valuation Reports are the official source of holdings.



A valuation report represents the investor's current portfolio at the broker.



When a valuation report is uploaded:



\* Holdings are refreshed.

\* Market values are refreshed.

\* Portfolio allocation is refreshed.

\* Previous valuation data may be replaced.



Valuation data takes precedence over internally calculated positions.



\---



\## Rule 2: Cash Source of Truth



Cash Statements are the official source of available cash.



Cash statements determine:



\* Available Cash

\* Trading Power

\* Ledger Balance

\* Settlement Cash



Dashboard cash balances must come from the latest uploaded cash statement.



\---



\## Rule 3: Transaction History Purpose



Transaction History is not used to build holdings.



Transaction History exists for:



\* Coach G behavioral analysis

\* Buy/sell pattern detection

\* Investor discipline scoring

\* Holding period analysis

\* Risk behavior assessment

\* Performance attribution



Transaction uploads must never overwrite holdings generated from valuation reports.



\---



\## Rule 4: Unified Portfolio Service



All portfolio screens must consume Unified Portfolio.



Examples:



\* Dashboard

\* Portfolio Hub

\* Holdings

\* Portfolio Analysis

\* Coach G

\* Performance

\* Allocation

\* Risk Analysis



No screen should directly calculate portfolio positions independently.



\---



\## Rule 5: Broker Mirror Engine



Broker Mirror stores imported broker reports.



Supported report types:



\* valuation

\* cash

\* transactions



Broker Mirror acts as the staging and reconciliation layer between broker data and Gatecep services.



\---



\## Rule 6: Gatecep Trade Execution



When trading is activated:



Gatecep orders will create incremental portfolio updates.



Example:



Investor buys 100 SCOM through Gatecep.



System updates:



\* Holdings

\* Cash

\* Performance

\* Allocation



without waiting for the next broker upload.



\---



\## Rule 7: Broker Reconciliation



When a new valuation report arrives:



Broker valuation becomes the new source of truth.



Any temporary incremental position calculations are reconciled against broker data.



\---



\## Rule 8: Coach G Responsibilities



Coach G provides:



\* Recommendations

\* Portfolio analysis

\* Diversification analysis

\* Risk analysis

\* Behavioral analysis



Coach G never executes trades directly.



\---



\## Rule 9: Dashboard Rules



Dashboard must display:



\* Total Portfolio Value

\* Invested Value

\* Holdings Count

\* Cash Balance

\* Portfolio Gain/Loss



Values must originate from Unified Portfolio.



\---



\## Rule 10: Future Multi-Broker Support



An investor may connect multiple brokers.



Unified Portfolio must aggregate:



\* AIB

\* ABC

\* NCBA

\* Standard Investment Bank

\* Any future broker



into one consolidated investor view.



