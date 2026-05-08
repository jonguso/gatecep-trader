import React from "react";
import TradeBlotter from "../components/TradeBlotter";

export default function TradeBlotterPage() {
  return (
    <div className="p-6 bg-slate-950 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-6">
        Trade Blotter
      </h1>

      <TradeBlotter />
    </div>
  );
}