import { DNA_RISK_PROFILES } from "./schema.js";

export function calculateRiskScore(input = {}) {
  let score = 0;

  if (input.marketDrop === "BUY_MORE") score += 35;
  else if (input.marketDrop === "WAIT") score += 20;
  else if (input.marketDrop === "UNSURE") score += 12;
  else if (input.marketDrop === "SELL") score += 5;

  if (input.timeHorizon === "10_PLUS_YEARS") score += 30;
  else if (input.timeHorizon === "5_PLUS_YEARS") score += 25;
  else if (input.timeHorizon === "3_5_YEARS") score += 18;
  else if (input.timeHorizon === "1_3_YEARS") score += 10;
  else score += 4;

  if (input.experience === "ADVANCED") score += 20;
  else if (input.experience === "INTERMEDIATE") score += 14;
  else if (input.experience === "BEGINNER") score += 8;
  else score += 3;

  if (input.contribution === "MONTHLY") score += 10;
  else if (input.contribution === "QUARTERLY") score += 7;
  else if (input.contribution === "FLEXIBLE") score += 5;

  return Math.min(score, 100);
}

export function mapRiskProfile(score = 0) {
  if (score <= 30) return DNA_RISK_PROFILES.CONSERVATIVE;
  if (score <= 65) return DNA_RISK_PROFILES.BALANCED;
  if (score <= 85) return DNA_RISK_PROFILES.GROWTH;
  return DNA_RISK_PROFILES.AGGRESSIVE;
}