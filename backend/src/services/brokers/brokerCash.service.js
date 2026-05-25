import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("data");
const BROKER_CASH_FILE = path.join(DATA_DIR, "broker-cash.json");

const DEFAULT_BROKER_CASH = {
  AIB: {
    broker: "AIB",
    ledgerBalance: 400000,
    reserved: 0,
    pendingSettlement: 0,
    currency: "KES"
  },
  ABC: {
    broker: "ABC",
    ledgerBalance: 350000,
    reserved: 0,
    pendingSettlement: 0,
    currency: "KES"
  },
  NCBA: {
    broker: "NCBA",
    ledgerBalance: 300000,
    reserved: 0,
    pendingSettlement: 0,
    currency: "KES"
  }
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {
      recursive: true
    });
  }
}

function saveBrokerCash(state) {
  ensureDataDir();

  fs.writeFileSync(
    BROKER_CASH_FILE,
    JSON.stringify(state, null, 2)
  );

  return state;
}

export function loadBrokerCash() {
  ensureDataDir();

  if (!fs.existsSync(BROKER_CASH_FILE)) {
    return saveBrokerCash(DEFAULT_BROKER_CASH);
  }

  return JSON.parse(
    fs.readFileSync(BROKER_CASH_FILE, "utf-8")
  );
}

export function getBrokerCashBalances() {
  const state = loadBrokerCash();

  return Object.values(state).map((item) => ({
    ...item,
    buyingPower:
      Number(item.ledgerBalance || 0) -
      Number(item.reserved || 0) -
      Number(item.pendingSettlement || 0)
  }));
}

export function getBrokerCash(broker = "AIB") {
  const state = loadBrokerCash();
  const item = state[broker] || DEFAULT_BROKER_CASH.AIB;

  return {
    ...item,
    buyingPower:
      Number(item.ledgerBalance || 0) -
      Number(item.reserved || 0) -
      Number(item.pendingSettlement || 0)
  };
}

export function reserveBrokerCash({
  broker = "AIB",
  amount
}) {
  const value = Number(amount || 0);
  const state = loadBrokerCash();

  if (!state[broker]) {
    throw new Error("BROKER_NOT_FOUND");
  }

  const current = getBrokerCash(broker);

  if (value > Number(current.buyingPower || 0)) {
    throw new Error("INSUFFICIENT_BROKER_BUYING_POWER");
  }

  state[broker].reserved =
    Number(state[broker].reserved || 0) + value;

  saveBrokerCash(state);

  return getBrokerCash(broker);
}

export function releaseBrokerCash({
  broker = "AIB",
  amount
}) {
  const value = Number(amount || 0);
  const state = loadBrokerCash();

  if (!state[broker]) {
    throw new Error("BROKER_NOT_FOUND");
  }

  state[broker].reserved = Math.max(
    0,
    Number(state[broker].reserved || 0) - value
  );

  saveBrokerCash(state);

  return getBrokerCash(broker);
}

export function settleBrokerBuy({
  broker = "AIB",
  amount
}) {
  const value = Number(amount || 0);
  const state = loadBrokerCash();

  if (!state[broker]) {
    throw new Error("BROKER_NOT_FOUND");
  }

  state[broker].ledgerBalance =
    Number(state[broker].ledgerBalance || 0) - value;

  state[broker].reserved = Math.max(
    0,
    Number(state[broker].reserved || 0) - value
  );

  saveBrokerCash(state);

  return getBrokerCash(broker);
}

export function creditBrokerCash({
  broker = "AIB",
  amount
}) {
  const value = Number(amount || 0);
  const state = loadBrokerCash();

  if (!state[broker]) {
    throw new Error("BROKER_NOT_FOUND");
  }

  state[broker].ledgerBalance =
    Number(state[broker].ledgerBalance || 0) + value;

  saveBrokerCash(state);

  return getBrokerCash(broker);
}