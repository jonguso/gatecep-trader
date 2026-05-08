import React, { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function PortfolioPerformanceChart() {
  const [points, setPoints] = useState([]);

  async function loadPerformance() {
    const res = await fetch(`${API_URL}/portfolio-performance`);
    const data = await res.json();

    if (data.ok) {
      setPoints(data.performance.points || []);
    }
  }

  useEffect(() => {
    loadPerformance();

    const interval = setInterval(loadPerformance, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <h2 className="text-2xl font-bold mb-5">
        Portfolio Performance
      </h2>

      <div style={{ width: "100%", height: 360 }}>
        <ResponsiveContainer>
          <LineChart data={points}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="day" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="portfolioValue"
              name="Portfolio Value"
              stroke="#22c55e"
              strokeWidth={2}
            />

            <Line
              type="monotone"
              dataKey="pnl"
              name="P&L"
              stroke="#38bdf8"
              strokeWidth={2}
            />

            <Line
              type="monotone"
              dataKey="buyingPower"
              name="Buying Power"
              stroke="#a855f7"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}