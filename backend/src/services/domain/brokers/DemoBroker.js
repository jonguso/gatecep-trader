// backend/src/services/domain/brokers/DemoBroker.js

export const GATECEP_DEMO_BROKER = {
  code: "GATECEP-DEMO",
  name: "Gatecep Demo Broker",
  type: "DEMO",
  status: "CONNECTED",
  source: "SANDBOX"
};

export function isDemoBroker(broker) {
  return String(broker || "").toUpperCase() === GATECEP_DEMO_BROKER.code;
}

export function normalizeDemoTradeHolding(holding = {}) {
  return {
    ...holding,
    broker: GATECEP_DEMO_BROKER.code,
    source: "DEMO_TRADE"
  };
}