import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "gatecep-secret";

export function authenticate(req, res, next) {
  const authHeader =
    req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      ok: false,
      error: "Missing token"
    });
  }

  const token = authHeader.replace(
    "Bearer ",
    ""
  );

  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      error: "Invalid token"
    });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        error: "Forbidden"
      });
    }

    next();
  };
}