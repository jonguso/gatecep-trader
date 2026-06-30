import { DNA_VERSION } from "./schema.js";
import { calculateRiskScore, mapRiskProfile } from "./scoring.js";
import { calculateDNAConfidence } from "./confidence.js";
import { generateWealthBlueprint } from "./blueprint.js";

export function createInvestorDNA(input = {}) {
  const riskScore = calculateRiskScore(input);
  const riskProfile = mapRiskProfile(riskScore);
  const confidenceScore = calculateDNAConfidence(input);

  const investorType =
    input.goal === "DIVIDEND_INCOME"
      ? "Income Builder"
      : input.goal === "RETIREMENT"
      ? "Long-Term Builder"
      : input.goal === "HOME_PURCHASE"
      ? "Goal Saver"
      : riskProfile === "AGGRESSIVE" || riskProfile === "GROWTH"
      ? "Growth Seeker"
      : "Balanced Builder";

  const dna = {
    version: DNA_VERSION,
    goal: input.goal || "WEALTH_GROWTH",
    timeHorizon: input.timeHorizon || "3_5_YEARS",
    marketDrop: input.marketDrop || "WAIT",
    contribution: input.contribution || "MONTHLY",
    experience: input.experience || "BEGINNER",
    amount: Number(input.amount || 100000),
    riskScore,
    riskProfile,
    confidenceScore,
    investorType,
    recommendedStrategy: `${riskProfile} ${investorType}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return {
    dna,
    wealthBlueprint: generateWealthBlueprint(dna)
  };
}