import express from "express";

import {
  normalizeHolding,
  normalizeValuation,
  normalizeOrder,
  normalizeTransaction
} from "../services/brokerReports/brokerReportNormalizer.service.js";
import {
 saveBrokerMirror,
 getBrokerMirror
}
from "../repositories/brokerMirror.repository.js";
import multer from "multer";
import XLSX from "xlsx";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage()
});

function normalizeUploadedRows(buffer, filename = "") {
  const workbook = XLSX.read(buffer, {
    type: "buffer"
  });

  const sheetName = workbook.SheetNames[0];

  const sheet = workbook.Sheets[sheetName];

  return XLSX.utils.sheet_to_json(sheet, {
    defval: ""
  });
}

router.post("/import", async (req, res) => {
  try {

    const {
  reportType,
  rows = []
} = req.body;

const broker =
  String(req.body.broker || "AIB")
    .toUpperCase();

    if (!reportType) {
      return res.status(400).json({
        ok:false,
        error:"reportType required"
      });
    }

    let normalized=[];

    switch(reportType){

      case "holdings":

        normalized=
          rows.map(r =>
            normalizeHolding({
              ...r,
              broker
            })
          );

        break;

      case "valuation":

        normalized=
          rows.map(r =>
            normalizeValuation({
              ...r,
              broker
            })
          );

        break;

      case "orders":

        normalized=
          rows.map(r =>
            normalizeOrder({
              ...r,
              broker
            })
          );

        break;

      case "transactions":

        normalized=
          rows.map(r =>
            normalizeTransaction({
              ...r,
              broker
            })
          );

        break;

      default:

        return res.status(400).json({
          ok:false,
          error:"unsupported report type"
        });

    }

  const saved =
 saveBrokerMirror(
   broker,
   reportType,
   normalized
 );

res.json({
 ok:true,
 broker,
 reportType,
 imported: normalized.length,
 storedCount: saved.length,
 duplicatesSkipped:
   normalized.length > saved.length
     ? normalized.length - saved.length
     : 0,
 stored:true,
 data:saved
});

  } catch(err){

    res.status(500).json({
      ok:false,
      error:err.message
    });

  }

});

router.get(
 "/mirror/:broker/:reportType",
 (req,res)=>{

 const data=
   getBrokerMirror(
     req.params.broker,
     req.params.reportType
   );

 res.json({
   ok:true,
   broker:req.params.broker,
   reportType:req.params.reportType,
   count:data.length,
   data
 });

});

router.get(
 "/summary/:broker",
 (req,res)=>{

 const broker =
  String(req.params.broker || "AIB")
    .toUpperCase();

const reportType = req.params.reportType;

 const holdings =
   getBrokerMirror(
     broker,
     "holdings"
   );

 console.log(
   "SUMMARY BROKER:",
   broker
 );

 console.log(
   "SUMMARY HOLDINGS:",
   holdings
 );

 const totalQuantity =
   holdings.reduce(
     (sum,item)=>
       sum+
       Number(
         item.quantity||0
       ),
     0
   );

 res.json({
   ok:true,
   broker,
   holdingsCount:
     holdings.length,
   totalQuantity,
   symbols:
     holdings.map(
       x=>x.symbol
     ),
   topHoldings:
     [...holdings]
       .sort(
         (a,b)=>
           Number(
             b.quantity||0
           )-
           Number(
             a.quantity||0
           )
       )
       .slice(0,5)
 });

});

router.get(
 "/exposure/:broker",
 (req,res)=>{

 const broker =
   String(
     req.params.broker
   ).toUpperCase();

 const holdings =
   getBrokerMirror(
     broker,
     "holdings"
   );

 const total =
   holdings.reduce(
     (sum,x)=>
       sum+
       Number(x.quantity||0),
     0
   );

 const exposure =
     holdings.map(h=>({

       symbol:h.symbol,

       quantity:h.quantity,

       exposurePct:
         total>0
         ? Number(
             (
               h.quantity/
               total*
               100
             ).toFixed(2)
           )
         :0

     }));

 res.json({

   ok:true,

   broker,

   totalQuantity:total,

   exposure

 });

});

router.post(
  "/upload",
  upload.single("file"),
  async (req, res) => {
    try {
      const broker = String(req.body.broker || "AIB").toUpperCase();
      const reportType = req.body.reportType || "holdings";

      if (!req.file) {
        return res.status(400).json({
          ok: false,
          error: "file required"
        });
      }

      const rows = normalizeUploadedRows(
        req.file.buffer,
        req.file.originalname
      );

      let normalized = [];

      switch (reportType) {
        case "holdings":
          normalized = rows.map((r) =>
            normalizeHolding({
              ...r,
              broker
            })
          );
          break;

        case "valuation":
          normalized = rows.map((r) =>
            normalizeValuation({
              ...r,
              broker
            })
          );
          break;

        case "orders":
          normalized = rows.map((r) =>
            normalizeOrder({
              ...r,
              broker
            })
          );
          break;

        case "transactions":
          normalized = rows.map((r) =>
            normalizeTransaction({
              ...r,
              broker
            })
          );
          break;

        case "cash":

normalized =
 rows.map(
  (r)=>({

   broker,

   date:
    r.Date,

   type:
    r.Type,

   description:
    r.Particulars,

   quantity:
    Number(
     r.Quantity || 0
    ),

   price:
    Number(
     String(
      r.Price || 0
     ).replaceAll(",","")
    ),

   debit:
    Number(
     String(
      r.Debit || 0
     ).replaceAll(",","")
    ),

   credit:
    Number(
     String(
      r.Credit || 0
     ).replaceAll(",","")
    ),

   balance:
    r.Balance

  })

 );

break;

        default:
          return res.status(400).json({
            ok: false,
            error: "unsupported report type"
          });
      }

      saveBrokerMirror(
        broker,
        reportType,
        normalized
      );

      res.json({
        ok: true,
        broker,
        reportType,
        filename: req.file.originalname,
        count: normalized.length,
        stored: true,
        data: normalized
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error: error.message
      });
    }
  }
);

export default router;