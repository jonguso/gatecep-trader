import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

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
  const navigate = useNavigate();

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

  const [goalTarget, setGoalTarget] = useState(1000000);
  const [monthlyContribution, setMonthlyContribution] = useState(10000);
  const [goalProjection, setGoalProjection] = useState(null);
  const [stressTest, setStressTest] = useState(null);

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

  async function generatePlan() {
    try {
      setLoading(true);

      const derivedRisk = calculateRisk();

      const query = new URLSearchParams({
        goal: answers.goal,
        risk: derivedRisk,
        amount: String(answers.amount),
        experience: answers.experience,
        timeHorizon: answers.timeHorizon,
        contribution: answers.contribution
      });

      const res = await fetch(`${API_URL}/generate-portfolio?${query}`);
      const data = await res.json();

      setResult({
        ...data,
        derivedRisk
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
    setGoalProjection(null);
    setStressTest(null);

    setAnswers({
      goal: null,
      timeHorizon: null,
      marketDrop: null,
      contribution: null,
      experience: null,
      amount: 10000
    });
  }

  async function calculateGoalTimeline() {
    const profileReturn =
      result.profile?.risk === "aggressive"
        ? 12
        : result.profile?.risk === "conservative"
        ? 7
        : 10;

    const query = new URLSearchParams({
      target: String(goalTarget),
      current: String(result.recommendation?.totalInvested || 0),
      monthly: String(monthlyContribution),
      return: String(profileReturn)
    });

    const res = await fetch(`${API_URL}/goal-tracker?${query}`);
    const data = await res.json();

    setGoalProjection(data);
  }

  async function runStressTest() {
    const query = new URLSearchParams({
      portfolio: String(result.recommendation?.totalInvested || 0),
      risk: result.profile?.risk || result.derivedRisk || "balanced",
      goal: result.profile?.goal || answers.goal || "balanced_growth"
    });

    const res = await fetch(`${API_URL}/stress-test?${query}`);
    const data = await res.json();

    setStressTest(data);
  }

  function openBrokerEnrollment() {
    navigate("/mobile/broker-link", {
      state: {
        source: "NEW_INVESTOR",
        recommendedBroker: result.brokerComparison?.[0],
        customerProfile: result.profile,
        recommendation: result.recommendation,
        confidence: result.confidence
      }
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
          <span>Progress</span>
          <span>
            {Math.min(step + 1, questions.length + 1)} of{" "}
            {questions.length + 1}
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
                onClick={() => selectAnswer(currentQuestion.field, value)}
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
                value={result.profile?.investorType}
                color="text-cyan-300"
              />

              <ResultCard
                label="Risk"
                value={result.profile?.risk || result.derivedRisk}
                color="text-purple-300"
              />

              <ResultCard
                label="Confidence"
                value={`${result.confidence || 0}/100`}
                color="text-green-300"
              />

              <ResultCard
                label="Cash Reserve"
                value={`${result.profile?.constraints?.cashReserve || 0}%`}
                color="text-yellow-300"
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="font-bold text-cyan-300">
              Broker Comparison
            </div>

            <p className="text-sm text-slate-400 mt-2">
              Coach G ranks brokers based on your profile, experience, and goal.
            </p>

            <div className="mt-4 space-y-3">
              {result.brokerComparison?.map((broker, index) => (
                <div
                  key={broker.name}
                  className={
                    index === 0
                      ? "bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4"
                      : "bg-slate-950 border border-slate-800 rounded-2xl p-4"
                  }
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-lg">
                        {broker.name}
                      </div>

                      <div className="text-xs text-slate-400">
                        {broker.bestFor}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-cyan-300">
                        {broker.score}/100
                      </div>

                      {index === 0 && (
                        <div className="text-xs text-purple-300">
                          Recommended
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-slate-300">
                    {broker.strengths?.map((strength) => (
                      <div key={strength}>
                        ✓ {strength}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
            <div className="font-bold text-green-300">
              Next Steps
            </div>

            <div className="space-y-3 mt-4">
              <button
                onClick={openBrokerEnrollment}
                className="w-full bg-green-600 rounded-2xl p-4 font-bold"
              >
                Open Recommended Broker Account
              </button>

              <button className="w-full bg-slate-800 rounded-2xl p-4 font-bold">
                Compare Broker Fees
              </button>

              <button className="w-full bg-slate-800 rounded-2xl p-4 font-bold">
                Learn How Investing Works
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="font-bold text-cyan-300 mb-4">
              Projected Portfolio Summary
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Info
                label="Total Invested"
                value={`KES ${money(result.recommendation?.totalInvested)}`}
              />

              <Info
                label="Cash Reserve"
                value={`KES ${money(result.recommendation?.cash)}`}
                valueClass="text-yellow-300"
              />

              <Info
                label="Expected Income"
                value={`KES ${money(
                  result.recommendation?.totalExpectedAnnualDividend
                )}`}
                valueClass="text-green-300"
              />

              <Info
                label="Confidence"
                value={`${result.confidence || 0}/100`}
                valueClass="text-cyan-300"
              />
            </div>

            <div className="mt-5 w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-cyan-400 h-3 rounded-full transition-all duration-700"
                style={{
                  width: `${result.confidence || 0}%`
                }}
              />
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4">
            <div className="font-bold text-purple-300 mb-4">
              Coach G Projection
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="font-bold text-cyan-300">
                Goal Tracker
              </div>

              <input
                type="number"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
                placeholder="Goal Amount"
                className="w-full mt-4 bg-slate-950 rounded-xl p-3"
              />

              <input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                placeholder="Monthly Contribution"
                className="w-full mt-3 bg-slate-950 rounded-xl p-3"
              />

              <button
                onClick={calculateGoalTimeline}
                className="w-full bg-cyan-600 rounded-2xl p-4 mt-4 font-bold"
              >
                Calculate Goal Timeline
              </button>

              {goalProjection && (
                <div className="mt-5 space-y-2">
                  <div>
                    Goal Timeline:{" "}
                    <span className="font-bold text-cyan-300">
                      {goalProjection.projectedYears} years
                    </span>
                  </div>

                  <div>
                    Projected Balance: KES {money(goalProjection.finalBalance)}
                  </div>

                  {goalProjection.message && (
                    <div className="text-xs text-slate-400">
                      {goalProjection.message}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Info
                label="Monthly Income"
                value={`KES ${money(
                  (result.recommendation?.totalExpectedAnnualDividend || 0) /
                    12
                )}`}
                valueClass="text-green-300"
              />

              <Info
                label="5 Year Projection"
                value={`KES ${money(
                  (result.recommendation?.totalInvested || 0) * 1.65
                )}`}
                valueClass="text-cyan-300"
              />

              <Info
                label="Cash Buffer"
                value={`${(
                  ((result.recommendation?.cash || 0) /
                    (result.recommendation?.amount || 1)) *
                  100
                ).toFixed(1)}%`}
                valueClass="text-yellow-300"
              />

              <Info
                label="Portfolio Size"
                value={`${
                  result.recommendation?.portfolio?.length || 0
                } Holdings`}
              />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="font-bold text-red-300">
              Portfolio Stress Test
            </div>

            <button
              onClick={runStressTest}
              className="w-full bg-red-600 rounded-2xl p-4 mt-4 font-bold"
            >
              Run Stress Test
            </button>

            {stressTest && (
              <div className="space-y-3 mt-5">
                {stressTest.scenarios?.map((scenario) => (
                  <div
                    key={scenario.name}
                    className="bg-slate-950 rounded-xl p-4"
                  >
                    <div className="font-bold">
                      {scenario.name}
                    </div>

                    <div>
                      {scenario.change}%
                    </div>

                    <div>
                      KES {money(scenario.value)}
                    </div>

                    {scenario.description && (
                      <div className="text-xs text-slate-400 mt-1">
                        {scenario.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <p className="text-sm text-slate-400 mt-4">
              Coach G estimates this portfolio may grow over time, but future
              performance is never guaranteed.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="font-bold text-cyan-300">
              Recommended Portfolio
            </div>

            {result.recommendation?.portfolio?.map((item) => (
              <div
                key={item.symbol}
                className="border-b border-slate-800 py-4"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold">
                      {item.symbol}
                    </div>

                    <div className="text-xs text-slate-400">
                      {item.name}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-cyan-300">
                      {item.shares} shares
                    </div>

                    <div className="text-xs text-slate-400">
                      KES {money(item.investedValue)}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 mt-2">
                  {item.reason}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="font-bold text-cyan-300 mb-4">
              Projected Sector Allocation
            </div>

            {result.recommendation?.sectorAllocation?.map((sector) => (
              <div
                key={sector.sector}
                className="flex justify-between py-2 border-b border-slate-800"
              >
                <div>{sector.sector}</div>

                <div>
                  {sector.weight}% (KES {money(sector.value)})
                </div>
              </div>
            ))}
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
            <div className="font-bold text-green-300">
              Expected Annual Income
            </div>

            <div className="text-2xl font-bold mt-2">
              KES {money(result.recommendation?.totalExpectedAnnualDividend)}
            </div>
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4">
            <div className="font-bold text-cyan-300">
              Why Coach G chose this
            </div>

            <div className="space-y-2 mt-3 text-sm text-slate-300">
              {result.explanation?.map((item, index) => (
                <div key={index}>
                  ✓ {item}
                </div>
              ))}
            </div>
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
      <div className="text-xs text-slate-400">
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