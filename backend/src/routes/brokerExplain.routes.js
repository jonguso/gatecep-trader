import express from "express";

import {
 getBrokerMirror
}
from "../repositories/brokerMirror.repository.js";

import {
 marketDataGateway
}
from "../services/marketData/MarketDataGateway.js";

const router = express.Router();

router.get(
 "/:broker/:symbol",
 async (req,res)=>{

try{

const broker =
 String(
  req.params.broker
 ).toUpperCase();

const symbol =
 String(
  req.params.symbol
 ).toUpperCase();

const holdings =
 getBrokerMirror(
  broker,
  "holdings"
 );

const holding =
 holdings.find(
  x =>
   String(
    x.symbol
   ).toUpperCase()
   === symbol
 );

if(!holding){

 return res
 .status(404)
 .json({
  ok:false,
  error:
   "holding not found"
 });

}

const prices =
 await marketDataGateway
 .getPrices();

const market =
 prices.data.find(
  x =>
   String(
    x.symbol
   ).toUpperCase()
   === symbol
 ) || {};

const quantity =
 Number(
  holding.quantity||0
 );

const price =
 Number(
  market.price||0
 );

const marketValue =
 quantity*price;

let recommendation;

if(
 Number(
  market.changePct||0
 ) < 0
){

 recommendation =
  "Momentum weakening.";

}else{

 recommendation =
  "Momentum improving.";

}

res.json({

 ok:true,

 broker,

 symbol,

 quantity,

 price,

 marketValue,

 sector:
  market.sector,

 changePct:
  market.changePct,

 explanation:

 `${symbol} represents approximately KES ${marketValue.toFixed(2)} in your broker mirror. Current trend is ${market.changePct}% and sector is ${market.sector}. ${recommendation}`

});

}catch(error){

res.status(500).json({
 ok:false,
 error:error.message
});

}

});

export default router;