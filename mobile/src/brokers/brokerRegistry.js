export const BROKER_REGISTRY = [
  {
    id: "SIM",
    name: "Simulation Broker",
    shortName: "SIM",
    adapter: "simulation",
    status: "ACTIVE",
    apiMode: "SIMULATION",
    bestFor: "Testing OMS execution"
  },
  {
    id: "AIB",
    name: "AIB-AXYS",
    shortName: "AIB",
    adapter: "simulation",
    status: "PENDING_API",
    apiMode: "MANUAL_PROFILE",
    bestFor: "All-round NSE execution"
  },
  {
    id: "ABC",
    name: "ABC Capital",
    shortName: "ABC",
    adapter: "simulation",
    status: "PENDING_API",
    apiMode: "MANUAL_PROFILE",
    bestFor: "Digital onboarding and research"
  },
  {
    id: "NCBA",
    name: "NCBA Investment Bank",
    shortName: "NCBA",
    adapter: "simulation",
    status: "PENDING_API",
    apiMode: "MANUAL_PROFILE",
    bestFor: "Banking integration"
  },
  {
    id: "DYER",
    name: "Dyer & Blair",
    shortName: "Dyer",
    adapter: "simulation",
    status: "PENDING_API",
    apiMode: "MANUAL_PROFILE",
    bestFor: "Full-service advisory"
  },
  {
    id: "FAIDA",
    name: "Faida Investment Bank",
    shortName: "Faida",
    adapter: "simulation",
    status: "PENDING_API",
    apiMode: "MANUAL_PROFILE",
    bestFor: "Retail investor access"
  }
];

export function findBrokerById(id) {
  return (
    BROKER_REGISTRY.find(
      (broker) => String(broker.id).toUpperCase() === String(id).toUpperCase()
    ) || BROKER_REGISTRY[0]
  );
}