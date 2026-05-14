import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { io } from "socket.io-client";

import {
  calculateEMA,
  calculateRSI
} from "../utils/indicators";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function NSEChartPanel() {
  const [symbol, setSymbol] = useState("KCB");
  const [series, setSeries] = useState([]);
  const [rsi, setRsi] = useState(0);
  const [emaLatest, setEmaLatest] = useState(0);
  const [trend, setTrend] = useState("NEUTRAL");

  function updateChart(candles = []) {
    const chartData = candles.map((candle) => ({
      x: new Date(candle.timestamp),
      y: [
        Number(candle.open),
        Number(candle.high),
        Number(candle.low),
        Number(candle.close)
      ]
    }));

    const closes = candles.map((candle) =>
      Number(candle.close)
    );

    const ema10 = calculateEMA(closes, 10);

    const rsiValue =
      closes.length > 14
        ? calculateRSI(closes, 14)
        : 0;

    const latestClose =
      closes[closes.length - 1] || 0;

    const latestEma =
      ema10[ema10.length - 1] || 0;

    setRsi(rsiValue);
    setEmaLatest(latestEma);

    if (latestClose > latestEma) {
      setTrend("BULLISH");
    } else if (latestClose < latestEma) {
      setTrend("BEARISH");
    } else {
      setTrend("NEUTRAL");
    }

    setSeries([
      {
        name: "OHLC",
        type: "candlestick",
        data: chartData
      }
    ]);
  }

  async function loadCandles(selectedSymbol = symbol) {
    try {
      const res = await fetch(
        `${API_URL}/candles/${selectedSymbol}`
      );

      const candles = await res.json();

      updateChart(candles);
    } catch (error) {
      console.error("Failed to load candles:", error);
    }
  }

  useEffect(() => {
    loadCandles(symbol);

    const token =
      localStorage.getItem("gatecep_token");

    const socket = io(API_URL, {
      transports: ["websocket"],
      auth: {
        token
      }
    });

    socket.on("candles:update", (payload) => {
      if (payload.symbol !== symbol) return;

      updateChart(payload.candles || []);
    });

    return () => {
      socket.off("candles:update");
      socket.disconnect();
    };
  }, [symbol]);

  const options = {
    chart: {
      type: "candlestick",
      background: "transparent",
      toolbar: {
        show: true
      }
    },
    theme: {
      mode: "dark"
    },
    title: {
      text: `${symbol} Candlestick Chart`,
      align: "left",
      style: {
        color: "#ffffff"
      }
    },
    xaxis: {
      type: "datetime",
      labels: {
        style: {
          colors: "#CBD5E1"
        }
      }
    },
    yaxis: {
      tooltip: {
        enabled: true
      },
      labels: {
        style: {
          colors: "#CBD5E1"
        }
      }
    },
    grid: {
      borderColor: "#334155"
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: "#22C55E",
          downward: "#EF4444"
        }
      }
    },
    tooltip: {
      theme: "dark"
    }
  };

  function rsiLabel() {
    if (rsi >= 70) return "OVERBOUGHT";
    if (rsi <= 30 && rsi > 0) return "OVERSOLD";
    return "NEUTRAL";
  }

  function trendColor() {
    if (trend === "BULLISH") {
      return "text-green-400 border-green-500 bg-green-500/10";
    }

    if (trend === "BEARISH") {
      return "text-red-400 border-red-500 bg-red-500/10";
    }

    return "text-yellow-400 border-yellow-500 bg-yellow-500/10";
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-5">
        <div>
          <h2 className="text-2xl font-bold">
            NSE Candlestick Chart
          </h2>

          <p className="text-slate-400 text-sm">
            OHLC candles with RSI and EMA trend intelligence for Coach G
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700">
            <div className="text-xs text-slate-400">RSI</div>

            <div className="text-lg font-bold text-cyan-400">
              {rsi}
            </div>

            <div className="text-xs text-slate-400">
              {rsiLabel()}
            </div>
          </div>

          <div
            className={`px-4 py-2 rounded-xl border ${
              rsi <= 30 && rsi > 0
                ? "border-green-500 bg-green-500/10 text-green-400"
                : rsi >= 70
                ? "border-red-500 bg-red-500/10 text-red-400"
                : "border-yellow-500 bg-yellow-500/10 text-yellow-400"
            }`}
          >
            <div className="text-xs opacity-80">
              Coach G Signal
            </div>

            <div className="text-lg font-bold">
              {rsi <= 30 && rsi > 0
                ? "BUY"
                : rsi >= 70
                ? "SELL"
                : "HOLD"}
            </div>
          </div>

          <div className={`px-4 py-2 rounded-xl border ${trendColor()}`}>
            <div className="text-xs opacity-80">
              EMA Trend
            </div>

            <div className="text-lg font-bold">
              {trend}
            </div>

            <div className="text-xs opacity-80">
              EMA10: {emaLatest}
            </div>
          </div>

          <select
            value={symbol}
            onChange={(event) =>
              setSymbol(event.target.value)
            }
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
          >
            <option value="KCB">KCB</option>
            <option value="SCOM">SCOM</option>
            <option value="EQTY">EQTY</option>
            <option value="COOP">COOP</option>
            <option value="EABL">EABL</option>
            <option value="BAT">BAT</option>
          </select>
        </div>
      </div>

      <Chart
        options={options}
        series={series}
        type="candlestick"
        height={420}
      />
    </div>
  );
}