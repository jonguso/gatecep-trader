import { useEffect, useState } from "react";

const messages = [
  {
    text: "Coach G detects improving liquidity.",
    color: "text-green-400",
    border: "border-green-500/40",
    bg: "bg-green-500/10"
  },
  {
    text: "Spread remains tight. Execution risk is low.",
    color: "text-cyan-400",
    border: "border-cyan-500/40",
    bg: "bg-cyan-500/10"
  },
  {
    text: "Portfolio exposure should be checked before adding more.",
    color: "text-yellow-400",
    border: "border-yellow-500/40",
    bg: "bg-yellow-500/10"
  },
  {
    text: "Coach G recommends using smaller order sizes in volatile markets.",
    color: "text-purple-400",
    border: "border-purple-500/40",
    bg: "bg-purple-500/10"
  }
];

export default function LiveAISentimentBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((current) =>
        current + 1 >= messages.length ? 0 : current + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const item = messages[index];

  return (
    <div
      className={`mt-4 rounded-2xl border ${item.border} ${item.bg} p-4 transition-all`}
    >
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />

        <div>
          <div className="text-xs text-slate-400">
            Live AI Market Read
          </div>

          <div className={`font-bold ${item.color}`}>
            {item.text}
          </div>
        </div>
      </div>
    </div>
  );
}