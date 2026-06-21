import express from "express";
import jwt from "jsonwebtoken";

import {
  authenticateUser,
  registerUser
} from "../services/auth/auth.service.js";

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || "gatecep-secret";

router.post("/login", async (req, res) => {
  try {
    const user = await authenticateUser({
      username: req.body.username,
      password: req.body.password
    });

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      {
        expiresIn: "12h"
      }
    );

    res.json({
      ok: true,
      token,
      user
    });
  } catch (error) {
    res.status(401).json({
      ok: false,
      error: error.message
    });
  }
});

router.post("/register", async (req, res) => {
  try {
    const user = await registerUser({
      username: req.body.username,
      password: req.body.password,
      role: req.body.role || "TRADER"
    });

    res.json({
      ok: true,
      user
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

export default router;