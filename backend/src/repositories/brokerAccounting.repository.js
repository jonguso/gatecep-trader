import { pool } from "../config/db.js";

export async function saveBrokerAccount(account) {
  await pool.query(
    `
    INSERT INTO broker_accounts (
      broker, account_number, cash_balance, portfolio_value,
      buying_power, connected, preferred, updated_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
    ON CONFLICT (broker) DO UPDATE SET
      account_number = EXCLUDED.account_number,
      cash_balance = EXCLUDED.cash_balance,
      portfolio_value = EXCLUDED.portfolio_value,
      buying_power = EXCLUDED.buying_power,
      connected = EXCLUDED.connected,
      preferred = EXCLUDED.preferred,
      updated_at = NOW()
    `,
    [
      account.broker,
      account.accountNumber,
      account.cashBalance,
      account.portfolioValue,
      account.buyingPower,
      account.connected,
      account.preferred
    ]
  );
}

export async function loadBrokerAccounts() {
  const result = await pool.query(
    `SELECT * FROM broker_accounts ORDER BY broker ASC`
  );

  return result.rows.map((row) => ({
    broker: row.broker,
    accountNumber: row.account_number,
    cashBalance: Number(row.cash_balance),
    portfolioValue: Number(row.portfolio_value),
    buyingPower: Number(row.buying_power),
    connected: row.connected,
    preferred: row.preferred
  }));
}

export async function savePnlRecord(record) {
  await pool.query(
    `
    INSERT INTO pnl_ledger (
      id, symbol, quantity, average_cost, sell_price,
      broker, realized_pnl, realized_at
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    ON CONFLICT (id) DO NOTHING
    `,
    [
      record.id,
      record.symbol,
      record.quantity,
      record.averageCost,
      record.sellPrice,
      record.broker,
      record.realizedPnL,
      record.realizedAt
    ]
  );
}

export async function loadPnlLedger() {
  const result = await pool.query(
    `SELECT * FROM pnl_ledger ORDER BY realized_at DESC`
  );

  return result.rows.map((row) => ({
    id: row.id,
    symbol: row.symbol,
    quantity: Number(row.quantity),
    averageCost: Number(row.average_cost),
    sellPrice: Number(row.sell_price),
    broker: row.broker,
    realizedPnL: Number(row.realized_pnl),
    realizedAt: row.realized_at
  }));
}