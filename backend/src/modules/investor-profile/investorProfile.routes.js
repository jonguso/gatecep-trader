import express from "express";
import { authRequired } from "../../middleware/authRequired.js";
import { pool } from "../../database/db.js";

const router = express.Router();

router.get("/", authRequired, async (req, res) => {
  const result = await pool.query(
    `
    SELECT *
    FROM investor_profiles
    WHERE user_id = $1
    LIMIT 1
    `,
    [req.user.id]
  );

  res.json({ ok: true, profile: result.rows[0] || null });
});

router.post("/", authRequired, async (req, res) => {
  const body = req.body || {};

  const result = await pool.query(
    `
    INSERT INTO investor_profiles (
      user_id, goal, risk, experience, time_horizon,
      contribution, investor_type, constraints,
      created_at, updated_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
      goal = EXCLUDED.goal,
      risk = EXCLUDED.risk,
      experience = EXCLUDED.experience,
      time_horizon = EXCLUDED.time_horizon,
      contribution = EXCLUDED.contribution,
      investor_type = EXCLUDED.investor_type,
      constraints = EXCLUDED.constraints,
      updated_at = NOW()
    RETURNING *
    `,
    [
      req.user.id,
      body.goal || null,
      body.risk || null,
      body.experience || null,
      body.timeHorizon || body.time_horizon || null,
      body.contribution || null,
      body.investorType || body.investor_type || null,
      body.constraints || {}
    ]
  );

  res.json({ ok: true, profile: result.rows[0] });
});

export default router;