import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MobileBottomNav from "../components/mobile/MobileBottomNav";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function formatMoney(value) {
  return `KES ${Number(value || 0).toLocaleString()}`;
}

function utilizationColor(value) {
  if (value >= 80) return "text-red-400";
  if (value >= 50) return "text-yellow-300";
  return "text-green-400";
}

export default function MobileBrokerTreasury() {
  const [brokers, setBrokers] = useState([]);

  async function loadBrokerCash() {
    try {
      const res = await fetch(`${API_URL}/broker-cash`);
      const data = await res.json();

      if (data.ok) {
        setBrokers(data.brokers || []);
      }
    } catch (error) {
      console.error("Failed to load broker treasury:", error);
    }
  }

  useEffect(() => {
    loadBrokerCash();

    const interval = setInterval(loadBrokerCash, 10000);

    return () => clearInterval(interval);
  }, []);

  const totalLedger = brokers.reduce(
    (sum, item) => sum + Number(item.ledgerBalance || 0),
    0
  );

  const totalBuyingPower = brokers.reduce(
    (sum, item) => sum + Number(item.buyingPower || 0),
    0
  );

  const totalReserved = brokers.reduce(
    (sum, item) => sum + Number(item.reserved || 0),
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-slate-950 min-h-screen text-white pb-24"
    >
      <div className="p-4">
        <h1 className="text-3xl font-bold">
          Broker Treasury
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          Broker-level buying power, reserved cash, and settlement balances.
        </p>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <SummaryCard
            title="Ledger"
            value={formatMoney(totalLedger)}
            color="text-green-300"
          />

          <SummaryCard
            title="Buying Power"
            value={formatMoney(totalBuyingPower)}
            color="text-cyan-300"
          />

          <SummaryCard
            title="Reserved"
            value={formatMoney(totalReserved)}
            color="text-yellow-300"
          />
        </div>

        <div className="space-y-4 mt-5">
          {brokers.map((broker) => {
            const ledger = Number(broker.ledgerBalance || 0);
            const reserved = Number(broker.reserved || 0);

            const utilization =
              ledger > 0
                ? Math.round((reserved / ledger) * 100)
                : 0;

            return (
              <div
                key={broker.broker}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-2xl font-bold">
                      {broker.broker}
                    </div>

                    <div className="text-xs text-slate-400 mt-1">
                      {broker.currency || "KES"} broker account
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">
                      Utilization
                    </div>

                    <div
                      className={`text-xl font-bold ${utilizationColor(
                        utilization
                      )}`}
                    >
                      {utilization}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <Metric
                    label="Ledger Balance"
                    value={formatMoney(broker.ledgerBalance)}
                    color="text-green-300"
                  />

                  <Metric
                    label="Buying Power"
                    value={formatMoney(broker.buyingPower)}
                    color="text-cyan-300"
                  />

                  <Metric
                    label="Reserved"
                    value={formatMoney(broker.reserved)}
                    color="text-yellow-300"
                  />

                  <Metric
                    label="Pending Settlement"
                    value={formatMoney(broker.pendingSettlement)}
                    color="text-orange-300"
                  />
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Reserved Cash Usage</span>
                    <span>{utilization}%</span>
                  </div>

                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={
                        utilization >= 80
                          ? "h-2 bg-red-400 rounded-full"
                          : utilization >= 50
                          ? "h-2 bg-yellow-300 rounded-full"
                          : "h-2 bg-green-400 rounded-full"
                      }
                      style={{
                        width: `${Math.min(utilization, 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {brokers.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
              No broker treasury data available.
            </div>
          )}
        </div>

        <div className="bg-cyan-500/10 border border-cyan-500/40 rounded-2xl p-4 mt-5">
          <div className="text-cyan-300 font-bold">
            Coach G Treasury Insight
          </div>

          <div className="text-sm text-slate-300 mt-2 leading-6">
            Coach G can route new orders toward brokers with stronger available buying power and lower reserved cash utilization.
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </motion.div>
  );
}

function SummaryCard({ title, value, color }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
      <div className="text-[10px] text-slate-400">
        {title}
      </div>

      <div className={`text-sm font-bold mt-2 ${color}`}>
        {value}
      </div>
    </div>
  );
}

function Metric({ label, value, color }) {
  return (
    <div className="bg-slate-800 rounded-xl p-3">
      <div className="text-xs text-slate-400">
        {label}
      </div>

      <div className={`font-bold mt-1 ${color}`}>
        {value}
      </div>
    </div>
  );
}