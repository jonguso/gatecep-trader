import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("data");
const FILE = path.join(DATA_DIR, "brokerMirror.json");

function normalizeBroker(value) {
  const broker = String(value || "AIB-AXYS").trim().toUpperCase();

  if (broker === "AIB") return "AIB-AXYS";
  if (broker === "ABC CAPITAL") return "ABC";

  return broker;
}

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(
      FILE,
      JSON.stringify(
        {
          holdings: {},
          valuation: {},
          orders: {},
          transactions: {},
          cash: {}
        },
        null,
        2
      )
    );
  }
}

function readMirror() {
  ensureFile();
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}

function writeMirror(data) {
  ensureFile();
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function cleanValue(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

function makeMirrorKey(row = {}, reportType = "") {
  const broker = normalizeBroker(row.broker);

  if (reportType === "holdings") {
    return [
      broker,
      cleanValue(row.clientNumber),
      cleanValue(row.cdsNumber),
      cleanValue(row.symbol)
    ].join("|");
  }

  if (reportType === "valuation") {
    return [
      broker,
      cleanValue(row.clientNumber),
      cleanValue(row.cdsNumber),
      cleanValue(row.symbol),
      cleanValue(row.quantity),
      cleanValue(row.marketValue)
    ].join("|");
  }

  if (reportType === "orders") {
    return [
      broker,
      cleanValue(row.clientNumber),
      cleanValue(row.cdsNumber),
      cleanValue(row.symbol),
      cleanValue(row.side),
      cleanValue(row.quantity),
      cleanValue(row.price),
      cleanValue(row.status)
    ].join("|");
  }

  if (reportType === "transactions" || reportType === "cash") {
    return [
      broker,
      cleanValue(row.clientNumber),
      cleanValue(row.cdsNumber),
      cleanValue(row.date),
      cleanValue(row.type),
      cleanValue(row.symbol),
      cleanValue(row.quantity),
      cleanValue(row.price),
      cleanValue(row.amount),
      cleanValue(row.description),
      cleanValue(row.debit),
      cleanValue(row.credit),
      cleanValue(row.balance)
    ].join("|");
  }

  return JSON.stringify(row);
}

function mergeUniqueRows(existing = [], incoming = [], reportType = "") {
  const map = new Map();

  for (const row of existing) {
    map.set(makeMirrorKey(row, reportType), row);
  }

  for (const row of incoming) {
    map.set(makeMirrorKey(row, reportType), row);
  }

  return Array.from(map.values());
}

export function saveBrokerMirror(broker, reportType, data, options = {}) {
  const mirror = readMirror();
  const normalizedBroker = normalizeBroker(broker);

  if (!mirror[reportType]) {
    mirror[reportType] = {};
  }

  const existing = mirror[reportType][normalizedBroker] || [];

  const enrichedData = Array.isArray(data)
    ? data.map((row) => ({
        ...row,
        broker: normalizedBroker,
        clientNumber: row.clientNumber || options.clientNumber || "",
        cdsNumber: row.cdsNumber || options.cdsNumber || "",
        email: row.email || options.email || "",
        brokerLinkId: row.brokerLinkId || options.brokerLinkId || ""
      }))
    : [];

  const merged = options.replace
    ? enrichedData
    : mergeUniqueRows(existing, enrichedData, reportType);

  mirror[reportType][normalizedBroker] = merged;

  writeMirror(mirror);

  return merged;
}

export function getBrokerMirror(broker, reportType) {
  const mirror = readMirror();
  const normalizedBroker = normalizeBroker(broker);

  return mirror?.[reportType]?.[normalizedBroker] || [];
}

export function getEntireMirror() {
  return readMirror();
}