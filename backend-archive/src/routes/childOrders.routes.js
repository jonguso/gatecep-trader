import express from "express";

import {
  executeSplitOrder,
  getParentExecutions
} from "../services/orders/childOrderExecutor.service.js";

const router = express.Router();

router.post("/execute", (req, res) => {
  try {
    const execution = executeSplitOrder(req.body);

    res.json({
      ok: true,
      execution
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.get("/", (req, res) => {
  res.json({
    ok: true,
    parentExecutions: getParentExecutions()
  });
});

export default router;