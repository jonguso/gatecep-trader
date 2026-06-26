import { v4 as uuid } from "uuid";
import { pool } from "../../database/db.js";
import { applySecurityMaster } from "../../data/nseSecurityMaster.js";

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

export async function listUserPortfolio(userId, options = {}) {
  const params = [userId];
  const broker = options?.broker;

  let where = "WHERE user_id = $1";

  if (broker && broker !== "ALL") {
    params.push(broker);
    where += ` AND broker = $${params.length}`;
  }

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
      ${where}
      ORDER BY created_at DESC
    `,
    params
  );

  return result.rows.map(enrichHolding);
}

export async function listUserPortfolioAccounts(userId) {
  const result = await pool.query(
    `
      SELECT
        broker,
        COUNT(*) AS holdings_count,
        SUM(market_value) AS total_value
      FROM user_portfolios
      WHERE user_id = $1
      GROUP BY broker
      ORDER BY
        CASE
          WHEN broker = 'GATECEP-DEMO' THEN 1
          WHEN broker = 'IMPORT_REVIEW' THEN 2
          ELSE 3
        END,
        broker
    `,
    [userId]
  );

  return result.rows.map((row) => ({
    broker: row.broker,
    label:
      row.broker === "GATECEP-DEMO"
        ? "Gatecep Demo"
        : row.broker === "IMPORT_REVIEW"
        ? "Imported Portfolio"
        : row.broker,
    type:
      row.broker === "GATECEP-DEMO"
        ? "DEMO"
        : row.broker === "IMPORT_REVIEW"
        ? "IMPORTED"
        : "BROKER",
    holdingsCount: Number(row.holdings_count || 0),
    totalValue: Number(row.total_value || 0)
  }));
}

export async function addUserHolding(userId, holding = {}) {
  const id = uuid();

  const mastered = applySecurityMaster({
    symbol: String(holding.symbol || "").toUpperCase().trim(),
    name: holding.name,
    sector: holding.sector
  });

   if (!mastered.symbol || Number(holding.quantity || 0) <= 0) {
  throw new Error("Invalid holding: symbol and quantity are required");
}

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
      ON CONFLICT (user_id, broker, symbol)
      DO UPDATE SET
        name = EXCLUDED.name,
        sector = EXCLUDED.sector,
        quantity = EXCLUDED.quantity,
        average_price = EXCLUDED.average_price,
        market_price = EXCLUDED.market_price,
        market_value = EXCLUDED.market_value,
        profit_loss = EXCLUDED.profit_loss,
        source = EXCLUDED.source,
        updated_at = NOW()
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
      holding.broker || "GATECEP-DEMO",
      mastered.symbol,
      mastered.name,
      mastered.sector,
      Number(holding.quantity || 0),
      Number(holding.averagePrice || holding.averageCost || 0),
      Number(holding.marketPrice || holding.price || 0),
      Number(holding.marketValue || holding.value || 0),
      Number(holding.profitLoss || 0),
      holding.source || "DEMO_TRADE"
    ]
  );

  return enrichHolding(result.rows[0]);
}