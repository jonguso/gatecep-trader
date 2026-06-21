// This file shows the key changes to make inside backend/src/routes/orders.js

import { postBuyExecution, postSellExecution, reserveBuyOrder } from "../services/accounting/accountingEngine.js";

// Inside handleOrder(), after order is created and brokerResponse is returned:

let accounting = null;

if (selectedBrokerId === "mock-broker") {
  if (cleanSide === "BUY") {
    accounting = postBuyExecution({
      userId,
      symbol: cleanSymbol,
      qty: cleanQty,
      price: cleanPrice,
      orderId: order.id
    });
  } else {
    accounting = postSellExecution({
      userId,
      symbol: cleanSymbol,
      qty: cleanQty,
      price: cleanPrice,
      orderId: order.id
    });
  }

  trades = [{
    symbol: cleanSymbol,
    side: cleanSide,
    price: cleanPrice,
    qty: cleanQty,
    userId,
    brokerId: selectedBrokerId,
    timestamp: Date.now()
  }];

  broadcast("trade", trades[0]);
  broadcast("account_update", { userId });
} else {
  if (cleanSide === "BUY") {
    accounting = reserveBuyOrder({
      userId,
      symbol: cleanSymbol,
      qty: cleanQty,
      price: cleanPrice,
      orderId: order.id
    });
  }
}

// Add accounting to response:
res.json({
  message: "Order routed to selected broker",
  broker,
  order,
  risk,
  accounting,
  brokerResponse,
  trades
});
