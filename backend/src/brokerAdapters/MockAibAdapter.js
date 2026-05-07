import BrokerAdapter from "./BrokerAdapter.js";

const state = {
  orders: []
};

function now() {
  return new Date().toISOString();
}

export default class MockAibAdapter extends BrokerAdapter {
  constructor() {
    super({ brokerId: "aib", brokerName: "AIB-AXYS Africa" });
  }

  async getPortfolio(userBrokerAccount) {
    return {
      brokerId: this.brokerId,
      brokerName: this.brokerName,
      accountNumber: userBrokerAccount?.accountNumber || "AIB-DEMO-001",
      holdings: [
        { symbol: "SCOM", name: "Safaricom PLC", qty: 1200, avgPrice: 23.75, marketPrice: 29.85, sector: "Telecommunication" },
        { symbol: "KCB", name: "KCB Group PLC", qty: 300, avgPrice: 51.20, marketPrice: 67.50, sector: "Banking" },
        { symbol: "EQTY", name: "Equity Group Holdings PLC", qty: 450, avgPrice: 56.00, marketPrice: 74.50, sector: "Banking" }
      ]
    };
  }

  async getFunds(userBrokerAccount) {
    return {
      brokerId: this.brokerId,
      brokerName: this.brokerName,
      accountNumber: userBrokerAccount?.accountNumber || "AIB-DEMO-001",
      ledgerBalance: 185000,
      availableCash: 162500,
      pendingPayments: 7500,
      pendingBuyOrders: 15000,
      currency: "KES"
    };
  }

  async getOrders(userBrokerAccount) {
    return {
      brokerId: this.brokerId,
      brokerName: this.brokerName,
      accountNumber: userBrokerAccount?.accountNumber || "AIB-DEMO-001",
      orders: [
        ...state.orders.filter(o => o.brokerId === this.brokerId),
        { id: "AIB-HIST-1001", brokerId: this.brokerId, brokerName: this.brokerName, symbol: "SCOM", side: "BUY", qty: 200, price: 29.50, status: "EXECUTED", submittedAt: now() }
      ]
    };
  }

  async placeOrder(userBrokerAccount, order) {
    const brokerOrder = {
      id: `AIB-${Date.now()}`,
      brokerOrderId: `AIB-${Date.now()}`,
      brokerId: this.brokerId,
      brokerName: this.brokerName,
      accountNumber: userBrokerAccount?.accountNumber || "AIB-DEMO-001",
      symbol: order.symbol,
      side: order.side,
      qty: Number(order.qty),
      price: Number(order.price),
      status: "PENDING_BROKER_CONFIRMATION",
      submittedAt: now()
    };

    state.orders.unshift(brokerOrder);
    return brokerOrder;
  }

  async cancelOrder(userBrokerAccount, orderId) {
    const order = state.orders.find(o => o.id === orderId || o.brokerOrderId === orderId);
    if (!order) return { cancelled: false, message: "Order not found or already executed." };
    order.status = "CANCELLED";
    return { cancelled: true, order };
  }
}
