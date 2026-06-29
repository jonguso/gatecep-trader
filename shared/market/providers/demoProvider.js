/**
 * ============================================================================
 * STATUS: DEV
 * MODULE: Demo Market Provider
 * MODULE ID: MKT-001
 * ENGINE ID: ENG-MKT-001
 * PURPOSE: Demo provider for generated quote testing.
 * LAST VERIFIED: 2026-06-29
 * ============================================================================
 */

import { MARKET_PROVIDERS } from "../marketTypes.js";

export function createDemoMarketProvider(rows = []) {
  return {
    name: MARKET_PROVIDERS.DEMO,
    async getQuotes() {
      return {
        ok: true,
        provider: MARKET_PROVIDERS.DEMO,
        generatedAt: new Date().toISOString(),
        rows: rows.map((row, index) => ({
          ...row,
          price: Number(row.price || row.lastPrice || 0),
          changePct: Number(row.changePct || 0),
          demoRank: index + 1
        }))
      };
    }
  };
}