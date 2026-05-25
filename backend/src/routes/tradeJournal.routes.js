import express from "express";

import {
  createJournalEntry,
  getTradeJournal
} from "../services/journal/tradeJournal.service.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    return res.json({
      ok: true,
      count: getTradeJournal().length,
      journal: getTradeJournal()
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.post("/", (req, res) => {
  try {
    const entry = createJournalEntry(req.body);

    return res.json({
      ok: true,
      entry
    });
  } catch (error) {
    return res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;