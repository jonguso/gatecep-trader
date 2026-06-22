export function generatePortfolioAlerts({
 holdings=[],
 cash=0,
 risk="BALANCED"
}){

 const alerts=[];

 const invested=
 holdings.reduce(
   (sum,x)=>sum+Number(x.marketValue||0),
   0
 );

 if(cash < invested*0.05){
   alerts.push({
     type:"warning",
     message:"Cash reserve becoming low."
   });
 }

 if(risk==="HIGH_RISK"){
   alerts.push({
     type:"risk",
     message:"Portfolio risk profile elevated."
   });
 }

 if(holdings.length<=2){
   alerts.push({
     type:"diversification",
     message:"Portfolio may be under-diversified."
   });
 }

 if(!alerts.length){
   alerts.push({
     type:"healthy",
     message:"Portfolio health looks stable."
   });
 }

 return alerts;
}