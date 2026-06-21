export default class BrokerAdapter {
  constructor({ brokerId, brokerName }) {
    this.brokerId = brokerId;
    this.brokerName = brokerName;
  }

  async getPortfolio(userBrokerAccount) {
    throw new Error("getPortfolio not implemented");
  }

  async getFunds(userBrokerAccount) {
    throw new Error("getFunds not implemented");
  }

  async getOrders(userBrokerAccount) {
    throw new Error("getOrders not implemented");
  }

  async placeOrder(userBrokerAccount, order) {
    throw new Error("placeOrder not implemented");
  }

  async cancelOrder(userBrokerAccount, orderId) {
    throw new Error("cancelOrder not implemented");
  }
}
