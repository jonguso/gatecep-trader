import express from "express";

const router = express.Router();

router.get("/", (req,res)=>{

const portfolio =
Number(req.query.portfolio||0);

const conservative =
portfolio*0.85;

const moderate =
portfolio*1.12;

const aggressive =
portfolio*1.30;

res.json({

ok:true,

portfolio,

scenarios:[

{

name:"Market Crash",

change:-15,

value:
Number(
conservative.toFixed(2)
)

},

{

name:"Expected Growth",

change:+12,

value:
Number(
moderate.toFixed(2)
)

},

{

name:"Bull Market",

change:+30,

value:
Number(
aggressive.toFixed(2)
)

}

]

});

});

export default router;