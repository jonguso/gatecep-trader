import { useState } from "react";
import { motion } from "framer-motion";
import MobileBuyingPowerBar from "./MobileBuyingPowerBar";
import MobileBottomNav from "../components/mobile/MobileBottomNav";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function MobileDepositFunds() {
  const [amount, setAmount] = useState(10000);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function depositFunds(value = amount) {
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(`${API_URL}/wallet/deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: Number(value)
        })
      });

      const data = await res.json();

      if (!data.ok) {
        setMessage(data.error || "Deposit failed");
        return;
      }

      setMessage(
        `Deposit successful: KES ${Number(value).toLocaleString()}`
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

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
          Deposit Funds
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          Add demo funds to your Gatecep trading wallet.
        </p>

        <div className="bg-slate-900 rounded-2xl p-5 mt-5 border border-slate-800">
          <label className="text-sm text-slate-400">
            Amount
          </label>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-xl font-bold"
          />

          <div className="grid grid-cols-2 gap-3 mt-4">
            {[5000, 10000, 50000, 100000].map((value) => (
              <button
                key={value}
                onClick={() => {
                  setAmount(value);
                  depositFunds(value);
                }}
                className="bg-slate-800 hover:bg-slate-700 rounded-xl py-3 font-bold text-cyan-300"
              >
                KES {value.toLocaleString()}
              </button>
            ))}
          </div>

          <button
            onClick={() => depositFunds()}
            disabled={loading}
            className="w-full mt-5 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 rounded-2xl py-4 font-bold text-lg"
          >
            {loading ? "Depositing..." : "Deposit Funds"}
          </button>

          {message && (
            <div className="mt-4 bg-green-500/10 border border-green-500 rounded-xl p-3 text-sm text-green-300">
              {message}
            </div>
          )}
        </div>
      </div>

      <MobileBottomNav />
    </motion.div>
  );
}