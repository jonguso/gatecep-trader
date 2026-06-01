import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {

  try {

    const {

      broker,

      clientNumber,

      cdsNumber,

      email,

      source = "EXISTING_INVESTOR",

      recommendedBroker = null,

      customerProfile = null,

      status = "LINKED_PENDING_UPLOAD"

    } = req.body;

    const brokerLink = {

      id: `BL-${Date.now()}`,

      broker,

      clientNumber,

      cdsNumber,

      email,

      source,

      recommendedBroker,

      customerProfile,

      status,

      uploadRequired: true,

      createdAt:
        new Date().toISOString()

    };

    res.json({

      ok: true,

      brokerLink,

      nextStep:
        "/mobile/broker-upload"

    });

  } catch (error) {

    res.status(500).json({

      ok: false,

      error: error.message

    });

  }

});

export default router;