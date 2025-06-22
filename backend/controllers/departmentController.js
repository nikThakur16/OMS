const Department = require("../models/Department");

// Create Department
exports.createDepartment = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const department = new Department({
      ...req.body,
      organizationId, // Always use from authenticated user
    });
    await department.save();
    res.status(201).json(department);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Departments
exports.getDepartments = async (req, res) => {
  try {
    const filter = { ...req.query };
    const departments = await Department.find(filter);
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ error: "Department not found" });
    res.json(department);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Department
exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!department) return res.status(404).json({ error: "Department not found" });
    res.json(department);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Soft Delete Department
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date() },
      { new: true }
    );
    if (!department) return res.status(404).json({ error: "Department not found" });
    res.json({ message: "Department soft-deleted", department });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
