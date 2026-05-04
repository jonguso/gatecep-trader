import jwt from "jsonwebtoken";
import { getUserByEmail, audit } from "../store/state.js";

const secret = process.env.JWT_SECRET || "dev_secret";

export function login(req, res) {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  if (!user || user.password !== password) return res.status(401).json({ error: "Invalid credentials" });
  audit("LOGIN", `Login for ${email}`, user.id);
  const accessToken = jwt.sign({ sub: user.id, role: user.role }, secret, { expiresIn: "2h" });
  const { password: _password, ...safe } = user;
  res.json({ accessToken, user: safe });
}
