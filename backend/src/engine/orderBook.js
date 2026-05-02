import { applyBuy, applySell, state } from "../store/state.js";

export class OrderBook {
  constructor() { this.books = {}; }
  ensure(symbol) { if (!this.books[symbol]) this.books[symbol] = { bids: [], asks: [] }; return this.books[symbol]; }

  addOrder(order) {
    const book = this.ensure(order.symbol);
    state.orderLog.unshift({ ...order, status: "OPEN", submittedAt: new Date().toISOString() });
    state.auditLog.unshift({ time: new Date().toISOString(), event: "ORDER_SUBMITTED", detail: `${order.side} ${order.qty} ${order.symbol} @ ${order.price}` });

    if (order.side === "BUY") {
      book.bids.push(order);
      book.bids.sort((a, b) => b.price - a.price || a.createdAt - b.createdAt);
    } else {
      book.asks.push(order);
      book.asks.sort((a, b) => a.price - b.price || a.createdAt - b.createdAt);
    }
    return this.match(order.symbol);
  }

  match(symbol) {
    const book = this.ensure(symbol);
    const trades = [];
    while (book.bids.length && book.asks.length) {
      const bid = book.bids[0], ask = book.asks[0];
      if (bid.price < ask.price) break;
      const qty = Math.min(bid.qty, ask.qty);
      const price = ask.price;
      try {
        applyBuy(bid.userId, symbol, qty, price);
        applySell(ask.userId, symbol, qty, price);
      } catch (err) {
        if (err.message.includes("cash")) book.bids.shift();
        else if (err.message.includes("shares")) book.asks.shift();
        else throw err;
        continue;
      }
      const trade = { symbol, price, qty, buyerUserId: bid.userId, sellerUserId: ask.userId, buyOrderId: bid.id, sellOrderId: ask.id, timestamp: Date.now() };
      trades.push(trade);
      state.auditLog.unshift({ time: new Date().toISOString(), event: "TRADE_EXECUTED", detail: `${qty} ${symbol} @ ${price}` });
      bid.qty -= qty; ask.qty -= qty;
      if (bid.qty === 0) book.bids.shift();
      if (ask.qty === 0) book.asks.shift();
    }
    return trades;
  }

  getOrderBook(symbol = "SCOM") { const b = this.ensure(symbol); return { symbol, bids: b.bids.slice(0, 10), asks: b.asks.slice(0, 10) }; }
}
export const engine = new OrderBook();
