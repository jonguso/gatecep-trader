const fs = require("fs");
const path = require("path");

const tabDir = path.join(__dirname, "app", "(tabs)");
const oldTabs = [
  "trade.js",
  "markets.js",
  "coach.js",
  "brokers.js",
  "Trade.js",
  "Markets.js",
  "Coach.js",
  "Brokers.js"
];

for (const file of oldTabs) {
  const full = path.join(tabDir, file);
  if (fs.existsSync(full)) {
    fs.unlinkSync(full);
    console.log("Removed old tab:", file);
  }
}

console.log("Cleanup complete.");
