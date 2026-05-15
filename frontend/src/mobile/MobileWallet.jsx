import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MobileBuyingPowerBar from "./MobileBuyingPowerBar";
import MobileBottomNav from "../components/mobile/MobileBottomNav";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function MobileWallet() {
  const [wallet, setWallet] = useState(null);
  const [ledger, setLedger] = useState([]);

  async function loadWallet() {
    try {
      const [balanceRes, ledgerRes] = await Promise.all([
        fetch(`${API_URL}/wallet/balance`),
        fetch(`${API_URL}/wallet/ledger`)
      ]);

      const balanceData = await balanceRes.json();
      const ledgerData = await ledgerRes.json();

      if (balanceData.ok) {
        setWallet(balanceData.wallet);
      }

      if (ledgerData.ok) {
        setLedger(ledgerData.ledger || []);
      }
    } catch (error) {
      console.error("Failed to load wallet:", error);
    }
  }

  useEffect(() => {
    loadWallet();

    const interval = setInterval(loadWallet, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-slate-950 min-h-screen text-white pb-24"
    >
      <MobileBuyingPowerBar />

      <div className="p-4">
        <h1 className="text-3xl font-bold">
          Wallet
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          Funding, buying power, and wallet activity.
        </p>

        <div className="bg-slate-900 rounded-2xl p-5 mt-5 border border-slate-800">
          <div className="text-xs text-slate-400">
            Available Balance
          </div>

          <div className="text-4xl font-bold text-green-400 mt-2">
            KES{" "}
            {Number(wallet?.balance || 0).toLocaleString()}
          </div>

          <a
            href="/mobile/deposit"
            className="block mt-5 bg-green-600 hover:bg-green-500 rounded-2xl py-4 text-center font-bold"
          >
            Deposit Funds
          </a>
        </div>

        <h2 className="text-xl font-bold mt-6 mb-3">
          Transaction History
        </h2>

        <div className="space-y-3">
          {ledger.map((item) => {
            const isCredit =
  item.type === "CREDIT" ||
  item.type === "DEPOSIT";

const amountColor = isCredit
  ? "text-green-400"
  : "text-red-400";

const label =
  item.type === "DEPOSIT"
    ? "Deposit"
    : item.type === "CREDIT"
    ? "Credit"
    : "Debit";

const sign = isCredit ? "+" : "-";

            return (
              <div
                key={item.id}
                className="bg-slate-900 rounded-2xl p-4 border border-slate-800"
              >
                <div className="flex justify-between">
                  <div>
                    <div
                      className={`font-bold ${amountColor}`}
                    >
                      {label}
                    </div>

                    <div className="text-xs text-slate-400 mt-1">
                      {item.description}
                    </div>

                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-bold ${amountColor}`}
                    >
                     {sign} KES{" "}
                      {Number(item.amount || 0).toLocaleString()}
                    </div>

                    <div className="text-xs text-slate-400 mt-1">
                      Balance: KES{" "}
                      {Number(
                        item.balanceAfter || 0
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {ledger.length === 0 && (
            <div className="bg-slate-900 rounded-2xl p-6 text-center text-slate-400">
              No wallet activity yet.
            </div>
          )}
        </div>
      </div>

      <MobileBottomNav />
    </motion.div>
  );
}