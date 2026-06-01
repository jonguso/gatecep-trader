import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("data");
const FILE = path.join(
  DATA_DIR,
  "brokerMirrorActions.json"
);

function normalizeBroker(value) {
  const broker = String(value || "AIB-AXYS")
    .trim()
    .toUpperCase();

  if (broker === "AIB") return "AIB-AXYS";
  if (broker === "ABC CAPITAL") return "ABC";

  return broker;
}

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {
      recursive: true
    });
  }

  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(
      FILE,
      JSON.stringify([], null, 2)
    );
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

export function saveBrokerMirrorAction(
  action = {}
) {

  const actions =
    readActions();

  const saved = {

    id:
      `ACT-${Date.now()}`,

    broker:
      normalizeBroker(
        action.broker
      ),

    clientNumber:
      action.clientNumber || "",

    cdsNumber:
      action.cdsNumber || "",

    email:
      action.email || "",

    brokerLinkId:
      action.brokerLinkId || "",

    symbol:
      String(
        action.symbol || ""
      ).toUpperCase(),

    action:
      action.action ||
      "REVIEWED",

    quantity:
      Number(
        action.quantity || 0
      ),

    price:
      Number(
        action.price || 0
      ),

    reason:
      action.reason || "",

    aiConfidence:
      Number(
        action.aiConfidence || 0
      ),

    source:
      action.source ||
      "COACH_G",

    createdAt:
      new Date()
        .toISOString()

  };

  actions.unshift(saved);

  writeActions(actions);

  return saved;
}

export function getBrokerMirrorActions(
  broker = "AIB-AXYS",
  clientNumber = "",
  cdsNumber = ""
) {

  const normalizedBroker =
    normalizeBroker(
      broker
    );

  return readActions().filter(
    (item) =>
      item.broker === normalizedBroker &&

      String(
        item.clientNumber || ""
      ) ===
      String(
        clientNumber || ""
      ) &&

      String(
        item.cdsNumber || ""
      ) ===
      String(
        cdsNumber || ""
      )
  );
}

export function getAllBrokerMirrorActions() {
  return readActions();
}