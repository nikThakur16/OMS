const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { protect, authorize, canModifyProjectContent } = require("../middleware/authMiddleware");

// NOTE: Project-scoped task routes are now under projectRoutes.js

// Only Admins can create tasks (general, not project-scoped)
router.post("/", protect, authorize("Admin"), taskController.createTask);

// Anyone authenticated can view tasks

router.get("/:id", protect, taskController.getTaskById);

// Allow assigned users/managers to update or delete tasks
router.put("/:id", protect, canModifyProjectContent, taskController.updateTask);
router.delete("/:id", protect, canModifyProjectContent, taskController.deleteTask);

module.exports = router;
