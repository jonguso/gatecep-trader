import { pool } from "../config/db.js";

export async function savePosition(position) {
  await pool.query(
    `
    INSERT INTO positions (
      broker,
      symbol,
      quantity,
      average_cost,
      realized_pnl,
      updated_at
    )
    VALUES ($1,$2,$3,$4,$5,$6)
    ON CONFLICT (broker, symbol) DO UPDATE SET
      quantity = EXCLUDED.quantity,
      average_cost = EXCLUDED.average_cost,
      realized_pnl = EXCLUDED.realized_pnl,
      updated_at = EXCLUDED.updated_at
    `,
    [
      position.broker,
      position.symbol,
      position.quantity,
      position.averageCost,
      position.realizedPnL,
      position.updatedAt
    ]
  );
}

export async function loadPositions() {
  const result = await pool.query(
    `SELECT * FROM positions ORDER BY broker, symbol`
  );

  return result.rows.map((row) => ({
    broker: row.broker,
    symbol: row.symbol,
    quantity: Number(row.quantity),
    averageCost: Number(row.average_cost),
    realizedPnL: Number(row.realized_pnl),
    updatedAt: row.updated_at
  }));
}