export class BrokerAdapter {
  async getBrokerProfile() {
    throw new Error("getBrokerProfile() not implemented");
  }

  async validateAccountLink({ userId, brokerAccountId }) {
    throw new Error("validateAccountLink() not implemented");
  }

  async routeOrder(order) {
    throw new Error("routeOrder(order) not implemented");
  }

  async getOrderStatus({ brokerOrderId }) {
    throw new Error("getOrderStatus() not implemented");
  }

  async cancelOrder({ brokerOrderId }) {
    throw new Error("cancelOrder() not implemented");
  }
}
