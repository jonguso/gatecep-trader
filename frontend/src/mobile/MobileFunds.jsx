import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MobileBottomNav from "../components/mobile/MobileBottomNav";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function formatMoney(value) {
  return `KES ${Number(value || 0).toLocaleString()}`;
}

export default function MobileFunds() {
  const [wallet, setWallet] = useState(null);

  async function loadWallet() {
    try {
      const res = await fetch(`${API_URL}/wallet/balance`);
      const data = await res.json();

      if (data.ok) {
        setWallet(data.wallet);
      }
    } catch (error) {
      console.error("Failed to load funds:", error);
    }
  }

  useEffect(() => {
    loadWallet();

    const interval = setInterval(loadWallet, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-slate-950 min-h-screen text-white pb-24"
    >
      <div className="p-4">
        <h1 className="text-3xl font-bold">
          Funds
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          Broker-style cash, buying power, and settlement balances.
        </p>

<a
  href="/mobile/broker-treasury"
  className="block bg-purple-500/10 border border-purple-500/40 rounded-2xl p-4 mt-5"
>
  <div className="text-purple-300 font-bold">
    Open Broker Treasury
  </div>

  <div className="text-sm text-slate-300 mt-1">
    View broker buying power, reserved cash, and treasury utilization.
  </div>
</a>

        <div className="bg-cyan-500/10 border border-cyan-500/40 rounded-2xl p-5 mt-5">
          <div className="text-xs text-slate-400">
            Available Funds
          </div>

          <div className="text-4xl font-bold text-cyan-300 mt-2">
            {formatMoney(wallet?.balance)}
          </div>

          <div className="text-sm text-slate-300 mt-3">
            Available for new buy orders after pending commitments.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5">
          <FundMetric
            title="Ledger Balance"
            value={wallet?.ledgerBalance}
            color="text-green-300"
          />

          <FundMetric
            title="Pending Orders"
            value={wallet?.pendingOrders}
            color="text-yellow-300"
          />

          <FundMetric
            title="Pending Settlement"
            value={wallet?.pendingSettlement}
            color="text-orange-300"
          />

          <FundMetric
            title="Currency"
            value={wallet?.currency || "KES"}
            textOnly
            color="text-cyan-300"
          />
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mt-5">
          <div className="font-bold text-lg">
            Last Transaction
          </div>

          {wallet?.lastTransaction ? (
            <div className="mt-4 space-y-3 text-sm">
              <DetailRow
                label="Type"
                value={wallet.lastTransaction.type}
              />

              <DetailRow
                label="Amount"
                value={formatMoney(wallet.lastTransaction.amount)}
              />

              <DetailRow
                label="Note"
                value={wallet.lastTransaction.note}
              />

              <DetailRow
                label="Time"
                value={new Date(
                  wallet.lastTransaction.createdAt
                ).toLocaleString()}
              />
            </div>
          ) : (
            <div className="text-slate-400 text-sm mt-3">
              No recent transactions.
            </div>
          )}
        </div>

        <div className="bg-cyan-500/10 border border-cyan-500/40 rounded-2xl p-4 mt-5">
          <div className="text-cyan-300 font-bold">
            Coach G Funds Insight
          </div>

          <div className="text-sm text-slate-300 mt-2 leading-6">
            Available funds are calculated as Ledger Balance minus Pending Orders and Pending Settlement. This mirrors broker-style buying power logic.
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </motion.div>
  );
}

function FundMetric({
  title,
  value,
  color,
  textOnly = false
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
      <div className="text-xs text-slate-400">
        {title}
      </div>

      <div className={`text-xl font-bold mt-2 ${color}`}>
        {textOnly ? value : formatMoney(value)}
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3 border-b border-slate-800 pb-2">
      <div className="text-slate-400">
        {label}
      </div>

      <div className="font-bold text-right">
        {value}
      </div>
    </div>
  );
}