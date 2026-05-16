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
  const [listening, setListening] = useState(false);

  async function askCoachG(promptText = question) {
    const finalQuestion = String(promptText || "").trim();

    if (!finalQuestion) {
      setAnswer("Ask Coach G a question first.");
      return;
    }

    try {
      setLoading(true);
      setAnswer("Coach G is analyzing...");
      setMeta(null);

      const res = await fetch(`${API_URL}/coach/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: finalQuestion
        })
      });

      const data = await res.json();

      if (!data.ok) {
        setAnswer(
          data.error ||
          "Coach G could not analyze this request."
        );
        return;
      }

      setAnswer(data.answer);
      speakCoachG(data.answer);
<button
  onClick={() => window.speechSynthesis?.cancel()}
  className="mt-3 w-full bg-slate-800 hover:bg-slate-700 rounded-xl py-2 text-xs text-cyan-300"
>
  Stop Voice
</button>

      setMeta({
  confidence: data.confidence,
  recommendation: data.recommendation,
  reasoning: data.reasoning || [],
  risks: data.risks || [],
  suggestedAllocation: data.suggestedAllocation || null
});
    } catch (error) {
      setAnswer(error.message);
    } finally {
      setLoading(false);
    }
  }

function speakCoachG(text) {
  if (!window.speechSynthesis || !text) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.92;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
}

  function startVoice() {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setAnswer(
        "Voice recognition is not supported in this browser. Try Chrome or Edge."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setListening(true);
    setAnswer("Listening... ask Coach G your question.");

    recognition.start();

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript;

      setQuestion(transcript);
      setListening(false);

      askCoachG(transcript);
    };

    recognition.onerror = (event) => {
      setListening(false);

      setAnswer(
        `Voice error: ${event.error}. Try again.`
      );
    };

    recognition.onend = () => {
      setListening(false);
    };
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
                NSE Trading Assistant
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
            {[
              "Should I buy SCOM today?",
              "Show safest NSE stocks",
              "Analyze my portfolio risk",
              "Best stock for tomorrow"
            ].map((text) => (
              <button
                key={text}
                onClick={() => {
                  setQuestion(text);
                  askCoachG(text);
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-left"
              >
                {text}
              </button>
            ))}

            <input
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              placeholder="Ask Coach G anything..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => askCoachG()}
                disabled={loading}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 rounded-xl py-3 font-bold"
              >
                {loading
                  ? "Analyzing..."
                  : "Ask Coach G"}
              </button>

              <button
                onClick={startVoice}
                className={`rounded-xl py-3 font-bold ${
                  listening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-slate-800 hover:bg-slate-700 text-cyan-300"
                }`}
              >
                {listening
                  ? "Listening..."
                  : "🎤 Voice"}
              </button>
            </div>

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
        className="fixed bottom-24 right-4 z-50 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-full shadow-2xl shadow-[0_0_30px_rgba(34,211,238,0.45)] w-16 h-16 flex items-center justify-center text-2xl font-bold border-4 border-cyan-300 animate-pulse"
      >
        G
      </button>
    </>
  );
}