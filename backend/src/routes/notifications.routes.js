import express from "express";

import {
  getNotifications,
  markNotificationRead
} from "../services/notifications/notificationEngine.service.js";

const router = express.Router();

/* ----------------------------- */
/* GET ALL NOTIFICATIONS         */
/* ----------------------------- */

router.get("/", async (req, res) => {
  try {
    const notifications =
      getNotifications();

    return res.json({
      ok: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

/* ----------------------------- */
/* MARK NOTIFICATION READ        */
/* ----------------------------- */

router.post("/:id/read", async (req, res) => {
  try {
    const updated =
      markNotificationRead(req.params.id);

    if (!updated) {
      return res.status(404).json({
        ok: false,
        error: "Notification not found"
      });
    }

    return res.json({
      ok: true,
      notification: updated
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;