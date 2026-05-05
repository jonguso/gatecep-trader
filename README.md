# GATECEP Accounting Engine Upgrade

Adds broker-grade accounting logic:

## Core formulas

```text
Order Value = price × quantity
Fees = broker fee + NSE levy + CDS fee
Cash Required = Order Value + Fees

Ledger Balance = posted cash balance
Pending Orders = locked cash for open BUY orders
Pending Payments = pending deposits/withdrawals

Available Funds = Ledger Balance - Pending Orders - Pending Payments
Holdings Current Value = sum(qty × current price)
Total Equity = Ledger Balance + Holdings Current Value
```

## Backend adds

```text
backend/src/services/accounting/fees.js
backend/src/services/accounting/accountingEngine.js
backend/src/routes/accounting.js
```

## Server routes to add

In `backend/src/server.js`:

```js
import {
  getLedger,
  getBalances,
  clearPendingOrders
} from "./routes/accounting.js";

app.get("/ledger", getLedger);
app.get("/balances/:userId", getBalances);
app.post("/orders/clear-pending", clearPendingOrders);
```

## Replace order deduction logic

In `backend/src/routes/orders.js`, use:

```js
import { reserveBuyOrder, postBuyExecution, postSellExecution } from "../services/accounting/accountingEngine.js";
```

For demo instant fill BUY:

```js
const accounting = postBuyExecution({
  userId,
  symbol: cleanSymbol,
  qty: cleanQty,
  price: cleanPrice,
  orderId: order.id
});
```

For pending broker BUY:

```js
const accounting = reserveBuyOrder({
  userId,
  symbol: cleanSymbol,
  qty: cleanQty,
  price: cleanPrice,
  orderId: order.id
});
```

For SELL execution:

```js
const accounting = postSellExecution({
  userId,
  symbol: cleanSymbol,
  qty: cleanQty,
  price: cleanPrice,
  orderId: order.id
});
```

## Mobile adds

```text
mobile/app/(tabs)/portfolio.js
mobile/app/(tabs)/trade.js
```
