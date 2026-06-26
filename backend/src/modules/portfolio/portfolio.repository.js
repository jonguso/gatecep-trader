import { v4 as uuid } from "uuid";
import { pool } from "../../database/db.js";
import {
  applySecurityMaster
} from "../../data/nseSecurityMaster.js";

function enrichHolding(holding = {}) {
  const mastered = applySecurityMaster({
    symbol: holding.symbol,
    name: holding.name,
    sector: holding.sector
  });

  return {
    ...holding,
    symbol: mastered.symbol,
    name: mastered.name,
    sector: mastered.sector
  };
}

export async function listUserPortfolio(userId) {
  const result = await pool.query(
    `
    SELECT
      id,
      user_id AS "userId",
      broker,
      symbol,
      name,
      sector,
      quantity,
      average_price AS "averagePrice",
      market_price AS "marketPrice",
      market_value AS "marketValue",
      profit_loss AS "profitLoss",
      source,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM user_portfolios
    WHERE user_id = $1
    ORDER BY symbol
    `,
    [userId]
  );

  return result.rows.map(enrichHolding);
}

export async function addUserHolding(userId, holding = {}) {
  const id = uuid();

  const mastered = applySecurityMaster({
    symbol: String(holding.symbol || "").toUpperCase().trim(),
    name: holding.name,
    sector: holding.sector
  });

  const result = await pool.query(
    `
    INSERT INTO user_portfolios (
      id,
      user_id,
      broker,
      symbol,
      name,
      sector,
      quantity,
      average_price,
      market_price,
      market_value,
      profit_loss,
      source,
      created_at,
      updated_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW(),NOW())
    RETURNING
      id,
      user_id AS "userId",
      broker,
      symbol,
      name,
      sector,
      quantity,
      average_price AS "averagePrice",
      market_price AS "marketPrice",
      market_value AS "marketValue",
      profit_loss AS "profitLoss",
      source,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    `,
    [
      id,
      userId,
      holding.broker || "AIB-AXYS",
      mastered.symbol,
      mastered.name,
      mastered.sector,
      Number(holding.quantity || 0),
      Number(holding.averagePrice || holding.averageCost || 0),
      Number(holding.marketPrice || holding.price || 0),
      Number(holding.marketValue || holding.value || 0),
      Number(holding.profitLoss || 0),
      holding.source || "MANUAL"
    ]
  );

  return enrichHolding(result.rows[0]);
}