// =============================================
// routes/auth.routes.js
// =============================================
const express = require("express");
const { body } = require("express-validator");
const { register, login, getMe } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { authLimiter } = require("../middleware/rateLimiter.middleware");

const router = express.Router();

// --- Validation Rules ---
const registerValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be 2–50 characters."),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please enter a valid email."),
  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/).withMessage("Password must contain an uppercase letter.")
    .matches(/[a-z]/).withMessage("Password must contain a lowercase letter.")
    .matches(/[0-9]/).withMessage("Password must contain a number."),
];

const loginValidation = [
  body("email").trim().notEmpty().withMessage("Email is required.").isEmail().withMessage("Invalid email."),
  body("password").notEmpty().withMessage("Password is required."),
];

// --- Routes ---
router.post("/register", authLimiter, registerValidation, register);
router.post("/login", authLimiter, loginValidation, login);
router.get("/me", protect, getMe);

module.exports = router;
