import { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function MarketMoversPanel() {
  const [gainers, setGainers] = useState([]);
  const [losers, setLosers] = useState([]);
  const [active, setActive] = useState([]);

  async function loadData() {
    try {
      const res = await fetch(`${API_URL}/prices`);
      const data = await res.json();

      const rows = data.data || [];

      const sortedGainers = [...rows]
        .sort(
          (a, b) =>
            Number(b.changePct || 0) -
            Number(a.changePct || 0)
        )
        .slice(0, 5);

      const sortedLosers = [...rows]
        .sort(
          (a, b) =>
            Number(a.changePct || 0) -
            Number(b.changePct || 0)
        )
        .slice(0, 5);

      const mostActive = [...rows]
        .sort(
          (a, b) =>
            Number(b.volume || 0) -
            Number(a.volume || 0)
        )
        .slice(0, 5);

      setGainers(sortedGainers);
      setLosers(sortedLosers);
      setActive(mostActive);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 10000);

    return () => clearInterval(interval);
  }, []);

  function Panel({ title, rows, color }) {
    return (
      <div className="bg-slate-900 rounded-2xl p-5 shadow-xl">
        <h2 className={`text-xl font-bold mb-4 ${color}`}>
          {title}
        </h2>

        <div className="space-y-3">
          {rows.map((item) => (
            <div
              key={item.symbol}
              className="flex items-center justify-between border-b border-slate-800 pb-2"
            >
              <div>
                <div className="font-bold text-white">
                  {item.symbol}
                </div>

                <div className="text-xs text-slate-400">
                  {item.name}
                </div>
              </div>

              <div className="text-right">
                <div className="text-white">
                  KES {Number(item.price).toFixed(2)}
                </div>

                <div
                  className={
                    Number(item.changePct) >= 0
                      ? "text-green-400 text-sm"
                      : "text-red-400 text-sm"
                  }
                >
                  {Number(item.changePct).toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
      <Panel
        title="Top Gainers"
        rows={gainers}
        color="text-green-400"
      />

      <Panel
        title="Top Losers"
        rows={losers}
        color="text-red-400"
      />

      <Panel
        title="Most Active"
        rows={active}
        color="text-cyan-400"
      />
    </div>
  );
}