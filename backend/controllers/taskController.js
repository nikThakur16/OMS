const Task = require("../models/Task");

// Create a new task under a project
exports.createTask = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: "projectId is required in URL" });
    }

    // ✅ Get data from request body
    const taskData = req.body;

    // ✅ Inject createdBy from authenticated user
    const task = new Task({
      ...taskData,
      project: projectId,
      createdBy: req.user._id, // Use the user attached by the `protect` middleware
    });

    await task.save();

    // THE FIX: Before you send the response, populate the user details.
    await task.populate({
        path: 'assignedTo',
        select: 'personalDetails contactDetails' // Only send the details we need
    });

    res.status(201).json(task);
  } catch (err) {
    console.error("Task creation failed:", err.message);
    res.status(400).json({ error: err.message });
  }
};


// Get all tasks for a project
exports.getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await Task.find({ project: projectId }).populate('assignedTo', 'personalDetails contactDetails');
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'personalDetails contactDetails');
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('assignedTo', 'personalDetails contactDetails');
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Soft delete a task
exports.deleteTask = async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  res.json({ message: "Task deleted" });
};
