/**
 * ============================================================================
 * STATUS: DEV
 * MODULE: Market Provider Resolver
 * MODULE ID: MKT-001
 * ENGINE ID: ENG-MKT-001
 * PURPOSE: Resolves active market provider.
 * LAST VERIFIED: 2026-06-29
 * ============================================================================
 */

import { MARKET_PROVIDERS } from "./marketTypes.js";
import { createLocalMarketProvider } from "./providers/localProvider.js";
import { createDemoMarketProvider } from "./providers/demoProvider.js";

export function createMarketProvider({ provider, rows = [] } = {}) {
  if (provider === MARKET_PROVIDERS.DEMO) {
    return createDemoMarketProvider(rows);
  }

  return createLocalMarketProvider(rows);
}