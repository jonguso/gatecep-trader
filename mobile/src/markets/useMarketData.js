import { useCallback, useEffect, useState } from "react";
import { applySecurityMaster } from "../utils/nseSecurityMaster";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "http://localhost:4000";

export default function useMarketData() {
  const [rows, setRows] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

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
      setRows([]);
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