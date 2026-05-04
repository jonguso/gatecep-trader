# GATECEP Clear Pending Orders + Available Funds Fix

Fixes:
- Top card now displays AVAILABLE FUNDS correctly.
- Adds Clear Pending Orders action.
- Adds backend endpoint to cancel pending/open/routed/accepted demo orders.

Backend server.js:
```js
import { clearPendingOrders } from "./routes/clearPendingOrders.js";
app.post("/orders/clear-pending", clearPendingOrders);
```
