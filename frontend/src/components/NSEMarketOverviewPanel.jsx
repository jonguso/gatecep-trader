import { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function NSEMarketOverviewPanel() {
  const [rows, setRows] = useState([]);

  async function loadPrices() {
    const res = await fetch(`${API_URL}/prices`);
    const data = await res.json();
    setRows(data.data || []);
  }

  useEffect(() => {
    loadPrices();

    const interval = setInterval(loadPrices, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <h2 className="text-2xl font-bold mb-1">
        NSE Market Overview
      </h2>

      <p className="text-slate-400 text-sm mb-5">
        All available securities with live simulated prices
      </p>

      <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-400 border-b border-slate-700 sticky top-0 bg-slate-900">
            <tr>
              <th className="text-left py-2">Symbol</th>
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Sector</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">Change</th>
              <th className="text-right py-2">Change %</th>
              <th className="text-right py-2">Volume</th>
              <th className="text-right py-2">Turnover</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((item) => {
              const change = Number(item.change || 0);
              const changePct = Number(item.changePct || 0);

              return (
                <tr
                  key={item.symbol}
                  className="border-b border-slate-800 hover:bg-slate-800/60"
                >
                  <td className="py-3 font-bold">
                    {item.symbol}
                  </td>

                  <td className="py-3 text-slate-300">
                    {item.name || "-"}
                  </td>

                  <td className="py-3 text-slate-400">
                    {item.sector || "-"}
                  </td>

                  <td className="py-3 text-right font-bold">
                    KES {Number(item.price || item.lastPrice || 0).toFixed(2)}
                  </td>

                  <td
                    className={`py-3 text-right ${
                      change >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {change >= 0 ? "+" : ""}
                    {change.toFixed(2)}
                  </td>

                  <td
                    className={`py-3 text-right ${
                      changePct >= 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {changePct.toFixed(2)}%
                  </td>

                  <td className="py-3 text-right">
                    {Number(item.volume || 0).toLocaleString()}
                  </td>

                  <td className="py-3 text-right">
                    KES {Number(item.turnover || 0).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}