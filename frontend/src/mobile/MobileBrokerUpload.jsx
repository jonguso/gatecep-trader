import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

const documentTypes = [
  {
    type: "holdings",
    title: "Holdings Report",
    required: true,
    description:
      "Shows shares you currently own. Required for portfolio analysis.",
    examples: "Security Code, Security Name, Quantity"
  },
  {
    type: "transactions",
    title: "Transaction History",
    required: false,
    description:
      "Shows buy/sell history. Useful for future gain/loss analysis.",
    examples: "Date, Symbol, Buy/Sell, Quantity, Price"
  },
  {
    type: "valuation",
    title: "Portfolio Valuation",
    required: false,
    description:
      "Shows broker-calculated market value. Useful for reconciliation.",
    examples: "Symbol, Quantity, Market Price, Market Value"
  },
  {
    type: "cash",
    title: "Cash / Ledger Statement",
    required: false,
    description:
      "Shows deposits, withdrawals, and available cash.",
    examples: "Date, Description, Amount, Balance"
  }
];

export default function MobileBrokerUpload() {
  const navigate = useNavigate();

  const [broker, setBroker] = useState("AIB");
  const [selectedType, setSelectedType] = useState("holdings");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  async function uploadFile() {
    try {
      if (!file) {
        setStatus("Please select a file first.");
        return;
      }

      const form = new FormData();
      form.append("file", file);
      form.append("broker", broker);
      form.append("reportType", selectedType);

      setStatus("Uploading...");

      const res = await fetch(
        `${API_URL}/broker-reports/upload`,
        {
          method: "POST",
          body: form
        }
      );

      const text = await res.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text);
      }

      if (data.ok) {
        setStatus(
          `Upload completed. Imported ${data.count} records.`
        );
      } else {
        setStatus(data.error || "Upload failed.");
      }
    } catch (error) {
      console.error(error);
      setStatus(error.message || "Upload failed.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-24">
      <h1 className="text-2xl font-bold">
        Broker Report Upload
      </h1>

      <p className="text-sm text-slate-400 mt-2">
        Upload exported CSV or Excel reports from your broker.
      </p>

      <div className="mt-5">
        <label className="text-sm text-slate-400">
          Broker
        </label>

        <select
          value={broker}
          onChange={(e) => setBroker(e.target.value)}
          className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl p-3"
        >
          <option value="AIB">AIB-AXYS</option>
          <option value="ABC">ABC Capital</option>
          <option value="NCBA">NCBA</option>
        </select>
      </div>

      <h2 className="text-lg font-bold mt-6 mb-3">
        What are you uploading?
      </h2>

      <div className="space-y-3">
        {documentTypes.map((doc) => {
          const active = selectedType === doc.type;

          return (
            <button
              key={doc.type}
              onClick={() => setSelectedType(doc.type)}
              className={`w-full text-left rounded-2xl p-4 border ${
                active
                  ? "bg-purple-500/20 border-purple-500"
                  : "bg-slate-900 border-slate-800"
              }`}
            >
              <div className="flex justify-between">
                <div className="font-bold">
                  {doc.title}
                </div>

                {doc.required && (
                  <span className="text-xs text-red-300">
                    Required
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-400 mt-2">
                {doc.description}
              </p>

              <div className="text-xs text-cyan-300 mt-2">
                Expected: {doc.examples}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <label className="text-sm text-slate-400">
          Select CSV or Excel File
        </label>

        <input
          type="file"
          accept=".csv,.xls,.xlsx"
          onChange={(e) =>
            setFile(e.target.files?.[0] || null)
          }
          className="mt-3 w-full text-sm"
        />

        {file && (
          <div className="text-sm text-green-300 mt-3">
            Selected: {file.name}
          </div>
        )}
      </div>

      {status && (
        <div className="mt-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-3 text-sm whitespace-pre-wrap">
          {status}
        </div>
      )}

      <button
        onClick={uploadFile}
        className="w-full bg-purple-600 rounded-2xl p-4 font-bold mt-5"
      >
        Upload Report
      </button>

      <button
        onClick={() => navigate("/mobile/broker-rebalance")}
        className="w-full bg-slate-800 rounded-2xl p-4 font-bold mt-3"
      >
        Continue to Portfolio Analysis
      </button>
    </div>
  );
}