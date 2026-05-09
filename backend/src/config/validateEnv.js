export function validateEnv() {
  const required =
    process.env.NODE_ENV === "production"
      ? ["DATABASE_URL", "JWT_SECRET"]
      : [];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  console.log("Environment validation passed");
}