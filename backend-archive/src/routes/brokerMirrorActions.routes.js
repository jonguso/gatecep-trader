import express from "express";

import {
  saveBrokerMirrorAction,
  getBrokerMirrorActions
} from "../repositories/brokerMirrorActions.repository.js";

const router = express.Router();

function normalizeBroker(value) {
  const broker = String(value || "AIB-AXYS").trim().toUpperCase();

  if (broker === "AIB") return "AIB-AXYS";
  if (broker === "ABC CAPITAL") return "ABC";

  return broker;
}

router.post("/", (req, res) => {
  const saved = saveBrokerMirrorAction(req.body);

  res.json({
    ok: true,
    action: saved
  });
});

router.get("/:broker", (req, res) => {
  const broker = normalizeBroker(req.params.broker);
  const clientNumber = String(req.query.clientNumber || "").trim();
  const cdsNumber = String(req.query.cdsNumber || "").trim();

  const actions = getBrokerMirrorActions(
    broker,
    clientNumber,
    cdsNumber
  );

  res.json({
    ok: true,
    broker,
    clientNumber,
    cdsNumber,
    count: actions.length,
    actions
  });
});

export default router;