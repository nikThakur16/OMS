const Project = require("../models/Project");

// Create Project
exports.createProject = async (req, res) => {
  try {
    // Always set organizationId from the authenticated user
    const orgId = req.user.organizationId;
  const project = new Project({ ...req.body, organizationId: orgId });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Projects (optionally filter by org, status, etc.)
exports.getProjects = async (req, res) => {
  try {
    const filter = { ...req.query };
    // Populate manager's name
    const projects = await Project.find(filter).populate('manager', 'personalDetails').populate('team' , 'name').populate('departments' , 'name');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Project by ID
exports.getProjectById = async (req, res) => {
  try {
    // Populate manager's name
    const project = await Project.findById(req.params.id).populate('manager', 'personalDetails').populate('team' , 'name').populate('departments' , 'name').populate('tasks');
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Soft Delete Project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json({ message: "Project soft-deleted", project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
