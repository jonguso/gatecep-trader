import crypto from "crypto";

export function generateCustomerNumber() {
  return `GTC-${new Date().getFullYear()}-${crypto.randomInt(100000, 999999)}`;
}

export function generateTemporaryPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars[crypto.randomInt(0, chars.length)];
  }
  return password;
}
