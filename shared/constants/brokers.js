export const BROKERS = [
  {
    code: "AIB",
    normalizedCode: "AIB-AXYS",
    name: "AIB-AXYS",
    bestFor: "Beginners and long-term investors",
    signupUrl: "https://www.aib-axysafrica.com/",
    strengths: [
      "Beginner friendly",
      "Research support",
      "Good for portfolio building"
    ]
  },
  {
    code: "ABC",
    normalizedCode: "ABC",
    name: "ABC Capital",
    bestFor: "Active investors",
    signupUrl: "https://abc-capital.com/",
    strengths: [
      "Trading tools",
      "Execution speed",
      "Market access"
    ]
  },
  {
    code: "DYER_BLAIR",
    normalizedCode: "DYER_BLAIR",
    name: "Dyer & Blair",
    bestFor: "Research-focused investors",
    signupUrl: "https://dyerandblair.com/",
    strengths: [
      "Research depth",
      "Institutional experience",
      "Advisory support"
    ]
  }
];

export function getBrokerByCode(code) {
  const value = String(code || "").toUpperCase().trim();

  return (
    BROKERS.find(
      (broker) =>
        broker.code === value ||
        broker.normalizedCode === value ||
        broker.name.toUpperCase() === value
    ) || null
  );
}