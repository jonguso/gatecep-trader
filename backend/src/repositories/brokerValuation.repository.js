const valuations = {};

export function saveBrokerValuation(
 broker,
 rows=[]
){

 const key =
  String(
   broker||"AIB"
  ).toUpperCase();

 valuations[key]=rows;

 return rows;

}

export function getBrokerValuation(
 broker
){

 const key =
  String(
   broker||"AIB"
  ).toUpperCase();

 return valuations[key] || [];

}