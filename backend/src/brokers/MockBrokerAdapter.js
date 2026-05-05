import { v4 as uuidv4 } from "uuid";
import { BrokerAdapter } from "./BrokerAdapter.js";

export class MockBrokerAdapter extends BrokerAdapter {
  async getBrokerProfile() {
    return {
      id: "mock-broker",
      name: "Gatecep Demo Broker",
      licensed: false,
      mode: "demo",
      supportsLiveTrading: false
    };
  }

  async validateAccountLink({ userId, brokerAccountId }) {
    return {
      linked: true,
      userId,
      brokerAccountId: brokerAccountId || "DEMO-CDS-001",
      status: "DEMO_LINKED"
    };
  }

  async routeOrder(order) {
    return {
      accepted: true,
      brokerOrderId: `MOCK-${uuidv4()}`,
      status: "ACCEPTED",
      message: "Demo broker accepted the order"
    };
  }

  async getOrderStatus({ brokerOrderId }) {
    return { brokerOrderId, status: "ACCEPTED" };
  }

  async cancelOrder({ brokerOrderId }) {
    return { brokerOrderId, status: "CANCELLED" };
  }
}
