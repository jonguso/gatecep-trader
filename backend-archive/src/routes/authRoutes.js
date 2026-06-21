import express from "express";
import { generateCustomerNumber, generateTemporaryPassword } from "../auth/password.js";
import { findCustomerByEmail, saveCustomer } from "../auth/customerStore.js";
import { sendWelcomePasswordEmail } from "../email/mailer.js";

export const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    const { tradingAccount, clientIdType, clientId, email } = req.body || {};

    if (!tradingAccount || !clientId || !email) {
      return res.status(400).json({ error: "Trading account, client ID, and email are required." });
    }

    const username = String(email).trim().toLowerCase();

    if (findCustomerByEmail(username)) {
      return res.status(409).json({ error: "A customer already exists for this email." });
    }

    const customerNumber = generateCustomerNumber();
    const temporaryPassword = generateTemporaryPassword();

    const customer = saveCustomer({
      customerNumber,
      username,
      email: username,
      tradingAccount,
      clientIdType: clientIdType || "National ID",
      clientId,
      temporaryPassword,
      mustChangePassword: true,
      createdAt: new Date().toISOString()
    });

    const emailResult = await sendWelcomePasswordEmail({
      to: username,
      customerNumber,
      temporaryPassword
    });

    res.status(201).json({
      message: "Customer created. Login details sent by email.",
      customerNumber: customer.customerNumber,
      username: customer.username,
      emailSent: emailResult.sent,
      devPassword: emailResult.devPassword
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

authRouter.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  const email = String(username || "").trim().toLowerCase();

  if (email === "demo" && password === "demo123") {
    return res.json({
      token: "demo-token",
      user: { username: "demo", customerNumber: "GTC-DEMO-000001", name: "Demo User" }
    });
  }

  const customer = findCustomerByEmail(email);

  if (!customer || customer.temporaryPassword !== password) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  res.json({
    token: `gatecep-token-${customer.customerNumber}`,
    user: {
      username: customer.username,
      email: customer.email,
      customerNumber: customer.customerNumber,
      mustChangePassword: customer.mustChangePassword
    }
  });
});
