import { SECURITIES } from "../data/securities.js";
import { marketDataGateway } from "../services/marketData/MarketDataGateway.js";

export function getSecurities(req, res) { res.json(SECURITIES); }

export async function getPrices(req, res) {
  try { res.json(await marketDataGateway.getPrices()); }
  catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getSummary(req, res) {
  try { res.json(await marketDataGateway.getMarketSummary()); }
  catch (err) { res.status(500).json({ error: err.message }); }
}

export async function getCandles(req, res) {
  try { res.json(await marketDataGateway.getCandles(req.params.symbol, req.query.interval || "1m")); }
  catch (err) { res.status(500).json({ error: err.message }); }
}
