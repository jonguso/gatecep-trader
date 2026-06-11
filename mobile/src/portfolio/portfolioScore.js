export function calculatePortfolioScore({
 diversification="LOW",
 risk="BALANCED",
 gainLossPct=0,
 sectorCount=0,
 cash=0,
 portfolioValue=0
}){

 let score=50;

 if(diversification==="HIGH") score+=20;
 else if(diversification==="MEDIUM") score+=10;

 if(risk==="BALANCED") score+=15;

 if(gainLossPct>10) score+=15;
 else if(gainLossPct>0) score+=5;

 if(sectorCount>=4) score+=10;

 const cashRatio=
 portfolioValue
 ? cash/portfolioValue
 :0;

 if(cashRatio>.1) score+=10;

 score=Math.min(
   100,
   Math.max(
      0,
      Math.round(score)
   )
 );

 return {
   score,

   grade:
     score>=90 ? "A+" :
     score>=80 ? "A" :
     score>=70 ? "B" :
     score>=60 ? "C" :
     "D"
 };
}