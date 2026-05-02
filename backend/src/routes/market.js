import { SECURITIES } from "../data/securities.js";
import { getAllPrices, priceMeta, refreshPublicDelayedPrices, latestPrices } from "../services/publicMarketData.js";

export function getSecurities(req, res) { res.json(SECURITIES); }
export async function getPrices(req, res) { await refreshPublicDelayedPrices(); res.json({ meta: priceMeta, data: getAllPrices() }); }
export function getSinglePrice(req, res) {
  const symbol = String(req.params.symbol).toUpperCase();
  if (!latestPrices[symbol]) return res.status(404).json({ error: "Symbol not found" });
  res.json({ symbol, price: latestPrices[symbol], meta: priceMeta });
}
