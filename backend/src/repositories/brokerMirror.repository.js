import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("data");
const FILE = path.join(DATA_DIR, "brokerMirror.json");

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {
      recursive: true
    });
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

  return JSON.parse(
    fs.readFileSync(FILE, "utf-8")
  );
}

function writeMirror(data) {
  ensureFile();

  fs.writeFileSync(
    FILE,
    JSON.stringify(data, null, 2)
  );
}

function cleanValue(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

function makeMirrorKey(row = {}, reportType = "") {
  if (reportType === "holdings") {
    return [
      cleanValue(row.broker),
      cleanValue(row.symbol)
    ].join("|");
  }

  if (
    reportType === "transactions" ||
    reportType === "cash"
  ) {
    return [
      cleanValue(row.broker),
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

  if (reportType === "valuation") {
    return [
      cleanValue(row.broker),
      cleanValue(row.symbol),
      cleanValue(row.quantity),
      cleanValue(row.marketValue)
    ].join("|");
  }

  if (reportType === "orders") {
    return [
      cleanValue(row.broker),
      cleanValue(row.symbol),
      cleanValue(row.side),
      cleanValue(row.quantity),
      cleanValue(row.price),
      cleanValue(row.status)
    ].join("|");
  }

  return JSON.stringify(row);
}

function mergeUniqueRows(
  existing = [],
  incoming = [],
  reportType = ""
) {
  const map = new Map();

  for (const row of existing) {
    map.set(
      makeMirrorKey(row, reportType),
      row
    );
  }

  for (const row of incoming) {
    map.set(
      makeMirrorKey(row, reportType),
      row
    );
  }

  return Array.from(map.values());
}

export function saveBrokerMirror(
  broker,
  reportType,
  data
) {
  const mirror = readMirror();

  const normalizedBroker =
    String(broker || "AIB").toUpperCase();

  if (!mirror[reportType]) {
    mirror[reportType] = {};
  }

  const existing =
    mirror[reportType][normalizedBroker] || [];

  const merged =
    mergeUniqueRows(
      existing,
      data,
      reportType
    );

  mirror[reportType][normalizedBroker] = merged;

  writeMirror(mirror);

  return merged;
}

export function getBrokerMirror(
  broker,
  reportType
) {
  const mirror = readMirror();

  const normalizedBroker =
    String(broker || "AIB").toUpperCase();

  return (
    mirror?.[reportType]?.[normalizedBroker] ||
    []
  );
}

export function getEntireMirror() {
  return readMirror();
}