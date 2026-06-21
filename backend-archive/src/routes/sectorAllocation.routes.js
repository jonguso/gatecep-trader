import express from "express";

import {
  getSectorAllocation
} from "../services/portfolio/sectorAllocation.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const allocation = await getSectorAllocation();

    res.json({
      ok: true,
      allocation
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;