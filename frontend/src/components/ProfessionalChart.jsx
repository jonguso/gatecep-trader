import React, { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  Line
} from "recharts";

import { generateCandles } from "../services/chartData.service";

function calculateMA(data, period = 10) {
  return data.map((item, index) => {
    if (index < period) {
      return {
        ...item,
        ma: null
      };
    }

    const slice = data.slice(
      index - period,
      index
    );

    const avg =
      slice.reduce(
        (sum, d) => sum + d.close,
        0
      ) / period;

    return {
      ...item,
      ma: Number(avg.toFixed(2))
    };
  });
}

export default function ProfessionalChart() {
  const [symbol, setSymbol] = useState("SCOM");
  const [candles, setCandles] = useState([]);

  function loadChart() {
    const data = generateCandles(symbol);

    setCandles(calculateMA(data));
  }

  useEffect(() => {
    loadChart();

    const interval = setInterval(loadChart, 5000);

    return () => clearInterval(interval);
  }, [symbol]);

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-bold">
          Professional Trading Chart
        </h2>

        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="bg-slate-800 rounded-xl px-4 py-2"
        >
          <option value="SCOM">SCOM</option>
          <option value="EQTY">EQTY</option>
          <option value="KCB">KCB</option>
          <option value="COOP">COOP</option>
        </select>
      </div>

      <div style={{ width: "100%", height: 500 }}>
        <ResponsiveContainer>
          <ComposedChart data={candles}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="time" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="volume"
              opacity={0.3}
            />

            <Line
              type="monotone"
              dataKey="close"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              name="Price"
            />

            <Line
              type="monotone"
              dataKey="ma"
              stroke="#38bdf8"
              strokeWidth={2}
              dot={false}
              name="MA(10)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}