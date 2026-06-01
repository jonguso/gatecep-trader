import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

const documentTypes = [
  {
    type: "valuation",
    title: "Portfolio Valuation",
    required: true,
    description:
      "Primary report for Coach G analysis. Includes quantity, average price, market value, and profit/loss.",
    examples:
      "Security, Quantity, Avg.Price, Market Price, Market Value, Profit / Loss"
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
    type: "holdings",
    title: "Holdings Report",
    required: false,
    description:
      "Shows shares you currently own. Optional fallback if valuation is unavailable.",
    examples: "Security Code, Security Name, Quantity"
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

  const [brokerLink, setBrokerLink] = useState(null);
  const [broker, setBroker] = useState("AIB-AXYS");
  const [selectedType, setSelectedType] = useState("valuation");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("gatecepBrokerLink");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBrokerLink(parsed);

        if (parsed?.broker) {
          setBroker(parsed.broker);
        }
      } catch {
        setBrokerLink(null);
      }
    }
  }, []);

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

      if (brokerLink?.id) {
        form.append("brokerLinkId", brokerLink.id);
      }

      if (brokerLink?.clientNumber) {
        form.append("clientNumber", brokerLink.clientNumber);
      }

      if (brokerLink?.cdsNumber) {
        form.append("cdsNumber", brokerLink.cdsNumber);
      }

      if (brokerLink?.email) {
        form.append("email", brokerLink.email);
      }

      setStatus("Uploading...");

      const res = await fetch(`${API_URL}/broker-reports/upload`, {
        method: "POST",
        body: form
      });

      const text = await res.text();

      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(text);
      }

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      setStatus(
        `Upload completed. Imported ${
          data.imported ?? data.count ?? 0
        } records. Stored ${
          data.storedCount ?? data.count ?? 0
        } records. Duplicates skipped ${
          data.duplicatesSkipped ?? 0
        }.`
      );

      localStorage.setItem(
        "gatecepLastBrokerUpload",
        JSON.stringify({
          broker,
          reportType: selectedType,
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
          result: data
        })
      );
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
        Upload exported CSV or Excel reports from your broker. Coach G will use
        these reports to compare your actual portfolio against your investment
        profile.
      </p>

      {brokerLink && (
        <div className="mt-5 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4">
          <div className="font-bold text-cyan-300">
            Linked Broker Profile
          </div>

          <div className="text-sm text-slate-300 mt-2">
            Broker: {brokerLink.broker}
          </div>

          <div className="text-sm text-slate-300">
            Client Number: {brokerLink.clientNumber}
          </div>

          <div className="text-sm text-slate-300">
            CDS Number: {brokerLink.cdsNumber}
          </div>

          <div className="text-xs text-slate-500 mt-2">
            Status: {brokerLink.status}
          </div>
        </div>
      )}

      {!brokerLink && (
        <div className="mt-5 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
          <div className="font-bold text-yellow-300">
            Broker not linked yet
          </div>

          <p className="text-sm text-slate-300 mt-2">
            You can upload a report, but linking your broker first gives Coach G
            better context.
          </p>

          <button
            onClick={() => navigate("/mobile/broker-link")}
            className="w-full bg-yellow-600 rounded-2xl p-3 font-bold mt-4"
          >
            Link Broker First
          </button>
        </div>
      )}

      <div className="mt-5">
        <label className="text-sm text-slate-400">
          Broker
        </label>

        <select
          value={broker}
          onChange={(e) => setBroker(e.target.value)}
          className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl p-3"
        >
          <option value="AIB-AXYS">AIB-AXYS</option>
          <option value="ABC">ABC Capital</option>
          <option value="Dyer & Blair">Dyer & Blair</option>
          <option value="NCBA Investment Bank">NCBA Investment Bank</option>
          <option value="Standard Investment Bank">
            Standard Investment Bank
          </option>
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
          onChange={(e) => setFile(e.target.files?.[0] || null)}
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