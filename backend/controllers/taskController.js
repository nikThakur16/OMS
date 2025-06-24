const Task = require("../models/Task");

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { project, ...taskData } = req.body;
    const task = new Task({ ...taskData, project });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all tasks (with optional filters)
exports.getTasks = async (req, res) => {
  try {
    const filter = { ...req.query }; // You can add more advanced filtering here
    const tasks = await Task.find({ project });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Soft delete a task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json({ message: "Task soft-deleted", task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all tasks for a project
exports.getTasksByProject = async (req, res) => {
  try {
    const { project } = req.params;
    const tasks = await Task.find({ project });
  
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
