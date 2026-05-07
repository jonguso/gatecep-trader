import BrokerAdapter from "./BrokerAdapter.js";

const state = {
  orders: []
};

function now() {
  return new Date().toISOString();
}

export default class MockAbcAdapter extends BrokerAdapter {
  constructor() {
    super({ brokerId: "abc", brokerName: "ABC Capital" });
  }

  async getPortfolio(userBrokerAccount) {
    return {
      brokerId: this.brokerId,
      brokerName: this.brokerName,
      accountNumber: userBrokerAccount?.accountNumber || "ABC-DEMO-001",
      holdings: [
        { symbol: "EABL", name: "East African Breweries PLC", qty: 80, avgPrice: 210.00, marketPrice: 241.75, sector: "Manufacturing and Allied" },
        { symbol: "ABSA", name: "Absa Bank Kenya PLC", qty: 1000, avgPrice: 24.40, marketPrice: 28.30, sector: "Banking" },
        { symbol: "BRIT", name: "Britam Holdings PLC", qty: 2000, avgPrice: 11.75, marketPrice: 16.38, sector: "Insurance" }
      ]
    };
  }

  async getFunds(userBrokerAccount) {
    return {
      brokerId: this.brokerId,
      brokerName: this.brokerName,
      accountNumber: userBrokerAccount?.accountNumber || "ABC-DEMO-001",
      ledgerBalance: 96500,
      availableCash: 89200,
      pendingPayments: 2300,
      pendingBuyOrders: 5000,
      currency: "KES"
    };
  }

  async getOrders(userBrokerAccount) {
    return {
      brokerId: this.brokerId,
      brokerName: this.brokerName,
      accountNumber: userBrokerAccount?.accountNumber || "ABC-DEMO-001",
      orders: [
        ...state.orders.filter(o => o.brokerId === this.brokerId),
        { id: "ABC-HIST-2001", brokerId: this.brokerId, brokerName: this.brokerName, symbol: "EABL", side: "SELL", qty: 10, price: 242.00, status: "PENDING", submittedAt: now() }
      ]
    };
  }

  async placeOrder(userBrokerAccount, order) {
    const brokerOrder = {
      id: `ABC-${Date.now()}`,
      brokerOrderId: `ABC-${Date.now()}`,
      brokerId: this.brokerId,
      brokerName: this.brokerName,
      accountNumber: userBrokerAccount?.accountNumber || "ABC-DEMO-001",
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
