import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {

    const {
      goal = "balanced_growth",
      risk = "balanced",
      amount = 10000,
      experience = "beginner",
      timeHorizon = "3_5_years"
    } = req.query;

    const investmentAmount =
      Number(amount || 0);

    const brokers = [
      {
        name: "AIB",
        beginner: 9,
        research: 9,
        fees: 8,
        active: 7
      },
      {
        name: "ABC",
        beginner: 8,
        research: 7,
        fees: 8,
        active: 9
      }
    ];

    function scoreBroker(broker){

      let score = 50;

      score += broker.beginner;

      score += broker.research;

      score += broker.fees;

      if(
        risk==="aggressive"
      ){
        score += broker.active;
      }

      if(
        experience==="beginner"
      ){
        score += broker.beginner;
      }

      return score;
    }

    const ranked =
      brokers
      .map(b=>({

        ...b,

        score:
          scoreBroker(b)

      }))
      .sort(
        (a,b)=>
          b.score-a.score
      );

    const broker =
      ranked[0];

    let starterPortfolio=[];

    if(goal==="dividend"){

      starterPortfolio=[

        {
          bucket:"Dividend Basket",
          weight:40
        },

        {
          bucket:"Banking",
          weight:25
        },

        {
          bucket:"ETF",
          weight:20
        },

        {
          bucket:"Cash",
          weight:15
        }

      ];

    } else if(risk==="aggressive"){

      starterPortfolio=[

        {
          bucket:"Growth Stocks",
          weight:45
        },

        {
          bucket:"ETF",
          weight:20
        },

        {
          bucket:"Banking",
          weight:20
        },

        {
          bucket:"Cash",
          weight:15
        }

      ];

    } else {

      starterPortfolio=[

        {
          bucket:"ETF",
          weight:30
        },

        {
          bucket:"Banking",
          weight:25
        },

        {
          bucket:"Dividend Basket",
          weight:25
        },

        {
          bucket:"Cash",
          weight:20
        }

      ];

    }

    starterPortfolio =
      starterPortfolio.map(
        x=>({

          ...x,

          amount:

          (
            investmentAmount *
            x.weight
          )/100

        })
      );

    res.json({

      ok:true,

      recommendedBroker:{

        name:
          broker.name,

        score:
          broker.score,

        reason:

        `${broker.name} best matches your risk profile and experience.`

      },

      starterPortfolio,

      advice:

      `Based on ${risk} risk and ${goal}, begin slowly and invest consistently.`

    });

  } catch(error){

    res.status(500).json({

      ok:false,

      error:error.message

    });

  }

});

export default router;