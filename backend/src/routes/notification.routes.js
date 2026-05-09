import express from "express";

import {
  getNotifications
} from "../services/notifications/notification.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const notifications = await getNotifications();

    res.json({
      ok: true,
      notifications
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;