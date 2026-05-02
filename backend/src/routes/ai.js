import { generateRecommendation } from "../ai/recommendations.js";
export function getRecommendation(req, res) { res.json(generateRecommendation(req.params.symbol, req.params.userId)); }
export function handleChat(req, res) {
  const symbol = String(req.body.symbol || "SCOM").toUpperCase();
  const rec = generateRecommendation(symbol, req.body.userId || "u1");
  res.json({ coach: "Coach G", answer: `${symbol} signal is ${rec.action} with ${rec.confidence}% confidence. ${rec.message}`, recommendation: rec });
}
