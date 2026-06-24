import express from "express";
import { authRequired } from "../../middleware/authRequired.js";

import {
  getBrokerLinks,
  addBrokerLink
} from "./brokerLinks.service.js";

const router = express.Router();

router.get("/", authRequired, async (req, res) => {
  try {
    const brokers = await getBrokerLinks(req.user.id);

    res.json({
      ok: true,
      brokers
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.post("/", authRequired, async (req, res) => {
  try {
    const broker = await addBrokerLink(req.user.id, req.body);

    res.json({
      ok: true,
      broker
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;