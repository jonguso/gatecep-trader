import { v4 as uuid } from "uuid";
import { pool } from "../../database/db.js";

export async function getUserCashBalances(userId) {
  const result = await pool.query(
    `
    SELECT
      id,
      user_id AS "userId",
      broker,
      currency,
      cash_balance AS "cashBalance",
      source,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM user_cash_balances
    WHERE user_id = $1
    ORDER BY broker
    `,
    [userId]
  );

  return result.rows;
}

export async function upsertUserCashBalance(userId, payload = {}) {
  const result = await pool.query(
    `
    INSERT INTO user_cash_balances (
      id,
      user_id,
      broker,
      currency,
      cash_balance,
      source,
      created_at,
      updated_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())
    ON CONFLICT (user_id, broker, currency)
    DO UPDATE SET
      cash_balance = EXCLUDED.cash_balance,
      source = EXCLUDED.source,
      updated_at = NOW()
    RETURNING
      id,
      user_id AS "userId",
      broker,
      currency,
      cash_balance AS "cashBalance",
      source,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    `,
    [
      uuid(),
      userId,
      payload.broker || "GATECEP-DEMO",
      payload.currency || "KES",
      Number(payload.cashBalance || payload.amount || payload.availableCash || 0),
      payload.source || "MANUAL"
    ]
  );

  return result.rows[0];
}