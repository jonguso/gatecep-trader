import { useEffect, useRef, useState } from "react";
import API from "../api";

function httpToWs(url) {
  return String(url || "").replace(/^https:/, "wss:").replace(/^http:/, "ws:");
}

export default function useMarketData() {
  const [rows, setRows] = useState([]);
  const [connected, setConnected] = useState(false);
  const timerRef = useRef(null);
  const wsRef = useRef(null);

  const loadHttp = async () => {
    try {
      const r = await API.get("/prices");
      setRows(r.data?.data || []);
    } catch {}
  };

  useEffect(() => {
    loadHttp();

    try {
      const ws = new WebSocket(`${httpToWs(API.defaults.baseURL)}/ws/market`);
      wsRef.current = ws;
      ws.onopen = () => setConnected(true);
      ws.onclose = () => setConnected(false);
      ws.onerror = () => setConnected(false);
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "MARKET_SNAPSHOT") setRows(msg.data || []);
        } catch {}
      };
    } catch {}

    timerRef.current = setInterval(loadHttp, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      try { wsRef.current?.close?.(); } catch {}
    };
  }, []);

  return { rows, connected, refresh: loadHttp };
}
