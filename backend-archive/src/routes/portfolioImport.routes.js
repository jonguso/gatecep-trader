import express from "express";
import { importPosition } from "../services/positions/position.service.js";

const router = express.Router();

router.post("/import", async (req, res) => {
  try {
    const rows = Array.isArray(req.body?.rows) ? req.body.rows : [];

    const saved = [];

    for (const row of rows) {
      const quantity = Number(row.quantity || 0);
      const averageCost = Number(
        row.averageCost || row.averagePrice || row.costPrice || 0
      );

      if (!row.symbol || quantity <= 0) continue;

      const position = {
        broker: row.broker || "AIB-AXYS",
        symbol: String(row.symbol).toUpperCase().trim(),
        quantity,
        averageCost,
        realizedPnL: Number(row.realizedPnL || 0),
        updatedAt: new Date().toISOString()
      };

      const savedPosition = importPosition(position);
if (savedPosition) saved.push(savedPosition);
     
    }

    res.json({
      success: true,
      count: saved.length,
      positions: saved
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;