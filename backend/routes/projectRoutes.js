const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { protect, authorize, canModifyProjectContent } = require("../middleware/authMiddleware");
const taskController = require("../controllers/taskController");

// Only Admins can create, update, delete
router.post("/", protect, authorize("Admin"), projectController.createProject);
router.put("/:id", protect, authorize("Admin"), projectController.updateProject);
router.delete("/:id", protect, authorize("Admin"), projectController.deleteProject);

// Anyone authenticated can view
router.get("/", protect, projectController.getProjects);
router.get("/:id", protect, projectController.getProjectById);

// Nested task routes for a project
router.get('/:projectId/tasks', protect, taskController.getTasksByProject);
router.post('/:projectId/tasks', protect, canModifyProjectContent, taskController.createTask);

// Create a task under a project
router.post("/:projectId/tasks", protect, authorize("Admin"), taskController.createTask);

// Get all tasks for a project
router.get("/:projectId/tasks", protect, taskController.getTasksByProject);

module.exports = router;
