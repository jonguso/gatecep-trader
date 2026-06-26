import express from "express";
import { authRequired } from "../../middleware/authRequired.js";
import {
  getNotifications,
  readNotification,
  readAllNotifications,
  removeNotification
} from "./notifications.service.js";

const router = express.Router();

router.get("/", authRequired, async (req, res) => {
  try {
    const result = await getNotifications(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.patch("/read-all", authRequired, async (req, res) => {
  try {
    const result = await readAllNotifications(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

router.patch("/:notificationId/read", authRequired, async (req, res) => {
  try {
    const result = await readNotification(
      req.user.id,
      req.params.notificationId
    );
    res.json(result);
  } catch (error) {
    res.status(404).json({
      ok: false,
      error: error.message
    });
  }
});

router.delete("/:notificationId", authRequired, async (req, res) => {
  try {
    const result = await removeNotification(
      req.user.id,
      req.params.notificationId
    );
    res.json(result);
  } catch (error) {
    res.status(404).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;