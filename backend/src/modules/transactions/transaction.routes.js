import express from "express";
import { authRequired } from "../../middleware/authRequired.js";
import {
  getTransactions,
  recordTransaction
} from "./transaction.service.js";

const router = express.Router();

router.get("/", authRequired, async (req, res) => {
  try {
    const result = await getTransactions(req.user.id, {
      broker: req.query.broker,
      type: req.query.type,
      limit: req.query.limit
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.post("/", authRequired, async (req, res) => {
  try {
    const transaction = await recordTransaction(req.user.id, req.body);

    res.json({
      ok: true,
      transaction
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;