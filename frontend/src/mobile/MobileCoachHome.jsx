
import AIConfidenceRing from "../components/mobile/AIConfidenceRing";
import { useEffect, useState } from "react";
import MobileBuyingPowerBar from "./MobileBuyingPowerBar";
import MobileBottomNav from "../components/mobile/MobileBottomNav";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

function signalStyle(recommendation = "") {
  if (recommendation.includes("STRONG")) {
    return "bg-cyan-500/20 border-cyan-400 text-cyan-300";
  }

  if (recommendation.includes("BUY")) {
    return "bg-green-500/20 border-green-400 text-green-300";
  }

  if (recommendation.includes("SELL")) {
    return "bg-red-500/20 border-red-400 text-red-300";
  }

  return "bg-yellow-500/20 border-yellow-400 text-yellow-300";
}

function confidenceColor(confidence) {
  if (confidence >= 90) return "bg-cyan-400";
  if (confidence >= 75) return "bg-green-400";
  if (confidence >= 60) return "bg-yellow-400";
  return "bg-red-400";
}

function marketPrice(item) {
  return Number(
    item.price ||
      item.lastPrice ||
      item.currentPrice ||
      18.45
  ).toFixed(2);
}

function aiReason(signal) {
  const recommendation = signal.recommendation || "";
  const confidence = Number(signal.confidence || 0);

  if (recommendation.includes("BUY") && confidence >= 90) {
    return "Coach G sees strong momentum, improving liquidity, and favorable execution conditions.";
  }

  if (recommendation.includes("BUY")) {
    return "Upside opportunity detected, but position sizing should remain controlled.";
  }

  if (recommendation.includes("SELL")) {
    return "Risk is elevated. Coach G detects weakening momentum or unfavorable market conditions.";
  }

  return "Hold for now. Coach G recommends waiting for a cleaner entry or stronger confirmation.";
}

