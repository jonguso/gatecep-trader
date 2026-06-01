import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function MobileHoldingDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const brokerLink = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("gatecepBrokerLink") || "{}"
      );
    } catch {
      return {};
    }
  }, []);

  const broker = brokerLink.broker || "AIB-AXYS";
  const clientNumber = brokerLink.clientNumber || "";
  const cdsNumber = brokerLink.cdsNumber || "";

  const brokerQuery = `clientNumber=${encodeURIComponent(
    clientNumber
  )}&cdsNumber=${encodeURIComponent(cdsNumber)}`;

  const [heatmap, setHeatmap] = useState([]);
  const [expandedSector, setExpandedSector] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadHoldings() {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/broker-heatmap/${broker}?${brokerQuery}`
      );

      const data = await res.json();

      setHeatmap(data.heatmap || []);
    } catch {
      setHeatmap([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHoldings();

    const selectedSector = searchParams.get("sector");

    if (selectedSector) {
      setExpandedSector(selectedSector);
    }
  }, []);

  const sectorRows = useMemo(() => {
    const grouped = heatmap.reduce((acc, item) => {
      const sector = item.sector || "Unknown";

      if (!acc[sector]) {
        acc[sector] = {
          sector,
          securities: [],
          totalValue: 0,
          totalProfitLoss: 0
        };
      }

      acc[sector].securities.push(item);
      acc[sector].totalValue += Number(
        item.value || item.marketValue || 0
      );
      acc[sector].totalProfitLoss += Number(item.profitLoss || 0);

      return acc;
    }, {});

    return Object.values(grouped).sort(
      (a, b) =>
        Number(b.totalValue || 0) -
        Number(a.totalValue || 0)
    );
  }, [heatmap]);

  const totalValue = sectorRows.reduce(
    (sum, item) => sum + Number(item.totalValue || 0),
    0
  );

  const totalProfitLoss = sectorRows.reduce(
    (sum, item) => sum + Number(item.totalProfitLoss || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-4">
        Loading holding details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-24">
      <button
        onClick={() => navigate(-1)}
        className="text-cyan-300 text-sm mb-4"
      >
        ← Back to Portfolio Analysis
      </button>

      <h1 className="text-2xl font-bold">
        Holding Details
      </h1>

      <p className="text-sm text-slate-400 mt-2">
        Current holdings grouped by sector using portfolio valuation.
      </p>

      <div className="mt-4 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4">
        <div className="font-bold text-cyan-300">
          Linked Broker
        </div>

        <div className="text-sm text-slate-300 mt-2">
          Broker: {broker}
        </div>

        <div className="text-sm text-slate-300">
          Client Number: {clientNumber || "N/A"}
        </div>

        <div className="text-sm text-slate-300">
          CDS Number: {cdsNumber || "N/A"}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mt-5">
        <div className="grid grid-cols-2 gap-4">
          <Metric
            label="Total Holding Value"
            value={`KES ${money(totalValue)}`}
            color="text-cyan-300"
          />

          <Metric
            label="Total Gain/Loss"
            value={`KES ${money(totalProfitLoss)}`}
            color={
              totalProfitLoss >= 0
                ? "text-green-300"
                : "text-red-300"
            }
          />
        </div>
      </div>

      {sectorRows.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mt-5 text-slate-400">
          No holding details available yet.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {sectorRows.map((sector) => {
            const expanded =
              expandedSector === sector.sector;

            const sectorWeight =
              totalValue > 0
                ? (
                    (Number(sector.totalValue || 0) /
                      Number(totalValue || 1)) *
                    100
                  ).toFixed(2)
                : "0.00";

            return (
              <div
                key={sector.sector}
                className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800"
              >
                <button
                  className="w-full p-4 flex justify-between items-center text-left"
                  onClick={() =>
                    setExpandedSector(
                      expanded ? null : sector.sector
                    )
                  }
                >
                  <div>
                    <div className="font-bold">
                      {sector.sector}
                    </div>

                    <div className="text-xs text-slate-400 mt-1">
                      {sector.securities.length} securities • {sectorWeight}%
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold">
                      KES {money(sector.totalValue)}
                    </div>

                    <div
                      className={
                        Number(sector.totalProfitLoss || 0) >= 0
                          ? "text-xs text-green-300"
                          : "text-xs text-red-300"
                      }
                    >
                      P/L: KES {money(sector.totalProfitLoss)}
                    </div>
                  </div>
                </button>

                {expanded && (
                  <div className="px-4 pb-4">
                    {sector.securities.map((sec) => (
                      <div
                        key={sec.symbol}
                        className="bg-slate-950 rounded-xl p-3 mb-2 border border-slate-800"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-lg">
                              {sec.symbol}
                            </div>

                            <div className="text-xs text-slate-400">
                              {sector.sector}
                            </div>
                          </div>

                          <div
                            className={
                              Number(sec.profitLoss || 0) >= 0
                                ? "text-green-300 font-bold"
                                : "text-red-300 font-bold"
                            }
                          >
                            KES {money(sec.profitLoss)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                          <Info
                            label="Quantity"
                            value={Number(sec.quantity || 0).toLocaleString()}
                          />

                          <Info
                            label="Market Price"
                            value={`KES ${money(sec.price)}`}
                          />

                          <Info
                            label="Market Value"
                            value={`KES ${money(sec.value || sec.marketValue)}`}
                          />

                          <Info
                            label="Return"
                            value={`${Number(sec.changePct || 0).toFixed(2)}%`}
                            valueClass={
                              Number(sec.changePct || 0) >= 0
                                ? "text-green-300"
                                : "text-red-300"
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div>
      <div className="text-xs text-slate-400">
        {label}
      </div>

      <div className={`${color} text-xl font-bold`}>
        {value}
      </div>
    </div>
  );
}

function Info({ label, value, valueClass = "text-white" }) {
  return (
    <div className="bg-slate-900 rounded-xl p-3">
      <div className="text-slate-400">
        {label}
      </div>

      <div className={`${valueClass} font-bold mt-1`}>
        {value}
      </div>
    </div>
  );
}

function money(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}