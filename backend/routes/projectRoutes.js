const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Only Admins can create, update, delete
router.post("/", protect, authorize("Admin"), projectController.createProject);
router.put("/:id", protect, authorize("Admin"), projectController.updateProject);
router.delete("/:id", protect, authorize("Admin"), projectController.deleteProject);

// Anyone authenticated can view
router.get("/", protect, projectController.getProjects);
router.get("/:id", protect, projectController.getProjectById);

module.exports = router;
