import express from "express";
import { authRequired } from "../../middleware/authRequired.js";
import { pool } from "../../database/db.js";

const router = express.Router();

router.get("/", authRequired, async (req, res) => {
  const result = await pool.query(
    `
    SELECT *
    FROM user_profiles
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
    INSERT INTO user_profiles (
      user_id, phone, country, preferred_broker, theme,
      created_at, updated_at
    )
    VALUES ($1,$2,$3,$4,$5,NOW(),NOW())
    ON CONFLICT (user_id)
    DO UPDATE SET
      phone = EXCLUDED.phone,
      country = EXCLUDED.country,
      preferred_broker = EXCLUDED.preferred_broker,
      theme = EXCLUDED.theme,
      updated_at = NOW()
    RETURNING *
    `,
    [
      req.user.id,
      body.phone || null,
      body.country || "Kenya",
      body.preferredBroker || body.preferred_broker || null,
      body.theme || "dark"
    ]
  );

  res.json({ ok: true, profile: result.rows[0] });
});

export default router;