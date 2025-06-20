const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Only Admins can create, update, delete
router.post("/", protect, authorize("Admin"), teamController.createTeam);
router.put("/:id", protect, authorize("Admin"), teamController.updateTeam);
router.delete("/:id", protect, authorize("Admin"), teamController.deleteTeam);

// Anyone authenticated can view
router.get("/", protect, teamController.getTeams);
router.get("/:id", protect, teamController.getTeamById);

module.exports = router;
