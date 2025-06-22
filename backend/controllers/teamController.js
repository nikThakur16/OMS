const Team = require("../models/Team");

// Create Team
exports.createTeam = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const team = new Team({
      ...req.body,
      organizationId,
    });
    await team.save();
    res.status(201).json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Teams
exports.getTeams = async (req, res) => {
  try {
    const filter = { ...req.query };
    const teams = await Team.find(filter);
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Team by ID
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: "Team not found" });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Team
exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!team) return res.status(404).json({ error: "Team not found" });
    res.json(team);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Soft Delete Team
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    if (!team) return res.status(404).json({ error: "Team not found" });
    res.json({ message: "Team soft-deleted", team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
