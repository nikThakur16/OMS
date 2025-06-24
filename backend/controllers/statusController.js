const Status = require('../models/Status');

const DEFAULT_STATUSES = [
  { name: 'Todo', color: '#fbbf24' },
  { name: 'In Progress', color: '#3b82f6' },
  { name: 'Completed', color: '#10b981' },
];

// Get all statuses (optionally by project)
exports.getStatuses = async (req, res) => {
  try {
    const { project } = req.query;
    const query = project ? { project } : {};
    let statuses = await Status.find(query);
    if (project && statuses.length === 0) {
      // Create default statuses for this project
      const created = await Status.insertMany(
        DEFAULT_STATUSES.map(s => ({ ...s, project }))
      );
      statuses = created;
    }
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new status
exports.createStatus = async (req, res) => {
  try {
    const { name, project, color } = req.body;
    const status = new Status({ name, project, color });
    await status.save();
    res.status(201).json(status);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update a status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const status = await Status.findByIdAndUpdate(id, { name, color }, { new: true });
    if (!status) return res.status(404).json({ error: 'Status not found' });
    res.json(status);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete a status
exports.deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await Status.findByIdAndDelete(id);
    if (!status) return res.status(404).json({ error: 'Status not found' });
    res.json({ message: 'Status deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}; 