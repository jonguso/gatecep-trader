import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET =
  process.env.JWT_SECRET || "gatecep-secret";

const users = [
  {
    id: 1,
    username: "admin",
    passwordHash: bcrypt.hashSync("admin123", 10),
    role: "ADMIN"
  },
  {
    id: 2,
    username: "trader",
    passwordHash: bcrypt.hashSync("trader123", 10),
    role: "TRADER"
  },
  {
    id: 3,
    username: "risk",
    passwordHash: bcrypt.hashSync("risk123", 10),
    role: "RISK_MANAGER"
  },
  {
    id: 4,
    username: "compliance",
    passwordHash: bcrypt.hashSync("compliance123", 10),
    role: "COMPLIANCE"
  }
];

export async function login(username, password) {
  const user = users.find(
    (u) => u.username === username
  );

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const valid = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!valid) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: "12h"
    }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  };
}