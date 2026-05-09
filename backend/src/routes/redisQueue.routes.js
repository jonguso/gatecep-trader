import express from "express";

import {
  getExecutionJobs,
  getExecutionEvents
} from "../services/queue/redisExecutionQueue.service.js";

const router = express.Router();

router.get("/jobs", async (req, res) => {
  const jobs = await getExecutionJobs();

  res.json({
    ok: true,
    jobs
  });
});

router.get("/events", async (req, res) => {
  const events = await getExecutionEvents();

  res.json({
    ok: true,
    events
  });
});

export default router;