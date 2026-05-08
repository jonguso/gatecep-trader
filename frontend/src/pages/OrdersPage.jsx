import React from "react";
import LiveOrderExecutionPanel from "../components/orders/LiveOrderExecutionPanel";

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Orders & Broker Execution</h1>
          <p className="text-slate-400 mt-1">
            Track live order status, broker routing, execution progress, and partial fills.
          </p>
        </div>

        <LiveOrderExecutionPanel />
      </div>
    </div>
  );
}