import { useNavigate } from "react-router-dom";

export default function MobileInvestorHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4">
      <h1 className="text-3xl font-bold">
        Start with Coach G
      </h1>

      <p className="text-sm text-slate-400 mt-2">
        Choose how you want Gatecep to guide your investment journey.
      </p>

      <div className="mt-6 space-y-4">
        <button
          onClick={() => navigate("/mobile/broker-link")}
          className="w-full bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-5 text-left"
        >
          <div className="text-xl font-bold text-cyan-300">
            Existing Investor
          </div>

          <p className="text-sm text-slate-300 mt-2">
            Link your broker, upload reports, and let Coach G analyze your current portfolio.
          </p>
        </button>

        <button
          onClick={() => navigate("/mobile/new-investor")}
          className="w-full bg-purple-500/10 border border-purple-500/30 rounded-2xl p-5 text-left"
        >
          <div className="text-xl font-bold text-purple-300">
            New Investor
          </div>

          <p className="text-sm text-slate-300 mt-2">
            Build a starter plan, choose a broker, and learn how to invest.
          </p>
        </button>
      </div>
    </div>
  );
}