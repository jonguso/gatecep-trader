import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("data");
const WALLET_FILE = path.join(DATA_DIR, "wallet.json");

const DEFAULT_WALLET = {
  balance: 1000000,
  ledgerBalance: 1000000,
  pendingOrders: 0,
  pendingSettlement: 0,
  currency: "KES",
  updatedAt: new Date().toISOString()
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {
      recursive: true
    });
  }
}

export function loadWallet() {
  ensureDataDir();

  if (!fs.existsSync(WALLET_FILE)) {
    saveWallet(DEFAULT_WALLET);
    return DEFAULT_WALLET;
  }

  return JSON.parse(
    fs.readFileSync(WALLET_FILE, "utf-8")
  );
}

export function saveWallet(wallet) {
  ensureDataDir();

  const payload = {
    ...DEFAULT_WALLET,
    ...wallet,
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    WALLET_FILE,
    JSON.stringify(payload, null, 2)
  );

  return payload;
}