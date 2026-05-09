import express from "express";

import {
  login
} from "../services/auth/auth.service.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const result = await login(
      req.body.username,
      req.body.password
    );

    res.json({
      ok: true,
      ...result
    });
  } catch (error) {
    res.status(401).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;