import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("data");
const FILE = path.join(DATA_DIR, "brokerMirrorActions.json");

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, JSON.stringify([], null, 2));
  }
}

function readActions() {
  ensureFile();

  return JSON.parse(
    fs.readFileSync(FILE, "utf-8")
  );
}

function writeActions(actions) {
  ensureFile();

  fs.writeFileSync(
    FILE,
    JSON.stringify(actions, null, 2)
  );
}

export function saveBrokerMirrorAction(action = {}) {
  const actions = readActions();

  const saved = {
    id: `ACT-${Date.now()}`,
    broker: String(action.broker || "AIB").toUpperCase(),
    symbol: String(action.symbol || "").toUpperCase(),
    action: action.action || "REVIEWED",
    quantity: Number(action.quantity || 0),
    reason: action.reason || "",
    createdAt: new Date().toISOString()
  };

  actions.unshift(saved);
  writeActions(actions);

  return saved;
}

export function getBrokerMirrorActions(broker = "AIB") {
  const normalizedBroker = String(broker || "AIB").toUpperCase();

  return readActions().filter(
    (item) => item.broker === normalizedBroker
  );
}