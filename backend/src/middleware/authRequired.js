import jwt from "jsonwebtoken";

export function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || "";

    const token = header.startsWith("Bearer ")
      ? header.slice(7)
      : "";

    if (!token) {
      return res.status(401).json({
        ok: false,
        error: "Missing authorization token"
      });
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "dev-access-secret"
    );

    req.user = {
      id: payload.sub,
      email: payload.email,
      username: payload.username
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      error: "Invalid or expired token"
    });
  }
}
