import { useNavigate } from "react-router-dom";

export default function MobileBrokerMirrorHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-24">
      <h1 className="text-2xl font-bold">Welcome to Gatecep</h1>

      <p className="text-sm text-slate-400 mt-2">
        Upload your broker reports and Coach G will analyze your portfolio, risk, sectors, and future investment plan.
      </p>

      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 mt-5">
        <div className="font-bold text-cyan-300">
          Step 1: Upload Broker Holdings
        </div>
        <p className="text-sm text-slate-300 mt-2">
          This tells Gatecep what you currently own.
        </p>
      </div>

      <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 mt-3">
        <div className="font-bold text-purple-300">
          Step 2: Review Portfolio Analysis
        </div>
        <p className="text-sm text-slate-300 mt-2">
          Coach G checks concentration, sector exposure, and risk level.
        </p>
      </div>

      <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mt-3">
        <div className="font-bold text-green-300">
          Step 3: Simulate Future Investment
        </div>
        <p className="text-sm text-slate-300 mt-2">
          Enter an amount and Coach G recommends what to buy without forcing you to sell.
        </p>
      </div>

      <button
        onClick={() => navigate("/mobile/broker-upload")}
        className="w-full bg-purple-600 rounded-2xl p-4 font-bold mt-6"
      >
        Start Upload
      </button>

      <button
        onClick={() => navigate("/mobile/broker-rebalance")}
        className="w-full bg-slate-800 rounded-2xl p-4 font-bold mt-3"
      >
        View Portfolio Analysis
      </button>
    </div>
  );
}