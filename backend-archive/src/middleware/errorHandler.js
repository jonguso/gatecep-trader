export function errorHandler(error, req, res, next) {
  console.error("API Error:", {
    message: error.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  res.status(error.status || 500).json({
    ok: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message
  });
}