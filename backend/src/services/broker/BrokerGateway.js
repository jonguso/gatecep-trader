import MockBrokerAdapter from "./MockBrokerAdapter.js";
import PlaceholderBrokerAdapter from "./PlaceholderBrokerAdapter.js";
import { getBroker } from "../../data/brokers.js";

export class BrokerGateway {
  getAdapter(brokerId) {
    const broker = getBroker(brokerId);
    if (!broker) throw new Error("Broker not found");
    if (broker.id === "mock-broker" || broker.supportsApiTrading) return MockBrokerAdapter;
    return PlaceholderBrokerAdapter;
  }

  async placeOrder(order) {
    return this.getAdapter(order.brokerId).placeOrder(order);
  }
}

export const brokerGateway = new BrokerGateway();
