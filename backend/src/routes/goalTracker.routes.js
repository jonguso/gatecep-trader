import express from "express";

const router = express.Router();

router.get("/", (req,res)=>{

const target=
Number(req.query.target||0);

const current=
Number(req.query.current||0);

const monthly=
Number(req.query.monthly||0);

const annualReturn=
Number(req.query.return||10);

const monthlyReturn=
annualReturn/12/100;

let balance=current;

let months=0;

while(
balance<target &&
months<1000
){

balance=

balance*
(1+monthlyReturn)

+

monthly;

months++;

}

res.json({

ok:true,

target,

current,

monthly,

projectedMonths:months,

projectedYears:
Number(
(months/12)
.toFixed(1)
),

finalBalance:
Number(
balance.toFixed(2)
)

});

});

export default router;