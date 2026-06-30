/**
 * ============================================================================
 * STATUS: ACTIVE
 * MODULE: Cash Service
 * DOMAIN: Cash
 * DOMAIN ID: CASH-001
 * ENGINE ID: ENG-CASH-001
 * PURPOSE: Backend cash service using shared cash engine.
 * LAST VERIFIED: 2026-06-29
 * VERSION: GateCEP 3.1 Platform Consolidation
 * ============================================================================
 */

import {
  getUserCashBalances,
  upsertUserCashBalance
} from "./cash.repository.js";

import {
  calculateCashSummary
} from "../../../../shared/cash/engine.js";

export async function getCashSummary(userId) {
  const balances = await getUserCashBalances(userId);

  const summary = calculateCashSummary({
    balances,
    currency: "KES"
  });

  return {
    balances,
    summary: {
      totalCash: summary.cashBalance,
      availableCash: summary.availableCash,
      reservedCash: summary.reservedCash,
      buyingPower: summary.buyingPower,
      currency: summary.currency
    }
  };
}

export async function saveCashBalance(userId, payload) {
  return await upsertUserCashBalance(userId, payload);
}