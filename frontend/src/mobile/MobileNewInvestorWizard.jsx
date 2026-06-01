import { useState } from "react";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

const questions = [
  {
    title: "Why are you investing?",
    subtitle: "Coach G will use this to understand your main goal.",
    field: "goal",
    options: [
      ["wealth_growth", "Grow Wealth"],
      ["dividend", "Earn Passive Income"],
      ["purchase", "Save for Future Purchase"],
      ["retirement", "Retirement"],
      ["balanced_growth", "Not Sure"]
    ]
  },
  {
    title: "How long can this money stay invested?",
    subtitle: "Longer time horizons usually allow more market risk.",
    field: "timeHorizon",
    options: [
      ["under_1_year", "Less than 1 year"],
      ["1_3_years", "1 - 3 years"],
      ["3_5_years", "3 - 5 years"],
      ["5_plus_years", "5+ years"]
    ]
  },
  {
    title: "If your investment dropped 20%, what would you do?",
    subtitle: "This helps Coach G estimate your real risk tolerance.",
    field: "marketDrop",
    options: [
      ["sell", "Sell immediately"],
      ["wait", "Wait and watch"],
      ["buy_more", "Buy more"],
      ["unsure", "I am not sure"]
    ]
  },
  {
    title: "How often do you plan to invest?",
    subtitle: "Consistent investing can reduce timing risk.",
    field: "contribution",
    options: [
      ["one_time", "One time"],
      ["monthly", "Monthly"],
      ["quarterly", "Quarterly"],
      ["flexible", "Whenever possible"]
    ]
  },
  {
    title: "How much investing experience do you have?",
    subtitle: "Coach G will adjust recommendations to your experience level.",
    field: "experience",
    options: [
      ["none", "None"],
      ["beginner", "Beginner"],
      ["some", "Some experience"],
      ["advanced", "Advanced"]
    ]
  }
];

