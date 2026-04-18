// =============================================
// server.js — Main Entry Point
// =============================================
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");
const { errorHandler, notFound } = require("./middleware/error.middleware");

// --- Connect to Database ---
connectDB();

const app = express();

// --- Security Middleware ---
app.use(helmet());

// --- CORS ---
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:5500",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// --- Body Parsing ---
app.use(express.json({ limit: "10kb" })); // Limit payload size
app.use(express.urlencoded({ extended: false }));

// --- Logging ---
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// --- Health Check ---
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// --- Error Handling ---
app.use(notFound);
app.use(errorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[server] Running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

module.exports = app;
console.log("Auth routes:", authRoutes);