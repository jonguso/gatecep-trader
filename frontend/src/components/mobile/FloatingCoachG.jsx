import { useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

export default function FloatingCoachG() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recommendedSymbol, setRecommendedSymbol] = useState(null);
  const [recommendedSide, setRecommendedSide] = useState(null);

  async function askCoachG(promptText = question) {
    try {
      setLoading(true);
      setAnswer("Coach G is analyzing...");
      setMeta(null);

const upperPrompt = String(promptText || "").toUpperCase();

if (upperPrompt.includes("SCOM") && data.recommendation === "BUY") {
  setRecommendedSymbol("SCOM");
  setRecommendedSide("BUY");
} else if (upperPrompt.includes("KCB") && data.recommendation === "BUY") {
  setRecommendedSymbol("KCB");
  setRecommendedSide("BUY");
} else {
  setRecommendedSymbol(null);
  setRecommendedSide(null);
}

      const res = await fetch(`${API_URL}/coach/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: promptText
        })
      });

      const data = await res.json();

      if (!data.ok) {
        setAnswer("Coach G could not analyze this request.");
        setMeta(null);
        return;
      }

      setAnswer(data.answer);
      setMeta({
        confidence: data.confidence,
        recommendation: data.recommendation
      });
    } catch (error) {
      setAnswer(error.message);
      setMeta(null);
    } finally {
      setLoading(false);
{recommendedSymbol && recommendedSide && (
  <a
    href={`/mobile/order/${recommendedSymbol}/${recommendedSide}`}
    className="block mt-3 text-center bg-green-600 hover:bg-green-500 rounded-xl py-3 font-bold"
  >
    Execute Recommendation
  </a>
)}
    }
  }

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
            <button
              onClick={() => askCoachG("Analyze SCOM risk")}
              className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-left"
            >
              Analyze SCOM risk
            </button>

            <button
              onClick={() => askCoachG("Best NSE stock today")}
              className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-left"
            >
              Best NSE stock today
            </button>

            <button
              onClick={() => askCoachG("Is market liquidity improving?")}
              className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-left"
            >
              Is market liquidity improving?
            </button>

            <button
              onClick={() => askCoachG("Check my portfolio exposure")}
              className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-left"
            >
              Check my portfolio exposure
            </button>

            <input
              value={question}
              onChange={(event) =>
                setQuestion(event.target.value)
              }
              placeholder="Ask Coach G..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm"
            />

            <button
              onClick={() => askCoachG()}
              disabled={loading}
              className="w-full bg-cyan-600 hover:bg-cyan-500 rounded-xl py-3 font-bold disabled:bg-slate-700"
            >
              {loading ? "Analyzing..." : "Ask AI"}
            </button>

            {answer && (
              <div className="bg-cyan-500/10 border border-cyan-500 rounded-xl p-3 text-sm text-slate-200 leading-6">
                {meta && (
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <span className="px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold">
                      {meta.confidence}% Confidence
                    </span>

                    <span className="px-2 py-1 rounded-full bg-slate-800 text-yellow-300 text-xs font-bold">
                      {meta.recommendation}
                    </span>
                  </div>
                )}

                {answer}
              </div>
            )}
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