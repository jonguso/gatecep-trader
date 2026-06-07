export function createPerformanceSnapshot({
 holdings=[],
 cash=0
}){

 const holdingsValue=
 holdings.reduce(
   (sum,x)=>sum+Number(x.marketValue||0),
   0
 );

 return {
   timestamp:new Date().toISOString(),
   holdingsValue,
   cash,
   totalValue:holdingsValue+cash
 };
}

export function calculatePnL(history=[]){

 if(history.length<2){
   return {
     pnl:0,
     pct:0
   };
 }

 const first=history[0].totalValue;
 const latest=history[history.length-1].totalValue;

 const pnl=latest-first;

 return{
   pnl,
   pct:first
      ? (pnl/first)*100
      :0
 };
}