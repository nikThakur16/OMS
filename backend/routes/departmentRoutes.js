const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Only Admins can create, update, delete
router.post("/", protect, authorize("Admin"), departmentController.createDepartment);
router.put("/:id", protect, authorize("Admin"), departmentController.updateDepartment);
router.delete("/:id", protect, authorize("Admin"), departmentController.deleteDepartment);

// Anyone authenticated can view
router.get("/", protect, departmentController.getDepartments);
router.get("/:id", protect, departmentController.getDepartmentById);

module.exports = router;
