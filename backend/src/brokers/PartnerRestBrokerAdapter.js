import { BrokerAdapter } from "./BrokerAdapter.js";

export class PartnerRestBrokerAdapter extends BrokerAdapter {
  constructor({ baseUrl, apiKey, brokerId = "partner-rest" }) {
    super();
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.brokerId = brokerId;
  }

  async request(path, options = {}) {
    if (!this.baseUrl || !this.apiKey) {
      throw new Error("Partner broker API credentials are not configured");
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options.headers || {})
      }
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Broker API error ${res.status}: ${text}`);
    }

    return res.json();
  }

  async getBrokerProfile() {
    return this.request("/broker/profile");
  }

  async validateAccountLink({ userId, brokerAccountId, cdsAccount }) {
    return this.request("/accounts/link/validate", {
      method: "POST",
      body: JSON.stringify({ userId, brokerAccountId, cdsAccount })
    });
  }

  async routeOrder(order) {
    return this.request("/orders", {
      method: "POST",
      body: JSON.stringify({
        clientOrderId: order.id,
        brokerAccountId: order.brokerAccountId,
        symbol: order.symbol,
        side: order.side,
        quantity: order.qty,
        limitPrice: order.price,
        orderType: order.orderType || "LIMIT",
        validity: order.validity || "DAY"
      })
    });
  }

  async getOrderStatus({ brokerOrderId }) {
    return this.request(`/orders/${brokerOrderId}`);
  }

  async cancelOrder({ brokerOrderId }) {
    return this.request(`/orders/${brokerOrderId}/cancel`, { method: "POST" });
  }
}
