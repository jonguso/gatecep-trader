import { getCoachGPortfolioAdvice } from "./coachG.service.js";

let latestAlerts = [];

export async function generateCoachGAlerts() {
  const advice =
    await getCoachGPortfolioAdvice();

  latestAlerts = advice.advice.map((message, index) => ({
    id: `ALERT-${index + 1}`,
    severity:
      message.includes("loss")
        ? "HIGH"
        : message.includes("concentration")
        ? "MEDIUM"
        : "LOW",
    message,
    createdAt: new Date().toISOString()
  }));

  return latestAlerts;
}

export function getLatestCoachGAlerts() {
  return latestAlerts;
}