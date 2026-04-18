// =============================================
// controllers/task.controller.js
// =============================================
const { validationResult } = require("express-validator");
const sanitize = require("mongo-sanitize");
const Task = require("../models/Task");

// GET /api/tasks — Get all tasks for logged-in user
const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ tasks });
  } catch (error) {
    next(error);
  }
};

// POST /api/tasks — Create a task
const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const title = sanitize(req.body.title?.trim());

    const task = await Task.create({ title, userId: req.user._id });

    res.status(201).json({ message: "Task created.", task });
  } catch (error) {
    next(error);
  }
};

// PUT /api/tasks/:id — Update task (toggle or update title)
const updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    // Find task and ensure it belongs to the requesting user
    const task = await Task.findOne({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    // Allow updating title and/or completed status
    if (req.body.title !== undefined) {
      task.title = sanitize(req.body.title.trim());
    }
    if (req.body.completed !== undefined) {
      task.completed = Boolean(req.body.completed);
    }

    await task.save();

    res.status(200).json({ message: "Task updated.", task });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/tasks/:id — Delete a task
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.status(200).json({ message: "Task deleted." });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
