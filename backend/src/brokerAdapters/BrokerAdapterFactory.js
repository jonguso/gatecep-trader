import MockAibAdapter from "./MockAibAdapter.js";
import MockAbcAdapter from "./MockAbcAdapter.js";

const adapters = {
  aib: new MockAibAdapter(),
  abc: new MockAbcAdapter()
};

export function getBrokerAdapter(brokerId) {
  return adapters[brokerId] || adapters.aib;
}

export function getSupportedBrokerIds() {
  return Object.keys(adapters);
}
