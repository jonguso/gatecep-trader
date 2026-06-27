import express from "express";
import { authRequired } from "../../middleware/authRequired.js";
import {
  syncBroker,
  settleBroker,
  placeBrokerOrder
} from "./brokerSync.service.js";

const router = express.Router();

router.get("/:brokerId/sync", authRequired, async (req, res) => {
  try {
    const result = await syncBroker(req.user.id, req.params.brokerId);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.post("/:brokerId/orders", authRequired, async (req, res) => {
  try {
    const result = await placeBrokerOrder(
      req.user.id,
      req.params.brokerId,
      req.body
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.post("/:brokerId/settle", authRequired, async (req, res) => {
  try {
    const result = await settleBroker(
      req.user.id,
      req.params.brokerId
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;