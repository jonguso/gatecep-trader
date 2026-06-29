import express from "express";
import { authRequired } from "../../middleware/authRequired.js";
import { pool } from "../../database/db.js";

const router = express.Router();

function normalizeInvestorProfile(body = {}) {
  const constraints = body.constraints || {};

  return {
    goal: body.goal || constraints.goal || null,
    risk: body.risk || body.riskTolerance || constraints.risk || null,
    experience: body.experience || constraints.experience || null,
    timeHorizon:
      body.timeHorizon || body.time_horizon || constraints.timeHorizon || null,
    contribution: body.contribution || constraints.contribution || null,
    investorType:
      body.investorType ||
      body.investor_type ||
      constraints.investorType ||
      null,
    constraints: {
      ...constraints,
      name: body.name || constraints.name || null,
      marketDrop: body.marketDrop || constraints.marketDrop || null,
      amount: Number(body.amount || constraints.amount || 0),
      monthlyContribution: Number(
        body.monthlyContribution || constraints.monthlyContribution || 0
      ),
      goalTarget: Number(body.goalTarget || constraints.goalTarget || 0),
      riskScore: Number(body.riskScore || constraints.riskScore || 0),
      confidence: Number(body.confidence || constraints.confidence || 0),
      brokerRecommendation:
        body.brokerRecommendation || constraints.brokerRecommendation || null,
      savedAt: new Date().toISOString()
    }
  };
}

router.get("/", authRequired, async (req, res) => {
  const result = await pool.query(
    `
    SELECT
      user_id AS "userId",
      goal,
      risk,
      experience,
      time_horizon AS "timeHorizon",
      contribution,
      investor_type AS "investorType",
      constraints,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM investor_profiles
    WHERE user_id = $1
    LIMIT 1
    `,
    [req.user.id]
  );

  res.json({ ok: true, profile: result.rows[0] || null });
});

router.post("/", authRequired, async (req, res) => {
  const profile = normalizeInvestorProfile(req.body || {});

  const result = await pool.query(
    `
    INSERT INTO investor_profiles (
      user_id,
      goal,
      risk,
      experience,
      time_horizon,
      contribution,
      investor_type,
      constraints,
      created_at,
      updated_at
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
    RETURNING
      user_id AS "userId",
      goal,
      risk,
      experience,
      time_horizon AS "timeHorizon",
      contribution,
      investor_type AS "investorType",
      constraints,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    `,
    [
      req.user.id,
      profile.goal,
      profile.risk,
      profile.experience,
      profile.timeHorizon,
      profile.contribution,
      profile.investorType,
      profile.constraints
    ]
  );

  res.json({ ok: true, profile: result.rows[0] });
});

export default router;