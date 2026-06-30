export function validateDNAInput(payload = {}) {
  const required = ["goal", "timeHorizon", "marketDrop", "contribution", "experience"];

  for (const field of required) {
    if (!payload[field]) {
      throw new Error(`${field} is required`);
    }
  }

  return {
    goal: payload.goal,
    timeHorizon: payload.timeHorizon,
    marketDrop: payload.marketDrop,
    contribution: payload.contribution,
    experience: payload.experience,
    amount: Number(payload.amount || 100000)
  };
}