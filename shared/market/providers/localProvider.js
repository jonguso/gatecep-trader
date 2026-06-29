/**
 * ============================================================================
 * STATUS: DEV
 * MODULE: Local Market Provider
 * MODULE ID: MKT-001
 * ENGINE ID: ENG-MKT-001
 * PURPOSE: Provides local fallback market rows.
 * LAST VERIFIED: 2026-06-29
 * ============================================================================
 */

import { MARKET_PROVIDERS } from "../marketTypes.js";

export function createLocalMarketProvider(rows = []) {
  return {
    name: MARKET_PROVIDERS.LOCAL_EOD,
    async getQuotes() {
      return {
        ok: true,
        provider: MARKET_PROVIDERS.LOCAL_EOD,
        generatedAt: new Date().toISOString(),
        rows
      };
    }
  };
}