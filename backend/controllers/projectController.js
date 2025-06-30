const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

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
    const userId = req.user._id;
    const userRole = req.user.personalDetails.role; // Assuming this is how you get the role

    let filter = {};

    // Only restrict for non-admin, non-manager, non-hr
    if (!["Admin", "Manager", "HR"].includes(userRole)) {
      filter = {
        $or: [
          { manager: userId },
          { assignedTo: userId },
          { creator: userId },      // Only if you have this field
          { watchers: userId }      // Only if you have this field
        ]
      };
    }

    const projects = await Project.find(filter)
      .populate('manager', 'personalDetails')
      .populate('assignedTo', 'personalDetails')
      .populate('team', 'name')
      .populate('departments', 'name');

    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Project by ID
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'personalDetails')
      .populate('team', 'name')
      .populate('departments', 'name')
      .populate({
        path: 'tasks',
        populate: {
          path: 'assignedTo',
          select: 'personalDetails contactDetails'
        }
      });
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

exports.createTask = async (req, res) => {
  try {
    const { projectId } = req.params; // <-- get from URL
    const taskData = req.body;
    const task = new Task({ ...taskData, project: projectId }); // <-- set project
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.assignMembers = async (req, res) => {
  try {
    const { assignedTo } = req.body; // array of user IDs
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { assignedTo },
      { new: true }
    ).populate('assignedTo', 'personalDetails');
    res.json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all users assigned to any task in a project
exports.getTaskAssigneesForProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    // Find all tasks for this project
    const tasks = await Task.find({ project: projectId });
    // Collect all unique user IDs assigned to any task
    const userIds = [...new Set(tasks.flatMap(task => (task.assignedTo || []).map(id => id.toString())))];
    // Fetch only those users, return only personalDetails
    const users = await User.find({ _id: { $in: userIds } }, 'personalDetails contactDetails');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ASSIGNABLE USERS FOR A PROJECT
exports.getAssignableUsersForProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate({
      path: 'assignedTo',
      select: 'personalDetails.firstName personalDetails.lastName contactDetails', // Select only the fields needed for the dropdown
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Return the array of users assigned to the project
    res.json(project.assignedTo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
