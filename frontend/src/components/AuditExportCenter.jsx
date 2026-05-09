import React from "react";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000";

const exportsList = [
  {
    title: "Orders Export",
    description:
      "Download OMS order history and execution records.",
    endpoint: "/exports/orders.csv"
  },
  {
    title: "P&L Export",
    description:
      "Download realized profit and loss analytics.",
    endpoint: "/exports/pnl.csv"
  },
  {
    title: "Compliance Export",
    description:
      "Download compliance alerts and surveillance events.",
    endpoint: "/exports/compliance.csv"
  },
  {
    title: "Settlement Export",
    description:
      "Download settlement ledger and cash movements.",
    endpoint: "/exports/settlement.csv"
  }
];

export default function AuditExportCenter() {
  function downloadFile(endpoint) {
    window.open(`${API_URL}${endpoint}`, "_blank");
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-xl text-white mt-6">
      <h2 className="text-2xl font-bold mb-5">
        Audit Export Center
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exportsList.map((item) => (
          <div
            key={item.endpoint}
            className="bg-slate-800 border border-slate-700 rounded-xl p-5"
          >
            <div className="text-xl font-bold mb-2">
              {item.title}
            </div>

            <div className="text-sm text-slate-400 mb-5">
              {item.description}
            </div>

            <button
              onClick={() =>
                downloadFile(item.endpoint)
              }
              className="w-full bg-cyan-600 hover:bg-cyan-500 rounded-xl p-3 font-bold"
            >
              Download CSV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}