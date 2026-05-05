# Real NSE + Broker Integration Plan

## Phase 1 — Licensed market data

Use one of these paths:
1. NSE Data Services direct commercial connection.
2. Authorised NSE information vendor.
3. Broker-provided market data feed under agreement.

Normalize every provider into:

```js
{
  symbol,
  name,
  sector,
  price,
  prevClose,
  changePct,
  volume,
  turnover,
  bidPrice,
  bidQty,
  offerPrice,
  offerQty,
  depth
}
```

## Phase 2 — Broker account linking

For each broker:
- user selects broker
- enters broker account / CDS account
- broker validates link
- Gatecep stores tokenized link metadata only
- no raw broker passwords should be stored

## Phase 3 — Order routing states

```text
DRAFT
PRECHECK
ROUTING
ACCEPTED
REJECTED
PARTIALLY_FILLED
FILLED
CANCELLED
EXPIRED
```

## Phase 4 — Accounting

Real broker mode should not instantly change holdings until execution reports arrive.

Use:
- pending cash lock for BUY
- pending holdings lock for SELL
- posted ledger only after execution report
- settlement status
- broker statement reconciliation

## Phase 5 — Compliance

Keep AI as decision support:
- no guaranteed returns
- no automated trading without authorization
- clear risk disclosure
- retain audit logs
- route trades only through licensed broker
