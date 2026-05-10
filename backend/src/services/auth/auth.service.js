import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  findUserByUsername,
  createUser,
  countUsers
} from "../../repositories/user.repository.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "gatecep-secret";

export async function registerUser({
  username,
  password,
  role = "TRADER"
}) {
  const existing = await findUserByUsername(username);

  if (existing) {
    throw new Error("Username already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await createUser({
    username,
    passwordHash,
    role
  });

  return user;
}

export async function authenticateUser({
  username,
  password
}) {
  const user = await findUserByUsername(username);

  if (!user) {
    throw new Error("Invalid username or password");
  }

  const valid = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!valid) {
    throw new Error("Invalid username or password");
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role
  };
}

export async function seedDefaultAdmin() {
  const totalUsers = await countUsers();

  if (totalUsers > 0) {
    return;
  }

  const passwordHash = await bcrypt.hash("admin123", 10);

  await createUser({
    username: "admin",
    passwordHash,
    role: "ADMIN"
  });

  console.log("Default admin user seeded.");
}