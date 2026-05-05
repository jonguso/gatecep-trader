export const supportedBrokers = [
  {
    id: "mock-broker",
    name: "Gatecep Demo Broker",
    country: "KE",
    status: "DEMO_ONLY",
    supportsLiveTrading: false,
    requiresBrokerAgreement: false
  },
  {
    id: "partner-rest",
    name: "Partner Broker REST Adapter",
    country: "KE",
    status: "PENDING_PARTNER_CREDENTIALS",
    supportsLiveTrading: true,
    requiresBrokerAgreement: true
  }
];
