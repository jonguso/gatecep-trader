import express from "express";

import { getBrokerMirror }
from "../repositories/brokerMirror.repository.js";

import {
 marketDataGateway
}
from "../services/marketData/MarketDataGateway.js";

import { normalizeNseSymbol } from "../data/nseSecurityMaster.js";

const router = express.Router();

router.get("/:broker", async (req,res)=>{

 const broker =
  String(
   req.params.broker
  ).toUpperCase();

 const holdings =
  getBrokerMirror(
   broker,
   "holdings"
  );

 const prices =
  await marketDataGateway.getPrices();

 const lookup =
  Object.fromEntries(
   prices.data.map(
    x=>[
      String(x.symbol).trim(),
      x
    ]
   )
  );

 const enriched =
  holdings.map(h=>{

   const normalizedSymbol =
  normalizeNseSymbol(h.symbol);

const market =
  lookup[normalizedSymbol] || {};

   const quantity =
    Number(
      h.quantity||0
    );

   const price =
    Number(
      market.price||0
    );

   const value =
    quantity*
    price;

   return {

    symbol: normalizedSymbol,

    sector:
      market.sector ||
      "Unknown",

    value,

    changePct:
      Number(
        market.changePct||0
      ),

    intensity:
      Math.abs(
        Number(
          market.changePct||0
        )
      )

   };

  });

 res.json({

  ok:true,

  broker,

  heatmap:enriched

 });

});

export default router;