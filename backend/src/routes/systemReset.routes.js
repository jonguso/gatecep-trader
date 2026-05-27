import express from "express";
import fs from "fs/promises";
import path from "path";
import { pool } from "../config/db.js";
import {
  clearExecutionQueue
} from "../services/orders/executionQueue.service.js";
import {
  resetExecutionQueue
} from "../services/orders/executionQueue.service.js";

const router = express.Router();

async function wipeFile(filePath, emptyData = []) {
  try {
    await fs.mkdir(path.dirname(filePath), {
      recursive: true
    });

    await fs.writeFile(
      filePath,
      JSON.stringify(emptyData, null, 2),
      "utf8"
    );

    console.log("Wiped:", filePath);
  } catch (error) {
    console.error(
      "Failed wiping:",
      filePath,
      error.message
    );
  }
}

async function hardResetSimulation() {
  const base = path.resolve(
  process.cwd(),
  "data"
);

  await wipeFile(path.join(base, "orders.json"), []);
  await wipeFile(path.join(base, "persistentOrders.json"), []);
  await wipeFile(path.join(base, "positions.json"), []);
  await wipeFile(path.join(base, "tradeJournal.json"), []);
  await wipeFile(path.join(base, "timeSales.json"), []);
  await wipeFile(path.join(base, "realizedTrades.json"), []);
  await wipeFile(path.join(base, "notifications.json"), []);

  await wipeFile(path.join(base, "wallet.json"), {
    balance: 1000000,
    pendingOrders: 0
  });

  await wipeFile(path.join(base, "brokerCash.json"), {
    AIB: 500000,
    ABC: 500000,
    NCBA: 500000
  });
}

async function hardResetDatabase() {
  await pool.query(`
    DELETE FROM execution_fills;
    DELETE FROM child_orders;
    DELETE FROM parent_executions;
    DELETE FROM pnl_ledger;
    DELETE FROM positions;
    DELETE FROM order_events;
    DELETE FROM orders;
  `);

  console.log("Gatecep database simulation tables reset.");
}

router.post("/", async (req, res) => {
  try {
    clearExecutionQueue();

    global.executionQueue = [];
    global.positions = [];
    global.realizedTrades = [];
    global.tradeJournal = [];
    global.timeSales = [];

    global.wallet = {
      balance: 1000000,
      pendingOrders: 0
    };

    global.brokerCash = {
      AIB: 500000,
      ABC: 500000,
      NCBA: 500000
    };

    await hardResetSimulation();

    await hardResetDatabase();

    res.json({
      ok: true,
      message:
        "Gatecep FULL simulation reset completed."
    });
  } catch (error) {
    console.error("System reset failed:", error);

    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;