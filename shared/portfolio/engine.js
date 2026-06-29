/**
 * ============================================================================
 * STATUS: ACTIVE
 * MODULE: Shared Portfolio Engine Facade
 * DOMAIN: Portfolio
 * DOMAIN ID: PORT-001
 * ENGINE ID: ENG-PORT-001
 *
 * PURPOSE:
 * Public Portfolio Engine API for GateCEP.
 * Backend, web, mobile, Dashboard, Coach G, Goal Tracker, and reports should
 * import from this file instead of importing calculation internals directly.
 *
 * RULE:
 * Applications must consume this facade, not internal calculator files.
 *
 * LAST VERIFIED:
 * 2026-06-29
 *
 * VERSION:
 * GateCEP 3.1 Platform Consolidation
 * ============================================================================
 */

export {
  calculateHoldingValue,
  calculateHoldings,
  calculatePortfolioSummary,
  calculateAllocationBySector,
  calculateLargestHolding,
  calculateGoalProgress
} from "./calculations.js";