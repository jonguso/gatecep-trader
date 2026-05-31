import express from "express";
import multer from "multer";
import XLSX from "xlsx";

import {
  normalizeHolding,
  normalizeValuation,
  normalizeOrder,
  normalizeTransaction
} from "../services/brokerReports/brokerReportNormalizer.service.js";

import {
  saveBrokerMirror,
  getBrokerMirror
} from "../repositories/brokerMirror.repository.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage()
});

function normalizeUploadedRows(buffer) {
  const workbook = XLSX.read(buffer, {
    type: "buffer"
  });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  return XLSX.utils.sheet_to_json(sheet, {
    defval: ""
  });
}

function normalizeRows(reportType, rows, broker) {
  switch (reportType) {
    case "holdings":
      return rows.map((r) =>
        normalizeHolding({
          ...r,
          broker
        })
      );

    case "valuation":
      return rows.map((r) =>
        normalizeValuation({
          ...r,
          broker
        })
      );

    case "orders":
      return rows.map((r) =>
        normalizeOrder({
          ...r,
          broker
        })
      );

    case "transactions":
      return rows.map((r) =>
        normalizeTransaction({
          ...r,
          broker
        })
      );

    case "cash":
      return rows.map((r) => ({
        broker,
        date: r.Date || r.date || "",
        type: r.Type || r.type || "",
        description:
          r.Particulars ||
          r.Description ||
          r.description ||
          "",
        quantity: Number(
          String(r.Quantity || 0).replaceAll(",", "")
        ),
        price: Number(
          String(r.Price || 0).replaceAll(",", "")
        ),
        debit: Number(
          String(r.Debit || 0).replaceAll(",", "")
        ),
        credit: Number(
          String(r.Credit || 0).replaceAll(",", "")
        ),
        balance:
          r.Balance ||
          r.balance ||
          ""
      }));

    default:
      return null;
  }
}

function saveReportSnapshot(broker, reportType, normalized) {
  return saveBrokerMirror(
    broker,
    reportType,
    normalized,
    {
      replace: reportType === "valuation"
    }
  );
}

router.post("/import", async (req, res) => {
  try {
    const broker = String(req.body.broker || "AIB").toUpperCase();
    const reportType = req.body.reportType || "";
    const rows = req.body.rows || [];

    const normalized = normalizeRows(
      reportType,
      rows,
      broker
    );

    if (!normalized) {
      return res.status(400).json({
        ok: false,
        error: "unsupported report type"
      });
    }

    const saved = saveReportSnapshot(
      broker,
      reportType,
      normalized
    );

    res.json({
      ok: true,
      broker,
      reportType,
      imported: normalized.length,
      storedCount: saved.length,
      duplicatesSkipped:
        normalized.length > saved.length
          ? normalized.length - saved.length
          : 0,
      stored: true,
      data: saved
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
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
        req.file.buffer
      );

      const normalized = normalizeRows(
        reportType,
        rows,
        broker
      );

      if (!normalized) {
        return res.status(400).json({
          ok: false,
          error: "unsupported report type"
        });
      }

      const saved = saveReportSnapshot(
        broker,
        reportType,
        normalized
      );

      res.json({
        ok: true,
        broker,
        reportType,
        filename: req.file.originalname,
        imported: normalized.length,
        storedCount: saved.length,
        duplicatesSkipped:
          normalized.length > saved.length
            ? normalized.length - saved.length
            : 0,
        stored: true,
        data: saved
      });
    } catch (error) {
      res.status(500).json({
        ok: false,
        error: error.message
      });
    }
  }
);

router.get(
  "/mirror/:broker/:reportType",
  (req, res) => {
    const data = getBrokerMirror(
      req.params.broker,
      req.params.reportType
    );

    res.json({
      ok: true,
      broker: req.params.broker,
      reportType: req.params.reportType,
      count: data.length,
      data
    });
  }
);

router.get(
  "/summary/:broker",
  (req, res) => {
    const broker = String(
      req.params.broker || "AIB"
    ).toUpperCase();

    const holdings = getBrokerMirror(
      broker,
      "holdings"
    );

    const totalQuantity = holdings.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 0),
      0
    );

    res.json({
      ok: true,
      broker,
      holdingsCount: holdings.length,
      totalQuantity,
      symbols: holdings.map((x) => x.symbol),
      topHoldings: [...holdings]
        .sort(
          (a, b) =>
            Number(b.quantity || 0) -
            Number(a.quantity || 0)
        )
        .slice(0, 5)
    });
  }
);

router.get(
  "/exposure/:broker",
  (req, res) => {
    const broker = String(
      req.params.broker || "AIB"
    ).toUpperCase();

    const holdings = getBrokerMirror(
      broker,
      "holdings"
    );

    const total = holdings.reduce(
      (sum, x) =>
        sum + Number(x.quantity || 0),
      0
    );

    const exposure = holdings.map((h) => ({
      symbol: h.symbol,
      quantity: h.quantity,
      exposurePct:
        total > 0
          ? Number(
              (
                (h.quantity / total) *
                100
              ).toFixed(2)
            )
          : 0
    }));

    res.json({
      ok: true,
      broker,
      totalQuantity: total,
      exposure
    });
  }
);

export default router;