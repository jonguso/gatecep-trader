import { v4 as uuid } from "uuid";
import { pool } from "../../database/db.js";

export async function createTransaction(userId, payload = {}) {
  const id = uuid();

  const result = await pool.query(
    `
    INSERT INTO user_transactions (
      id,
      user_id,
      broker,
      transaction_type,
      symbol,
      quantity,
      price,
      gross_amount,
      fees,
      tax,
      net_amount,
      currency,
      status,
      reference,
      description,
      trade_date,
      settlement_date,
      metadata,
      created_at,
      updated_at
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
      COALESCE($16::timestamp, NOW()),
      $17::timestamp,
      $18::jsonb,
      NOW(),
      NOW()
    )
    RETURNING
      id,
      user_id AS "userId",
      broker,
      transaction_type AS "transactionType",
      symbol,
      quantity,
      price,
      gross_amount AS "grossAmount",
      fees,
      tax,
      net_amount AS "netAmount",
      currency,
      status,
      reference,
      description,
      trade_date AS "tradeDate",
      settlement_date AS "settlementDate",
      metadata,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    `,
    [
      id,
      userId,
      payload.broker || "GATECEP-DEMO",
      payload.transactionType || payload.type || "UNKNOWN",
      payload.symbol ? String(payload.symbol).toUpperCase().trim() : null,
      Number(payload.quantity || 0),
      Number(payload.price || 0),
      Number(payload.grossAmount || payload.gross_amount || 0),
      Number(payload.fees || 0),
      Number(payload.tax || 0),
      Number(payload.netAmount || payload.net_amount || 0),
      payload.currency || "KES",
      payload.status || "POSTED",
      payload.reference || null,
      payload.description || null,
      payload.tradeDate || null,
      payload.settlementDate || null,
      JSON.stringify(payload.metadata || {})
    ]
  );

  return result.rows[0];
}

export async function listTransactions(userId, options = {}) {
  const params = [userId];
  let where = "WHERE user_id = $1";

  if (options.broker && options.broker !== "ALL") {
    params.push(options.broker);
    where += ` AND broker = $${params.length}`;
  }

  if (options.type) {
    params.push(options.type);
    where += ` AND transaction_type = $${params.length}`;
  }

  const limit = Number(options.limit || 100);

  const result = await pool.query(
    `
    SELECT
      id,
      user_id AS "userId",
      broker,
      transaction_type AS "transactionType",
      symbol,
      quantity,
      price,
      gross_amount AS "grossAmount",
      fees,
      tax,
      net_amount AS "netAmount",
      currency,
      status,
      reference,
      description,
      trade_date AS "tradeDate",
      settlement_date AS "settlementDate",
      metadata,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM user_transactions
    ${where}
    ORDER BY created_at DESC
    LIMIT ${limit}
    `,
    params
  );

  return result.rows;
}