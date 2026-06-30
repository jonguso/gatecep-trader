/**
 * ============================================================================
 * STATUS: ACTIVE
 * MODULE: Portfolio Service
 * DOMAIN: Portfolio
 * DOMAIN ID: PORT-001
 * ENGINE ID: ENG-PORT-001
 *
 * PURPOSE:
 * Backend portfolio service using the shared portfolio engine.
 *
 * USED BY:
 * - /user-portfolio
 * - /user-positions
 * - Market Intelligence
 * - Dashboard
 * - Portfolio Hub
 *
 * LAST VERIFIED:
 * 2026-06-29
 *
 * VERSION:
 * GateCEP 3.1 Platform Consolidation
 * ============================================================================
 */

import {
  listUserPortfolio,
  listUserPortfolioAccounts,
  addUserHolding,
  updateUserPositionSettlement
} from "./portfolio.repository.js";

import {
  calculatePortfolioSummary
} from "../../../../shared/portfolio/engine.js";

export async function getUserPortfolio(userId, options = {}) {
  const holdings = await listUserPortfolio(userId, options);

  const portfolio = calculatePortfolioSummary({
    holdings,
    cash: Number(options.cash || 0),
    priceMap: options.priceMap || {}
  });

  return {
    holdings: portfolio.holdings,
    summary: {
      totalHoldings: portfolio.summary.holdingsCount,
      holdingsCount: portfolio.summary.holdingsCount,
      totalValue: portfolio.summary.totalValue,
      investedValue: portfolio.summary.investedValue,
      totalCash: portfolio.summary.totalCash,
      netWorth: portfolio.summary.netWorth,
      totalProfitLoss: portfolio.summary.totalGain,
      totalGain: portfolio.summary.totalGain,
      totalGainPct: portfolio.summary.totalGainPct
    }
  };
}

export async function getUserPortfolioAccounts(userId) {
  const accounts = await listUserPortfolioAccounts(userId);

  return {
    ok: true,
    accounts: [
      {
        broker: "ALL",
        label: "All Accounts",
        type: "ALL"
      },
      ...accounts
    ],
    version: "PortfolioAccounts-014A3"
  };
}

export async function createHolding(userId, payload) {
  return await addUserHolding(userId, payload);
}

export async function getUserPositions(userId, options = {}) {
  return await getUserPortfolio(userId, options);
}

export async function upsertUserPosition(userId, payload) {
  return await createHolding(userId, payload);
}

export async function settleUserPosition(userId, payload = {}) {
  return await updateUserPositionSettlement(userId, payload);
}