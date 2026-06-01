import express from "express";

const router = express.Router();

router.get("/", (req, res) => {

  const portfolio =
    Number(req.query.portfolio || 0);

  const risk =
    String(
      req.query.risk || "balanced"
    );

  const goal =
    String(
      req.query.goal || ""
    );

  let crashPct = -15;
  let expectedPct = 12;
  let bullPct = 30;

  if (risk === "conservative") {

    crashPct = -8;
    expectedPct = 8;
    bullPct = 18;

  }

  if (risk === "aggressive") {

    crashPct = -25;
    expectedPct = 18;
    bullPct = 45;

  }

  if (goal === "dividend") {

    expectedPct -= 2;

  }

  const scenarios = [

    {
      name: "Market Crash",

      change: crashPct,

      value: calculate(
        portfolio,
        crashPct
      ),

      description:
        "Stress scenario for major downside movement."
    },

    {
      name: "Expected Growth",

      change: expectedPct,

      value: calculate(
        portfolio,
        expectedPct
      ),

      description:
        "Expected long-term portfolio outcome."
    },

    {
      name: "Bull Market",

      change: bullPct,

      value: calculate(
        portfolio,
        bullPct
      ),

      description:
        "Optimistic market scenario."
    }

  ];

  res.json({

    ok: true,

    portfolio,

    risk,

    goal,

    scenarios,

    generatedAt:
      new Date().toISOString()

  });

});

function calculate(
  portfolio,
  change
) {

  return Number(
    (
      portfolio *
      (1 + change / 100)
    ).toFixed(2)
  );

}

export default router;