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
  const broker = payload.broker || "AIB-AXYS";
  const currency = payload.currency || "KES";
  const cashBalance = Number(payload.cashBalance || payload.cash || 0);
  const source = payload.source || "MANUAL";

  console.log("payload", payload);
  console.log("cashBalance", cashBalance);

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
    ON CONFLICT (user_id, broker)
    DO UPDATE SET
      currency = EXCLUDED.currency,
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
    [uuid(), userId, broker, currency, cashBalance, source]
  );

  return result.rows[0];
}