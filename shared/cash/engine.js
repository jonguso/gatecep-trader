/**
 * ============================================================================
 * STATUS: ACTIVE
 * MODULE: Shared Cash Engine Facade
 * DOMAIN: Cash
 * DOMAIN ID: CASH-001
 * ENGINE ID: ENG-CASH-001
 * PURPOSE: Public Cash Engine API for GateCEP.
 * LAST VERIFIED: 2026-06-29
 * VERSION: GateCEP 3.1 Platform Consolidation
 * ============================================================================
 */

export {
  calculateReservedCash,
  calculateAvailableCash,
  calculateBuyingPower,
  calculateCashSummary
} from "./calculations.js";

export {
  CASH_SOURCES,
  CASH_CURRENCY
} from "./cashTypes.js";