export default function MobileNewInvestorWizard() {
  const [step, setStep] = useState(0);

  const [answers, setAnswers] = useState({
    goal: null,
    timeHorizon: null,
    marketDrop: null,
    contribution: null,
    experience: null,
    amount: 10000
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [basketDetails,
setBasketDetails]=
useState(null);

  const currentQuestion = questions[step];

  function selectAnswer(field, value) {
    setAnswers((current) => ({
      ...current,
      [field]: value
    }));

    setStep((current) => current + 1);
  }

  function calculateRisk() {
    let score = 0;

    if (answers.marketDrop === "buy_more") score += 35;
    if (answers.marketDrop === "wait") score += 20;
    if (answers.marketDrop === "unsure") score += 12;
    if (answers.marketDrop === "sell") score += 5;

    if (answers.timeHorizon === "5_plus_years") score += 25;
    if (answers.timeHorizon === "3_5_years") score += 18;
    if (answers.timeHorizon === "1_3_years") score += 10;
    if (answers.timeHorizon === "under_1_year") score += 4;

    if (answers.experience === "advanced") score += 20;
    if (answers.experience === "some") score += 12;
    if (answers.experience === "beginner") score += 7;
    if (answers.experience === "none") score += 3;

    if (answers.contribution === "monthly") score += 10;
    if (answers.contribution === "quarterly") score += 7;
    if (answers.contribution === "flexible") score += 5;

    if (score <= 30) return "conservative";
    if (score <= 65) return "balanced";
    return "aggressive";
  }

  function investorType() {
    if (answers.goal === "dividend") return "Income Builder";
    if (answers.goal === "retirement") return "Long-Term Builder";
    if (answers.goal === "purchase") return "Goal Saver";
    if (calculateRisk() === "aggressive") return "Growth Seeker";
    return "Balanced Builder";
  }

  async function generatePlan() {
    try {
      setLoading(true);

      const derivedRisk = calculateRisk();

      const res = await fetch(
        `${API_URL}/new-investor-plan?goal=${answers.goal}&risk=${derivedRisk}&amount=${answers.amount}&experience=${answers.experience}&timeHorizon=${answers.timeHorizon}`
      );

      const data = await res.json();

      setResult({
        ...data,
        derivedRisk,
        investorType: investorType()
      });
    } catch (error) {
      setResult({
        ok: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  }

  function restart() {
    setStep(0);
    setResult(null);
    setAnswers({
      goal: null,
      timeHorizon: null,
      marketDrop: null,
      contribution: null,
      experience: null,
      amount: 10000
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-24">
      <h1 className="text-2xl font-bold">
        Coach G New Investor Wizard
      </h1>

      <p className="text-sm text-slate-400 mt-2">
        Answer a few simple questions. Coach G will estimate your risk profile,
        recommend a broker, and build a starter plan.
      </p>

      <div className="mt-5 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex justify-between text-xs text-slate-400">
          <span>
            Progress
          </span>

          <span>
            {Math.min(step + 1, questions.length + 1)} of {questions.length + 1}
          </span>
        </div>

        <div className="w-full bg-slate-800 rounded-full h-2 mt-3">
          <div
            className="bg-purple-500 h-2 rounded-full"
            style={{
              width: `${Math.min(
                ((step + 1) / (questions.length + 1)) * 100,
                100
              )}%`
            }}
          />
        </div>
      </div>

      {!result && step < questions.length && (
        <div className="mt-6">
          <h2 className="text-xl font-bold">
            {currentQuestion.title}
          </h2>

          <p className="text-sm text-slate-400 mt-2">
            {currentQuestion.subtitle}
          </p>

          <div className="space-y-3 mt-6">
            {currentQuestion.options.map(([value, label]) => (
              <button
                key={value}
                onClick={() =>
                  selectAnswer(currentQuestion.field, value)
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left active:scale-[0.98] transition"
              >
                <div className="font-bold">
                  {label}
                </div>
              </button>
            ))}
          </div>

          {step > 0 && (
            <button
              onClick={() => setStep((current) => Math.max(current - 1, 0))}
              className="w-full bg-slate-800 rounded-2xl p-4 mt-5 font-bold"
            >
              Back
            </button>
          )}
        </div>
      )}

      {!result && step === questions.length && (
        <div className="mt-6">
          <h2 className="text-xl font-bold">
            How much are you starting with?
          </h2>

          <p className="text-sm text-slate-400 mt-2">
            Enter the amount you want Coach G to use for your starter plan.
          </p>

          <div className="mt-5">
            <label className="text-sm text-slate-400">
              Starting Amount
            </label>

            <input
              type="number"
              value={answers.amount}
              onChange={(event) =>
                setAnswers((current) => ({
                  ...current,
                  amount: event.target.value
                }))
              }
              className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl p-4"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            {[10000, 50000, 100000].map((value) => (
              <button
                key={value}
                onClick={() =>
                  setAnswers((current) => ({
                    ...current,
                    amount: value
                  }))
                }
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm"
              >
                KES {Number(value).toLocaleString()}
              </button>
            ))}
          </div>

          <button
            onClick={generatePlan}
            disabled={loading}
            className="w-full bg-purple-600 rounded-2xl p-4 font-bold mt-6 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Coach G Profile"}
          </button>

          <button
            onClick={() => setStep((current) => Math.max(current - 1, 0))}
            className="w-full bg-slate-800 rounded-2xl p-4 mt-3 font-bold"
          >
            Back
          </button>

           <button

onClick={async()=>{

const res=
await fetch(

`${API_URL}/starter-basket/
${item.bucket
.toLowerCase()
.replace(
" ",
"-"
)
}?amount=
${item.amount}`

);

const data=
await res.json();

setBasketDetails(data);

}}

className="
mt-3
text-cyan-300
text-sm
font-bold
"

>

</button>       

        </div>
      )}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4">
            <div className="font-bold text-purple-300">
              Coach G Profile
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <ResultCard
                label="Investor Type"
                value={result.investorType || "N/A"}
                color="text-cyan-300"
              />

              <ResultCard
                label="Risk Profile"
                value={result.derivedRisk || "N/A"}
                color="text-purple-300"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="font-bold text-cyan-300">
              Recommended Broker
            </div>

            <div className="text-2xl font-bold mt-2">
              {result.recommendedBroker?.name || "N/A"}
            </div>

            <div className="text-cyan-300 font-bold mt-1">
              Broker Score: {result.recommendedBroker?.score || 0}/100
            </div>

            <p className="text-sm text-slate-300 mt-2">
              {result.recommendedBroker?.reason}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
  <div className="font-bold text-cyan-300">
    Starter Portfolio
  </div>

  {result.starterPortfolio?.map((item) => (
    <div
      key={item.bucket}
      className="border-b border-slate-800 py-3 text-sm"
    >
      <div className="flex justify-between">
        <span>{item.bucket}</span>

        <span className="font-bold">
          {item.weight}% • KES {money(item.amount)}
        </span>
      </div>

      <button
        onClick={async () => {
          const basketSlug = item.bucket
            .toLowerCase()
            .replaceAll(" ", "-")
            .replaceAll("/", "-");

          const res = await fetch(
            `${API_URL}/starter-basket/${basketSlug}?amount=${item.amount}`
          );

          const data = await res.json();

          setBasketDetails(data);
        }}
        className="mt-3 text-cyan-300 text-sm font-bold"
      >
        View Basket
      </button>
    </div>
  ))}
</div>

{basketDetails && (
  <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center overflow-y-auto pt-8 pb-8">
    <div className="bg-slate-950 border border-cyan-500/40 rounded-3xl p-5 w-full max-w-xl mx-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-cyan-300 capitalize">
            {basketDetails.basket?.replaceAll("-", " ")}
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Allocation: KES {money(basketDetails.amount)}
          </p>
        </div>

        <button
          onClick={() => setBasketDetails(null)}
          className="text-slate-400"
        >
          Close
        </button>
      </div>

      <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mt-4">
        <div className="text-sm text-slate-400">
          Estimated Annual Dividend
        </div>

        <div className="text-2xl font-bold text-green-300">
          KES {money(basketDetails.totalExpectedAnnualDividend)}
        </div>
      </div>

      <div className="space-y-3 mt-5">
        <div className="text-sm text-slate-400 font-bold">
          Holdings ({basketDetails.count} securities)
        </div>

        {basketDetails.holdings?.map((holding) => (
          <div
            key={holding.symbol}
            className="bg-slate-900 rounded-2xl p-4 border border-slate-800"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold text-lg">
                  {holding.symbol}
                </div>

                <div className="text-sm text-slate-400">
                  {holding.name}
                </div>
              </div>

              <div className="text-right">
                <div className="font-bold text-cyan-300">
                  {holding.shares} shares
                </div>

                <div className="text-sm text-slate-400">
                  KES {money(holding.investedValue)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-2xl p-5 mt-5 border border-slate-800">
        <div className="grid grid-cols-3 text-center gap-3">
          <div>
            <div className="text-xs text-slate-400">
              Invested
            </div>

            <div className="font-bold text-cyan-300">
              KES {money(basketDetails.totalInvested)}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400">
              Unused Cash
            </div>

            <div className="font-bold text-yellow-300">
              KES {money(basketDetails.unusedCash)}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400">
              Allocation
            </div>

            <div className="font-bold text-white">
              KES {money(basketDetails.amount)}
            </div>
          </div>
        </div>
      </div>

      {Number(basketDetails.unusedCash || 0) > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mt-4">
          <div className="font-bold text-yellow-300">
            Unused Cash
          </div>

          <div className="text-xl font-bold mt-1">
            KES {money(basketDetails.unusedCash)}
          </div>

          <p className="text-sm text-slate-300 mt-2">
            {basketDetails.advice}
          </p>
        </div>
      )}

      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4 mt-4 text-sm text-slate-300">
        Coach G selected these securities because they fit this basket’s purpose
        and the available amount. Any amount that cannot buy full shares stays
        in Cash.
      </div>
    </div>
  </div>
)}

            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4">
            <div className="font-bold text-cyan-300">
              Coach G Advice
            </div>

            <p className="text-sm text-slate-300 mt-2">
              {result.advice ||
                "Start slowly, diversify, and review your portfolio regularly."}
            </p>
          </div>

          <button
            onClick={restart}
            className="w-full bg-slate-800 rounded-2xl p-4 font-bold"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}

function ResultCard({ label, value, color }) {
  return (
    <div className="bg-slate-950 rounded-xl p-3">
      <div className="text-xs text-slate-400">
        {label}
      </div>

      <div className={`${color} font-bold mt-1 capitalize`}>
        {value}
      </div>
    </div>
  );
}

function Info({ label, value, valueClass = "text-white" }) {
  return (
    <div className="bg-slate-950 rounded-xl p-3">
      <div className="text-slate-400">
        {label}
      </div>

      <div className={`${valueClass} font-bold mt-1`}>
        {value}
      </div>
    </div>
  );
}

function money(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}