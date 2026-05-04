import { generateRecommendation } from "../ai/recommendations.js";
import { getUser } from "../store/state.js";

export function getRecommendation(req, res) {
  const user = getUser(req.params.userId || "u1");
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(generateRecommendation({ symbol: req.params.symbol, user }));
}

export function handleChat(req, res) {
  const user = getUser(req.body.userId || "u1");
  if (!user) return res.status(404).json({ error: "User not found" });
  const rec = generateRecommendation({ symbol: String(req.body.symbol || "SCOM").toUpperCase(), user, brokerId: req.body.brokerId });
  res.json({ coach: "Coach G", answer: `${rec.symbol}: ${rec.action} with ${rec.confidence}% confidence. ${rec.message}`, recommendation: rec });
}
