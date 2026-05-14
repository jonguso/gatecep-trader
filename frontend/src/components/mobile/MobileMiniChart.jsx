import { useEffect, useState } from "react";
import Chart from "react-apexcharts";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function MobileMiniChart({
  symbol = "SCOM",
  height = 160
}) {
  const [series, setSeries] = useState([]);

  async function loadCandles() {
    try {
      const res = await fetch(`${API_URL}/candles/${symbol}`);
      const candles = await res.json();

      const chartData = (candles || []).slice(-20).map((candle) => ({
        x: new Date(candle.timestamp),
        y: [
          Number(candle.open),
          Number(candle.high),
          Number(candle.low),
          Number(candle.close)
        ]
      }));

      setSeries([
        {
          data: chartData
        }
      ]);
    } catch (error) {
      console.error("Failed to load mobile chart:", error);
    }
  }

  useEffect(() => {
    loadCandles();

    const interval = setInterval(loadCandles, 10000);

    return () => clearInterval(interval);
  }, [symbol]);

  const options = {
    chart: {
      type: "candlestick",
      background: "transparent",
      toolbar: {
        show: false
      },
      sparkline: {
        enabled: true
      }
    },
    theme: {
      mode: "dark"
    },
    xaxis: {
      type: "datetime",
      labels: {
        show: false
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        show: false
      },
      tooltip: {
        enabled: false
      }
    },
    grid: {
      show: false
    },
    tooltip: {
      theme: "dark"
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: "#22c55e",
          downward: "#ef4444"
        }
      }
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      <Chart
        options={options}
        series={series}
        type="candlestick"
        height={height}
      />
    </div>
  );
}