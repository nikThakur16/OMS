const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { protect, authorize, canModifyProjectContent, canModifyProject } = require("../middleware/authMiddleware");
const taskController = require("../controllers/taskController");

// Only Admins can create, update, delete
router.post("/", protect, authorize("Admin"), projectController.createProject);
router.put("/:id", protect, canModifyProject, projectController.updateProject);


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

// Assign members to a project
router.put('/:id/assign', protect, canModifyProjectContent, projectController.assignMembers);

// Get task assignees for a project
router.get('/:projectId/task-assignees', protect, authorize(['Admin', 'Employee']), projectController.getTaskAssigneesForProject);

// NEW ROUTE FOR GETTING ASSIGNABLE USERS
router.get(
  '/:projectId/assignable-users',
  protect, // Ensures user is logged in
  authorize(['Admin', 'Employee', 'Manager', 'HR']), // Ensures user has a valid role
  projectController.getAssignableUsersForProject
);

// Soft delete
router.delete('/:id', protect, canModifyProject, projectController.softDeleteProject);

// Restore
router.post('/:id/restore', protect, canModifyProject, projectController.restoreProject);

// Hard delete
router.delete('/:id/hard', protect, authorize("Admin"), canModifyProject, projectController.hardDeleteProject);

module.exports = router;
