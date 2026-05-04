import { v4 as uuidv4 } from "uuid";

export default {
  async placeOrder(order) {
    return {
      brokerMode: "MOCK",
      brokerOrderId: "MOCK-BRK-" + uuidv4(),
      brokerStatus: "ACCEPTED",
      executionStatus: "ROUTED_TO_MOCK_BROKER",
      submittedAt: new Date().toISOString(),
      order
    };
  }
};
