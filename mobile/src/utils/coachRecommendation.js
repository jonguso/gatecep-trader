export function generateCoachRecommendation({
  portfolio,
  cash,
  marketMood,
  watchlist=[],
  risk="BALANCED"
}) {

const holdingsValue =
portfolio.reduce(
(sum,h)=>sum+Number(
h.marketValue||0
),0
);

const totalCapital =
holdingsValue + cash;

const sectors={};

portfolio.forEach(h=>{

const sector=
h.sector || "Unknown";

const value=
Number(
h.marketValue||0
);

sectors[sector]=
(sectors[sector]||0)+value;

});

const largestSector =
Object.entries(sectors)
.sort(
(a,b)=>b[1]-a[1]
)[0];

const concentration =
largestSector
?
(largestSector[1]/Math.max(
totalCapital,
1
))*100
:
0;

let recommendation="HOLD";
let confidence=55;
let reason=[];
let suggestedAmount=0;

const positiveSignals =
watchlist.filter(
w=>w.signal==="BUY"
).length;

if(
cash>5000 &&
positiveSignals>0 &&
marketMood?.score>=0
){

recommendation="BUY";

confidence+=15;

reason.push(
"Positive watchlist signals"
);

suggestedAmount=
Math.min(
cash*.25,
20000
);

}

if(
concentration>55
){

recommendation="REDUCE";

confidence+=20;

reason.push(
"Portfolio concentration too high"
);

}

if(
risk==="HIGH_RISK" &&
marketMood?.score<0
){

recommendation="HOLD";

confidence+=10;

reason.push(
"Risk conditions elevated"
);

}

if(
reason.length===0
){

reason.push(
"Portfolio currently balanced"
);

}

return{

recommendation,

confidence:
Math.min(
confidence,
95
),

reason,

suggestedAmount,

largestSector:
largestSector?.[0] || null,

concentration

};

}