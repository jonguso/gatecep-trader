import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function MobileBrokerMirrorHome() {
  const navigate = useNavigate();

  const brokerLink = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("gatecepBrokerLink") || "{}"
      );
    } catch {
      return {};
    }
  }, []);

  const hasBrokerLink =
    brokerLink?.broker &&
    brokerLink?.clientNumber &&
    brokerLink?.cdsNumber;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-24">
      <h1 className="text-2xl font-bold">
        Welcome to Gatecep
      </h1>

      <p className="text-sm text-slate-400 mt-2">
        Link your broker, upload your reports, and Coach G will analyze your
        portfolio, risk, sectors, and future investment plan.
      </p>

      {hasBrokerLink ? (
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 mt-5">
          <div className="font-bold text-cyan-300">
            Linked Broker
          </div>

          <p className="text-sm text-slate-300 mt-2">
            Broker: {brokerLink.broker}
          </p>

          <p className="text-sm text-slate-300">
            Client Number: {brokerLink.clientNumber}
          </p>

          <p className="text-sm text-slate-300">
            CDS Number: {brokerLink.cdsNumber}
          </p>
        </div>
      ) : (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mt-5">
          <div className="font-bold text-yellow-300">
            Broker Link Required
          </div>

          <p className="text-sm text-slate-300 mt-2">
            Link your broker first so Gatecep can connect uploads to the right
            investor profile.
          </p>

          <button
            onClick={() => navigate("/mobile/broker-link")}
            className="w-full bg-yellow-600 rounded-2xl p-3 font-bold mt-4"
          >
            Link Broker
          </button>
        </div>
      )}

      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 mt-5">
        <div className="font-bold text-cyan-300">
          Step 1: Link Broker
        </div>

        <p className="text-sm text-slate-300 mt-2">
          Enter broker, client number, and CDS number.
        </p>
      </div>

      <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 mt-3">
        <div className="font-bold text-purple-300">
          Step 2: Upload Broker Reports
        </div>

        <p className="text-sm text-slate-300 mt-2">
          Upload valuation, holdings, transaction, or cash reports.
        </p>
      </div>

      <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mt-3">
        <div className="font-bold text-green-300">
          Step 3: Review Coach G Analysis
        </div>

        <p className="text-sm text-slate-300 mt-2">
          Coach G checks concentration, sector exposure, cash position, and
          profile alignment.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mt-3">
        <div className="font-bold text-slate-200">
          Step 4: Simulate Future Investment
        </div>

        <p className="text-sm text-slate-300 mt-2">
          Enter an amount and Coach G recommends how new capital could improve
          your portfolio. Gatecep remains advisory only.
        </p>
      </div>

      <button
        onClick={() =>
          navigate(
            hasBrokerLink
              ? "/mobile/broker-upload"
              : "/mobile/broker-link"
          )
        }
        className="w-full bg-purple-600 rounded-2xl p-4 font-bold mt-6"
      >
        {hasBrokerLink ? "Start Upload" : "Link Broker First"}
      </button>

      <button
        onClick={() => navigate("/mobile/broker-rebalance")}
        disabled={!hasBrokerLink}
        className="w-full bg-slate-800 rounded-2xl p-4 font-bold mt-3 disabled:opacity-50"
      >
        View Portfolio Analysis
      </button>
    </div>
  );
}