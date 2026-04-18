// =============================================
// controllers/auth.controller.js
// =============================================
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const sanitize = require("mongo-sanitize");
const User = require("../models/User");

// --- Helper: generate JWT ---
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};

// --- Helper: send safe error ---
const safeError = (res, status, message) => {
  return res.status(status).json({ message });
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    // 1. Validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    // 2. Sanitize inputs to prevent NoSQL injection
    const name = sanitize(req.body.name?.trim());
    const email = sanitize(req.body.email?.trim().toLowerCase());
    const password = req.body.password; // Don't sanitize passwords

    // 3. Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return safeError(res, 409, "An account with this email already exists.");
    }

    // 4. Create user (password hashed in model pre-save hook)
    const user = await User.create({ name, email, password });

    // 5. Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    // 1. Validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    // 2. Sanitize inputs
    const email = sanitize(req.body.email?.trim().toLowerCase());
    const password = req.body.password;

    // 3. Find user (explicitly select password since it's excluded by default)
    const user = await User.findOne({ email }).select("+password");

    // 4. Use generic message to prevent email enumeration
    if (!user || !(await user.comparePassword(password))) {
      return safeError(res, 401, "Invalid email or password.");
    }

    // 5. Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful.",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me (get current user info)
const getMe = async (req, res) => {
  res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    },
  });
};

module.exports = { register, login, getMe };
