import express from "express";

import {
  buildInvestorProfile
} from "../services/investorProfile.service.js";

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

    const profile =
      buildInvestorProfile({
        goal,
        risk,
        experience,
        timeHorizon
      });

    const brokerComparison =
      buildBrokerComparison(profile);

    const recommendedBroker =
      brokerComparison[0];

    const starterPortfolio =
      buildStarterPortfolio(
        profile,
        investmentAmount
      );

    res.json({

      ok: true,

      profile,

      recommendedBroker,

      brokerComparison,

      starterPortfolio,

      advice:
        buildAdvice(
          profile
        )

    });

  } catch (error) {

    res.status(500).json({

      ok:false,

      error:error.message

    });

  }

});

function buildBrokerComparison(
  profile
) {

  const brokers = [

    {
      name:"AIB-AXYS",

      baseScore:82,

      bestFor:
        "Beginners and long-term investors",

      strengths:[
        "Beginner friendly",
        "Research support",
        "Portfolio building"
      ]
    },

    {
      name:"ABC",

      baseScore:78,

      bestFor:
        "Active investors",

      strengths:[
        "Trading tools",
        "Execution speed",
        "Market access"
      ]
    },

    {
      name:"Dyer & Blair",

      baseScore:76,

      bestFor:
        "Research-focused investors",

      strengths:[
        "Research depth",
        "Advisory support",
        "Institutional experience"
      ]
    }

  ];

  return brokers
  .map((broker)=>{

    let score =
      broker.baseScore;

    if (
      profile.experience==="beginner" &&
      broker.name==="AIB-AXYS"
    ) {
      score+=5;
    }

    if (
      profile.risk==="aggressive" &&
      broker.name==="ABC"
    ) {
      score+=5;
    }

    if (
      profile.goal==="dividend" &&
      broker.name==="Dyer & Blair"
    ) {
      score+=4;
    }

    return {

      ...broker,

      score:
        Math.min(
          score,
          100
        )

    };

  })
  .sort(
    (a,b)=>
      b.score-a.score
  );

}

function buildStarterPortfolio(
  profile,
  amount
){

 let buckets=[];

 if(
  profile.goal==="dividend"
 ){

  buckets=[

   {
    bucket:
     "Dividend Basket",
    weight:40
   },

   {
    bucket:
     "Banking",
    weight:25
   },

   {
    bucket:
     "ETF",
    weight:20
   },

   {
    bucket:
     "Cash",
    weight:15
   }

  ];

 }

 else if(
  profile.risk==="aggressive"
 ){

  buckets=[

   {
    bucket:
     "Growth Stocks",
    weight:45
   },

   {
    bucket:
     "ETF",
    weight:20
   },

   {
    bucket:
     "Banking",
    weight:20
   },

   {
    bucket:
     "Cash",
    weight:15
   }

  ];

 }

 else{

  buckets=[

   {
    bucket:
     "ETF",
    weight:30
   },

   {
    bucket:
     "Banking",
    weight:25
   },

   {
    bucket:
     "Dividend Basket",
    weight:25
   },

   {
    bucket:
     "Cash",
    weight:20
   }

  ];

 }

 return buckets.map(
  (bucket)=>({

   ...bucket,

   amount:

   Number(

    (
      amount*
      bucket.weight
    )/100

   .toFixed(2))

  })
 );

}

function buildAdvice(
 profile
){

 return `Coach G believes a ${profile.risk} investor with a ${profile.goal} objective should focus on consistency, diversification, and periodic portfolio reviews.`;

}

export default router;