export default function MobileCoachHome() {
  const [signals, setSignals] = useState([]);
  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [listening, setListening] = useState(false);

  async function loadSignals() {
    try {
      const res = await fetch(`${API_URL}/ai/signals`);
      const data = await res.json();

      if (data.ok) {
        setSignals(data.signals || []);
      }
    } catch (error) {
      console.error("Failed to load Coach G signals:", error);
    }
  }

  function askCoachG() {
    const text = question.toUpperCase();

    if (text.includes("SCOM")) {
      setAiAnswer(
        "Coach G: SCOM looks stable with strong liquidity and low spread risk. Consider a small BUY only if your portfolio is not already overexposed to telecoms."
      );
      return;
    }

    if (text.includes("KCB")) {
      setAiAnswer(
        "Coach G: KCB has moderate momentum. HOLD for now unless price breaks above resistance with stronger volume."
      );
      return;
    }

    setAiAnswer(
      "Coach G: I recommend checking liquidity, spread, confidence score, and portfolio concentration before executing any trade."
    );
  }

  useEffect(() => {
    loadSignals();

    const interval = setInterval(loadSignals, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-950 min-h-screen text-white pb-24">
      <MobileBuyingPowerBar />

      <div className="p-4">
        <h1 className="text-3xl font-bold">
          Coach G
        </h1>

        <p className="text-slate-400 text-sm mt-1">
          AI-guided NSE trading assistant
        </p>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800">
            <div className="text-xs text-slate-400">
              NSE Pulse
            </div>

            <div className="text-lg font-bold text-green-400">
              Bullish
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800">
            <div className="text-xs text-slate-400">
              Volume
            </div>

            <div className="text-lg font-bold text-cyan-400">
              Rising
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800">
            <div className="text-xs text-slate-400">
              Risk
            </div>

            <div className="text-lg font-bold text-yellow-400">
              Medium
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-4 mt-5 border border-slate-800">
          <div className="text-sm text-slate-400 mb-2">
            Ask Coach G
          </div>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Should I buy SCOM today?"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white h-24"
          />

          <button
            onClick={askCoachG}
            className="w-full mt-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl py-3 font-bold"
          >
            Ask AI
          </button>

          {aiAnswer && (
            <div className="mt-4 bg-cyan-500/10 border border-cyan-500 rounded-2xl p-4">
              <div className="text-cyan-400 font-bold mb-2">
                Coach G Answer
              </div>

              <div className="text-sm text-slate-200 leading-6">
                {aiAnswer}
              </div>
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold mt-6 mb-3">
          AI Watchlist
        </h2>

        <div className="space-y-4">
          {signals.slice(0, 5).map((item) => {
            const confidence = Number(item.confidence || 0);

            return (
              <div
                key={item.symbol}
                className="bg-slate-900 rounded-2xl p-4 border border-slate-800"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <div className="text-2xl font-bold">
                      {item.symbol}
                    </div>

                    <div className="text-slate-400 text-sm">
                      AI confidence {confidence}%
                    </div>
                  </div>

                  <div
                    className={`px-3 py-1 rounded-full border text-xs font-bold h-fit ${signalStyle(
                      item.recommendation
                    )}`}
                  >
                    {item.recommendation}
                  </div>
                </div>

                <div className="mt-3 text-sm text-slate-300 leading-6">
                  {aiReason(item)}
                </div>

                <div className="mt-4 flex justify-center">
  <AIConfidenceRing
    value={confidence}
    size={100}
  />
</div>

                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${confidenceColor(
                        confidence
                      )}`}
                      style={{
                        width: `${confidence}%`
                      }}
                    />
                  </div>
                

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="bg-slate-800 rounded-xl p-2">
                    <div className="text-xs text-slate-400">
                      Price
                    </div>

                    <div className="font-bold text-cyan-300">
                      KES {marketPrice(item)}
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-2">
                    <div className="text-xs text-slate-400">
                      Change
                    </div>

                    <div
                      className={
                        Number(item.changePct || 0) >= 0
                          ? "font-bold text-green-400"
                          : "font-bold text-red-400"
                      }
                    >
                      {Number(item.changePct || 2.4) >= 0
                        ? "+"
                        : ""}
                      {Number(item.changePct || 2.4).toFixed(2)}%
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-2">
                    <div className="text-xs text-slate-400">
                      Volume
                    </div>

                    <div className="font-bold text-purple-300">
                      {Number(item.volume || 0) > 100000
                        ? "High"
                        : "Normal"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-cyan-400 text-xs border border-slate-700">
                  Live AI Momentum Chart
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4">
                  <a
                    href={`/mobile/stock/${item.symbol}`}
                    className="text-center bg-slate-800 rounded-xl py-3 font-bold"
                  >
                    View
                  </a>

                  <button
                    onClick={() => setListening(!listening)}
                    className={`rounded-xl py-3 font-bold ${
                      listening
                        ? "bg-red-500 text-white animate-pulse"
                        : "bg-slate-800 hover:bg-slate-700 text-cyan-300"
                    }`}
                  >
                    {listening ? "Listening..." : "🎤 Voice"}
                  </button>

                  <a
                    href={`/mobile/order/${item.symbol}/BUY`}
                    className="text-center bg-green-600 rounded-xl py-3 font-bold"
                  >
                    Buy
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <FloatingCoachG />
      <MobileBottomNav />
    </div>
  );
}

function FloatingCoachG() {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);

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
                NSE Trading Assistant
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="text-white text-sm"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-3">
            {listening && (
              <div className="bg-cyan-500/10 border border-cyan-500 rounded-2xl p-4">
                <div className="font-bold text-cyan-300">
                  Coach G Listening
                </div>

                <div className="text-xs text-slate-400 mt-1">
                  Try saying: “Should I buy KCB?”
                </div>
              </div>
            )}

            <button className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-left">
              Should I buy SCOM today?
            </button>

            <button className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-left">
              Show safest NSE stocks
            </button>

            <button className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-left">
              Analyze my portfolio risk
            </button>

            <button className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-left">
              Best stock for tomorrow
            </button>

            <input
              placeholder="Ask Coach G anything..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm"
            />

            <div className="grid grid-cols-2 gap-2">
              <button className="bg-cyan-600 hover:bg-cyan-500 rounded-xl py-3 font-bold">
                Ask Coach G
              </button>

              <button
                onClick={() => setListening(!listening)}
                className={`rounded-xl py-3 font-bold ${
                  listening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-slate-800 hover:bg-slate-700 text-cyan-300"
                }`}
              >
                {listening ? "Listening..." : "🎤 Voice"}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 right-4 z-50 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-full shadow-2xl w-16 h-16 flex items-center justify-center text-2xl font-bold border-4 border-cyan-300"
      >
        G
      </button>
    </>
  );
}

