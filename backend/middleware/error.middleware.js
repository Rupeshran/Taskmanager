// =============================================
// middleware/error.middleware.js — Error Handlers
// =============================================

// 404 handler
const notFound = (req, res, next) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  console.error(`[error] ${err.message}`);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `${field} already in use.` });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  // CORS error
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "CORS policy violation." });
  }

  // Generic server error — never expose internals
  res.status(err.statusCode || 500).json({
    message: process.env.NODE_ENV === "production"
      ? "An unexpected error occurred."
      : err.message,
  });
};

module.exports = { notFound, errorHandler };
