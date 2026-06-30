export function calculateDNAConfidence(input = {}) {
  const fields = [
    "goal",
    "timeHorizon",
    "marketDrop",
    "contribution",
    "experience"
  ];

  const answered = fields.filter((field) => Boolean(input[field])).length;
  return Math.round((answered / fields.length) * 100);
}