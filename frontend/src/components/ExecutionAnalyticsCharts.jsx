import React from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

function BrokerBarChart({ brokerStats }) {
  const data = Object.entries(brokerStats || {}).map(
    ([broker, stats]) => ({
      broker,
      filled: stats.filledOrders,
      rejected: stats.rejectedOrders,
      cancelled: stats.cancelledOrders
    })
  );

  return (
    <div className="bg-slate-900 rounded-2xl p-5 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4">
        Broker Execution Performance
      </h2>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="broker" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Bar dataKey="filled" fill="#22c55e" />

            <Bar dataKey="rejected" fill="#ef4444" />

            <Bar dataKey="cancelled" fill="#eab308" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatusPieChart({ analytics }) {
  const data = [
    {
      name: "Filled",
      value: analytics.filledOrders
    },
    {
      name: "Rejected",
      value: analytics.rejectedOrders
    },
    {
      name: "Cancelled",
      value: analytics.cancelledOrders
    },
    {
      name: "Partial",
      value: analytics.partialFillOrders
    }
  ];

  const colors = [
    "#22c55e",
    "#ef4444",
    "#eab308",
    "#8b5cf6"
  ];

  return (
    <div className="bg-slate-900 rounded-2xl p-5 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4">
        Order Status Distribution
      </h2>

      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              outerRadius={110}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>

            <Tooltip />

            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function ExecutionAnalyticsCharts({
  analytics
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <BrokerBarChart
        brokerStats={analytics.brokerStats}
      />

      <StatusPieChart analytics={analytics} />
    </div>
  );
}