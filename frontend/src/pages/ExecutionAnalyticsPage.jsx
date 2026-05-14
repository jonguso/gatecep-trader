import React, { useEffect, useState } from "react";
import ExecutionAnalyticsCharts from "../components/ExecutionAnalyticsCharts";
import SmartRoutingPanel from "../components/SmartRoutingPanel";
import BrokerHealthPanel from "../components/BrokerHealthPanel";
import OmsAlertsPanel from "../components/OmsAlertsPanel";
import LiveOrderExecutionPanel from "../components/orders/LiveOrderExecutionPanel";
import NSEChartPanel from "../components/NSEChartPanel";
import PortfolioRiskPanel from "../components/PortfolioRiskPanel";
import OrderBookPanel from "../components/OrderBookPanel";
import ExecutionAdvisorPanel from "../components/ExecutionAdvisorPanel";
import OrderSplitterPanel from "../components/OrderSplitterPanel";
import ChildOrderExecutionPanel from "../components/ChildOrderExecutionPanel";
import ExecutionTimelinePanel from "../components/ExecutionTimelinePanel";
import SmartBrokerScorePanel from "../components/SmartBrokerScorePanel";
import ExecutionQualityPanel from "../components/ExecutionQualityPanel";
import BrokerLeaderboardPanel from "../components/BrokerLeaderboardPanel";
import ExecutionQualityAdvisor from "../components/ExecutionQualityAdvisor";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

function KpiCard({ title, value, color }) {
  return (
    <div className="bg-slate-900 rounded-2xl p-5 shadow-xl">
      <div className="text-sm text-slate-400 mb-2">{title}</div>

      <div className={`text-3xl font-bold ${color || "text-white"}`}>
        {value}
      </div>
    </div>
  );
}

function BrokerTable({ brokerStats }) {
  const brokers = Object.entries(brokerStats || {});

  return (
    <div className="bg-slate-900 rounded-2xl p-5 shadow-xl">
      <h2 className="text-xl font-bold mb-4 text-white">
        Broker Performance
      </h2>

      <table className="w-full text-sm text-white">
        <thead className="text-slate-400 border-b border-slate-700">
          <tr>
            <th className="text-left py-2">Broker</th>
            <th className="text-left py-2">Orders</th>
            <th className="text-left py-2">Filled</th>
            <th className="text-left py-2">Rejected</th>
            <th className="text-left py-2">Cancelled</th>
          </tr>
        </thead>

        <tbody>
          {brokers.map(([broker, stats]) => (
            <tr
              key={broker}
              className="border-b border-slate-800"
            >
              <td className="py-3 font-semibold">{broker}</td>

              <td>{stats.totalOrders}</td>

              <td className="text-green-400">
                {stats.filledOrders}
              </td>

              <td className="text-red-400">
                {stats.rejectedOrders}
              </td>

              <td className="text-yellow-400">
                {stats.cancelledOrders}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ExecutionAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);

  async function loadAnalytics() {
    try {
      const res = await fetch(
        `${API_URL}/execution/analytics`
      );

      const data = await res.json();

      if (data.ok) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error("Analytics load failed:", error);
    }
  }

  useEffect(() => {
    loadAnalytics();

    const interval = setInterval(loadAnalytics, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!analytics) {
    return (
      <div className="text-white p-10">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-950 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-6">
        Gatecep OMS Analytics
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <KpiCard
          title="Total Orders"
          value={analytics.totalOrders}
        />

        <KpiCard
          title="Filled Orders"
          value={analytics.filledOrders}
          color="text-green-400"
        />

        <KpiCard
          title="Rejected Orders"
          value={analytics.rejectedOrders}
          color="text-red-400"
        />

        <KpiCard
          title="Cancelled Orders"
          value={analytics.cancelledOrders}
          color="text-yellow-400"
        />

        <KpiCard
          title="Fill Rate"
          value={`${analytics.fillRate}%`}
          color="text-cyan-400"
        />

        <KpiCard
          title="Average Fill %"
          value={`${analytics.averageFillPercent}%`}
          color="text-purple-400"
        />
      </div>

<NSEChartPanel />
<BrokerTable brokerStats={analytics.brokerStats} />
<ExecutionAnalyticsCharts analytics={analytics} />
<ExecutionQualityPanel />
<BrokerLeaderboardPanel />
<ExecutionQualityAdvisor />
<SmartRoutingPanel />
<SmartBrokerScorePanel />
<BrokerHealthPanel />
<OmsAlertsPanel />
<PortfolioRiskPanel />
<OrderBookPanel />
<ExecutionAdvisorPanel />
<OrderSplitterPanel />
<LiveOrderExecutionPanel />
<ChildOrderExecutionPanel />
    </div>
  );
}