import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {

  try {

    const brokerLink = {

      id: `BL-${Date.now()}`,

      broker: req.body.broker,

      clientNumber: req.body.clientNumber,

      cdsNumber: req.body.cdsNumber,

      email: req.body.email,

      status:
        req.body.status ||
        "LINKED_PENDING_UPLOAD",

      createdAt:
        new Date().toISOString()

    };

    res.json({

      ok: true,

      brokerLink

    });

  } catch (error) {

    res.status(500).json({

      ok:false,

      error:error.message

    });

  }

});

export default router;