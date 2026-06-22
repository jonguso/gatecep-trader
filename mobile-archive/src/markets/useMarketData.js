import { useCallback, useEffect, useState } from "react";
import { applySecurityMaster } from "../utils/nseSecurityMaster";
import { API_URL } from "../config/apiConfig";

export default function useMarketData() {
  const [rows, setRows] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

const FALLBACK_MARKET_ROWS = [
  { symbol: "SCOM", name: "Safaricom PLC", sector: "Telecom", price: 30.6, lastPrice: 30.6, changePct: 0, turnover: 0 },
  { symbol: "KCB", name: "KCB Group PLC", sector: "Banking", price: 67.75, lastPrice: 67.75, changePct: 0, turnover: 0 },
  { symbol: "COOP", name: "Co-operative Bank of Kenya Ltd", sector: "Banking", price: 31.6, lastPrice: 31.6, changePct: 0, turnover: 0 },
  { symbol: "EABL", name: "East African Breweries PLC", sector: "Mfg. and Allied", price: 248, lastPrice: 248, changePct: 0, turnover: 0 },
  { symbol: "BAT", name: "British American Tobacco Kenya PLC", sector: "Mfg. and Allied", price: 520, lastPrice: 520, changePct: 0, turnover: 0 },
  { symbol: "SMWF", name: "Sanlam MSCI World ETF", sector: "ETF", price: 940, lastPrice: 940, changePct: 0, turnover: 0 },
  { symbol: "SCBK", name: "Standard Chartered Bank Kenya Ltd", sector: "Banking", price: 336, lastPrice: 336, changePct: 0, turnover: 0 },
  { symbol: "ABSA", name: "Absa Bank Kenya PLC", sector: "Banking", price: 29, lastPrice: 29, changePct: 0, turnover: 0 },
  { symbol: "KEGN", name: "KenGen PLC", sector: "Energy and Petroleum", price: 9.12, lastPrice: 9.12, changePct: 0, turnover: 0 }
];

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/prices`);

      if (!response.ok) {
        throw new Error("Market request failed.");
      }

      const json = await response.json();

      const list = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.prices)
        ? json.prices
        : [];

      const mastered = list
        .map(applySecurityMaster)
        .filter((x) => x.symbol)
        .sort((a, b) => String(a.symbol).localeCompare(String(b.symbol)));

      setRows(mastered);
      setConnected(true);
      setLastUpdated(json?.generatedAt || new Date().toISOString());
    } catch (error) {
      console.log("Market data fallback:", error.message);
      setRows(FALLBACK_MARKET_ROWS.map(applySecurityMaster));
setConnected(false);
setLastUpdated(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    rows,
    connected,
    loading,
    lastUpdated,
    reload: load
  };
}