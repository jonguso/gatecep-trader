export function getMarketSentiment() {

  const moods = [
    {
      mood: "Bullish",
      change: +(Math.random() * 3 + 1).toFixed(2),
      color: "#86efac"
    },
    {
      mood: "Neutral",
      change: +(Math.random() * 2 - 1).toFixed(2),
      color: "#facc15"
    },
    {
      mood: "Bearish",
      change: -(Math.random() * 3 + 1).toFixed(2),
      color: "#fca5a5"
    }
  ];

  const random =
    moods[Math.floor(Math.random() * moods.length)];

  return {
    ...random,
    updatedAt: new Date().toISOString()
  };
}