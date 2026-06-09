export function generateCoachActions(coachDecision){

if(!coachDecision){

return [];

}

const actions=[];

if(
coachDecision.recommendation==="BUY"
){

actions.push({
label:"Open Trade",
route:"/first-trade"
});

actions.push({
label:"View Watchlist",
route:"/watchlist"
});

}

if(
coachDecision.recommendation==="REDUCE"
){

actions.push({
label:"Review Holdings",
route:"/holding-details"
});

actions.push({
label:"Open Trade",
route:"/first-trade"
});

}

if(
coachDecision.recommendation==="HOLD"
){

actions.push({
label:"View Performance",
route:"/performance"
});

}

return actions;

}