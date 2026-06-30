import {
  createInvestorDNA,
  readInvestorDNA,
  updateInvestorDNA
} from "./investorDNA.service.js";

export async function create(req, res, next) {
  try {
    const userId = req.body.userId || "demo-user";

    const result = await createInvestorDNA(userId, req.body);

    res.status(201).json({
      ok: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
}

export async function get(req, res, next) {
  try {
    const result = await readInvestorDNA(req.params.userId);

    if (!result) {
      return res.status(404).json({
        ok: false,
        error: "Investor DNA not found"
      });
    }

    res.json({
      ok: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const result = await updateInvestorDNA(
      req.params.userId,
      req.body
    );

    res.json({
      ok: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
}