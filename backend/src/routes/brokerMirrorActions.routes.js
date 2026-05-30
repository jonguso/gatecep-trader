import express from "express";

import {
  saveBrokerMirrorAction,
  getBrokerMirrorActions
} from "../repositories/brokerMirrorActions.repository.js";

const router = express.Router();

router.post("/", (req, res) => {
  const saved = saveBrokerMirrorAction(req.body);

  res.json({
    ok: true,
    action: saved
  });
});

router.get("/:broker", (req, res) => {
  const actions = getBrokerMirrorActions(req.params.broker);

  res.json({
    ok: true,
    broker: String(req.params.broker || "AIB").toUpperCase(),
    count: actions.length,
    actions
  });
});

export default router;