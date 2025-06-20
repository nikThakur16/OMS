const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Only Admins can create tasks
router.post("/", protect, authorize("Admin"), taskController.createTask);

// Anyone authenticated can view tasks
router.get("/", protect, taskController.getTasks);
router.get("/:id", protect, taskController.getTaskById);

// Only Admins can update or delete tasks (optional, but recommended)
router.put("/:id", protect, authorize("Admin"), taskController.updateTask);
router.delete("/:id", protect, authorize("Admin"), taskController.deleteTask);

module.exports = router;
