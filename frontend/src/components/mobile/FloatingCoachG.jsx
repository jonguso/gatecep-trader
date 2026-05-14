import { useState } from "react";

export default function FloatingCoachG() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 w-80 bg-slate-900 border border-cyan-500 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="bg-cyan-600 px-4 py-3 flex justify-between items-center">
            <div>
              <div className="font-bold">
                Coach G AI
              </div>

              <div className="text-xs text-cyan-100">
                Live NSE Assistant
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="text-white"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-3">

            <button className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-left">
              Analyze SCOM risk
            </button>

            <button className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-left">
              Best NSE stock today
            </button>

            <button className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-left">
              Is market liquidity improving?
            </button>

            <button className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-left">
              Check my portfolio exposure
            </button>

            <input
              placeholder="Ask Coach G..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm"
            />

            <button className="w-full bg-cyan-600 hover:bg-cyan-500 rounded-xl py-3 font-bold">
              Ask AI
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 right-4 z-50 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-full shadow-2xl w-16 h-16 flex items-center justify-center text-2xl font-bold border-4 border-cyan-300 animate-pulse"
      >
        G
      </button>
    </>
  );
}