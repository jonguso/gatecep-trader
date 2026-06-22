import express from "express";
import { authRequired } from "../../middleware/authRequired.js";

const router = express.Router();

router.get("/me", authRequired, (req, res) => {
  return res.json({
    ok: true,
    user: req.user
  });
});

export default router;