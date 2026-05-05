import { MockBrokerAdapter } from "./MockBrokerAdapter.js";
import { PartnerRestBrokerAdapter } from "./PartnerRestBrokerAdapter.js";

export function createBrokerAdapter() {
  const mode = process.env.BROKER_MODE || "mock";

  if (mode === "partner-rest") {
    return new PartnerRestBrokerAdapter({
      baseUrl: process.env.PARTNER_BROKER_BASE_URL,
      apiKey: process.env.PARTNER_BROKER_API_KEY,
      brokerId: "partner-rest"
    });
  }

  return new MockBrokerAdapter();
}

export const brokerAdapter = createBrokerAdapter();
