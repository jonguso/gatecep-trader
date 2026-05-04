import { SECURITIES } from "../data/securities.js";
import { getAllPrices, getMarketSummary, refreshPrices } from "../services/marketData.js";

export function getSecurities(req, res) { res.json(SECURITIES); }
export async function getPrices(req, res) { await refreshPrices(); res.json({ data: getAllPrices() }); }
export function getSummary(req, res) { res.json(getMarketSummary()); }
