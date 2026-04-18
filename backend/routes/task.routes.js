// =============================================
// routes/task.routes.js
// =============================================
const express = require("express");
const { body, param } = require("express-validator");
const { getTasks, createTask, updateTask, deleteTask } = require("../controllers/task.controller");
const { protect } = require("../middleware/auth.middleware");
const { apiLimiter } = require("../middleware/rateLimiter.middleware");

const router = express.Router();

// All task routes require authentication
router.use(protect);
router.use(apiLimiter);

const taskTitleValidation = [
  body("title")
    .trim()
    .notEmpty().withMessage("Task title is required.")
    .isLength({ max: 200 }).withMessage("Title cannot exceed 200 characters."),
];

const idValidation = [
  param("id").isMongoId().withMessage("Invalid task ID."),
];

router.get("/", getTasks);
router.post("/", taskTitleValidation, createTask);
router.put("/:id", idValidation, updateTask);
router.delete("/:id", idValidation, deleteTask);

module.exports = router;
