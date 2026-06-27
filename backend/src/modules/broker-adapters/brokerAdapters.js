import * as gatecepDemoAdapter from "./gatecepDemo.adapter.js";

const ADAPTERS = {
  "GATECEP-DEMO": gatecepDemoAdapter,
  SIM: gatecepDemoAdapter,
  DEMO: gatecepDemoAdapter
};

export function getBrokerAdapter(brokerId = "GATECEP-DEMO") {
  const key = String(brokerId || "GATECEP-DEMO").toUpperCase();
  return ADAPTERS[key] || gatecepDemoAdapter;
}