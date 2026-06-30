import { Router } from "express";

import * as controller from "./investorDNA.controller.js";

const router = Router();

router.post("/", controller.create);

router.get("/:userId", controller.get);

router.patch("/:userId", controller.update);

export default router;