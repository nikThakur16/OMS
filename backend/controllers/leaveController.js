const LeaveQuota = require('../models/LeaveQuota');
const LeaveRequest = require('../models/LeaveRequest');
const LeaveType = require('../models/LeaveType');
const mongoose = require('mongoose');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const csv = require('csv-parser'); // For bulk import/export
const fs = require('fs');

// Leave Controller - Handles all leave-related logic

// Get leave balance for logged-in user
exports.getLeaveBalance = async (req, res) => {
  try {
    const userId = req.user._id;
    const year = new Date().getFullYear();
    const quotas = await LeaveQuota.find({ user: userId, year }).populate('leaveType');
    const balance = quotas.map(q => ({
      type: q.leaveType.name,
      total: q.total,
      used: q.used,
      remaining: q.total - q.used,
      leaveTypeId: q.leaveType._id
    }));
    res.json({ balance });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leave balance', error: err.message });
  }
};

// Get leave history for logged-in user
exports.getLeaveHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const history = await LeaveRequest.find({ user: userId })
      .populate('leaveType', 'name')
      .sort({ createdAt: -1 });
    res.json({ history });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leave history', error: err.message });
  }
};

// Employee applies for leave
exports.applyForLeave = async (req, res) => {
  try {
    const userId = req.user._id;
    const { leaveTypeId, startDate, endDate, reason, isHalfDay } = req.body;
    if (!leaveTypeId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const leaveType = await LeaveType.findById(leaveTypeId);
    if (!leaveType) {
      return res.status(404).json({ message: 'Leave type not found' });
    }
    const year = new Date(startDate).getFullYear();
    const quota = await LeaveQuota.findOne({ user: userId, leaveType: leaveTypeId, year });
    if (!quota) {
      return res.status(400).json({ message: 'No leave quota set for this type' });
    }
    // Calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    let days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    if (isHalfDay) days = 0.5;
    if (days <= 0) {
      return res.status(400).json({ message: 'Invalid leave duration' });
    }
    if (quota.used + days > quota.total) {
      return res.status(400).json({ message: 'Not enough leave balance' });
    }
    // Create leave request
    const leaveRequest = new LeaveRequest({
      user: userId,
      leaveType: leaveTypeId,
      startDate,
      endDate,
      days,
      reason,
      isHalfDay: !!isHalfDay,
      status: 'pending',
    });
    await leaveRequest.save();
    res.status(201).json({ message: 'Leave request submitted', leaveRequest });
  } catch (err) {
    res.status(500).json({ message: 'Error applying for leave', error: err.message });
  }
};

// Employee cancels their own pending leave
exports.cancelLeave = async (req, res) => {
  try {
    const userId = req.user._id;
    const leaveId = req.params.id;
    const { comment } = req.body;
    const leave = await LeaveRequest.findOne({ _id: leaveId, user: userId });
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    if (leave.status !== 'pending' && leave.status !== 'approved') {
      return res.status(400).json({ message: 'Only pending or approved leave requests can be cancelled' });
    }
    leave.status = 'cancelled';
    if (comment) {
      leave.comments.push({ by: userId, text: comment, date: new Date() });
    }
    await leave.save();
    res.json({ message: 'Leave request cancelled', leave });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling leave', error: err.message });
  }
};

// HR/Admin: Get all leave requests (with filters/search)
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const { status, user, leaveType, startDate, endDate, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (user) filter.user = user;
    if (leaveType) filter.leaveType = leaveType;
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [results, total] = await Promise.all([
      LeaveRequest.find(filter)
        .populate('user', 'personalDetails.firstName personalDetails.lastName email')
        .populate('leaveType', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      LeaveRequest.countDocuments(filter)
    ]);
    res.json({ results, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leave requests', error: err.message });
  }
};

// HR/Admin: Approve a leave request
exports.approveLeave = async (req, res) => {
  try {
    const leaveId = req.params.id;
    const approverId = req.user._id;
    // Make comment optional and default to empty string
    const comment = req.body && typeof req.body.comment === 'string' ? req.body.comment : '';
    const leave = await LeaveRequest.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending leave requests can be approved' });
    }
    leave.status = 'approved';
    leave.approver = approverId;
    if (comment && comment.trim() !== '') {
      leave.comments.push({ by: approverId, text: comment, date: new Date() });
    }
    await leave.save();
    // Update quota used
    const year = new Date(leave.startDate).getFullYear();
    const quotaUpdate = await LeaveQuota.findOneAndUpdate(
      { user: leave.user, leaveType: leave.leaveType, year },
      { $inc: { used: leave.days } }
    );
    if (!quotaUpdate) {
      return res.status(400).json({ message: 'No leave quota found for this user/type/year. Please set up leave quotas.' });
    }
    res.json({ message: 'Leave request approved', leave });
  } catch (err) {
    res.status(500).json({ message: 'Error approving leave', error: err.message });
  }
};

// HR/Admin: Reject a leave request
exports.rejectLeave = async (req, res) => {
  try {
    const leaveId = req.params.id;
    const approverId = req.user._id;
    // Make comment optional and default to empty string
    const comment = req.body && typeof req.body.comment === 'string' ? req.body.comment : '';
    const leave = await LeaveRequest.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending leave requests can be rejected' });
    }
    leave.status = 'rejected';
    leave.approver = approverId;
    if (comment && comment.trim() !== '') {
      leave.comments.push({ by: approverId, text: comment, date: new Date() });
    }
    await leave.save();
    res.json({ message: 'Leave request rejected', leave });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting leave', error: err.message });
  }
};

// HR/Admin: Cancel a leave request (any status except already cancelled)
exports.adminCancelLeave = async (req, res) => {
  try {
    const leaveId = req.params.id;
    const adminId = req.user._id;
    const { comment } = req.body;
    const leave = await LeaveRequest.findById(leaveId);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    if (leave.status === 'cancelled') {
      return res.status(400).json({ message: 'Leave request is already cancelled' });
    }
    // If previously approved, roll back quota
    if (leave.status === 'approved') {
      const year = new Date(leave.startDate).getFullYear();
      await LeaveQuota.findOneAndUpdate(
        { user: leave.user, leaveType: leave.leaveType, year },
        { $inc: { used: -leave.days } }
      );
    }
    leave.status = 'cancelled';
    leave.approver = adminId;
    if (comment) {
      leave.comments.push({ by: adminId, text: comment, date: new Date() });
    }
    await leave.save();
    res.json({ message: 'Leave request cancelled by admin', leave });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling leave', error: err.message });
  }
};

// HR/Admin: Get leave reports/statistics
exports.getLeaveReport = async (req, res) => {
  try {
    // Aggregate overall stats
    const total = await LeaveRequest.countDocuments();
    const approved = await LeaveRequest.countDocuments({ status: 'approved' });
    const pending = await LeaveRequest.countDocuments({ status: 'pending' });
    const rejected = await LeaveRequest.countDocuments({ status: 'rejected' });
    const cancelled = await LeaveRequest.countDocuments({ status: 'cancelled' });

    // Breakdown by leave type
    const byType = await LeaveRequest.aggregate([
      { $group: {
        _id: '$leaveType',
        total: { $sum: 1 },
        approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
      }},
      { $lookup: {
        from: 'leavetypes',
        localField: '_id',
        foreignField: '_id',
        as: 'leaveType'
      }},
      { $unwind: '$leaveType' },
      { $project: {
        _id: 0,
        leaveType: '$leaveType.name',
        total: 1, approved: 1, pending: 1, rejected: 1, cancelled: 1
      }}
    ]);

    // Breakdown by user
    const byUser = await LeaveRequest.aggregate([
      { $group: {
        _id: '$user',
        total: { $sum: 1 },
        approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
      }},
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }},
      { $unwind: '$user' },
      { $project: {
        _id: 0,
        user: {
          firstName: '$user.personalDetails.firstName',
          lastName: '$user.personalDetails.lastName',
          email: '$user.email'
        },
        total: 1, approved: 1, pending: 1, rejected: 1, cancelled: 1
      }}
    ]);

    res.json({
      summary: { total, approved, pending, rejected, cancelled },
      byType,
      byUser
    });
  } catch (err) {
    res.status(500).json({ message: 'Error generating leave report', error: err.message });
  }
};

// Get all leave types
exports.getLeaveTypes = async (req, res) => {
  try {
    const types = await LeaveType.find({ isActive: true });
    // Map defaultQuota to defaultDays for frontend compatibility
    const mappedTypes = types.map(type => ({
      ...type.toObject(),
      defaultDays: type.defaultQuota
    }));
    res.json({ types: mappedTypes });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leave types', error: err.message });
  }
};

// HR/Admin: Create a new leave type
exports.createLeaveType = async (req, res) => {
  try {
    const { name, description, defaultDays } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    // Only block if an active leave type with the same name exists
    const exists = await LeaveType.findOne({ name, isActive: true });
    if (exists) return res.status(400).json({ message: 'Leave type already exists' });
    const leaveType = new LeaveType({ 
      name, 
      description, 
      defaultQuota: defaultDays || 0 
    });
    await leaveType.save();
    // Create LeaveQuota for all non-admin users for the current year
    const currentYear = new Date().getFullYear();
    const users = await User.find({ 'personalDetails.role': { $ne: 'Admin' } });
    const quotas = users.map(user => ({
      user: user._id,
      leaveType: leaveType._id,
      year: currentYear,
      allocated: leaveType.defaultQuota,
      carriedOver: 0,
      used: 0
    }));
    if (quotas.length > 0) {
      await LeaveQuota.insertMany(quotas);
    }
    res.status(201).json({ message: 'Leave type created', leaveType });
  } catch (err) {
    res.status(500).json({ message: 'Error creating leave type', error: err.message });
  }
};

// HR/Admin: Update a leave type
exports.updateLeaveType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isActive, defaultDays } = req.body;
    const leaveType = await LeaveType.findById(id);
    if (!leaveType) return res.status(404).json({ message: 'Leave type not found' });
    if (name && name !== leaveType.name) {
      const exists = await LeaveType.findOne({ name });
      if (exists) return res.status(400).json({ message: 'Leave type name already exists' });
      leaveType.name = name;
    }
    if (description !== undefined) leaveType.description = description;
    if (isActive !== undefined) leaveType.isActive = isActive;
    if (defaultDays !== undefined) leaveType.defaultQuota = defaultDays;
    await leaveType.save();
    res.json({ message: 'Leave type updated', leaveType });
  } catch (err) {
    res.status(500).json({ message: 'Error updating leave type', error: err.message });
  }
};

// HR/Admin: Delete a leave type
exports.deleteLeaveType = async (req, res) => {
  try {
    const { id } = req.params;
    const leaveType = await LeaveType.findById(id);
    if (!leaveType) return res.status(404).json({ message: 'Leave type not found' });
    leaveType.isActive = false;
    await leaveType.save();
    res.json({ message: 'Leave type deleted (soft delete)', leaveType });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting leave type', error: err.message });
  }
};

// HR/Admin: Get all leave quotas (with filters and pagination)
exports.getLeaveQuotas = async (req, res) => {
  try {
    const { user, leaveType, year, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (user) filter.user = user;
    if (leaveType) filter.leaveType = leaveType;
    if (year) filter.year = parseInt(year);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [results, total] = await Promise.all([
      LeaveQuota.find(filter)
        .populate('user', 'personalDetails.firstName personalDetails.lastName email')
        .populate('leaveType', 'name')
        .sort({ year: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      LeaveQuota.countDocuments(filter)
    ]);
    res.json({ results, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leave quotas', error: err.message });
  }
};

// HR/Admin: Update a leave quota (total/used)
exports.updateLeaveQuota = async (req, res) => {
  try {
    const { id } = req.params;
    const { allocated, used, carriedOver } = req.body;
    const userId = req.user._id;
    const quota = await LeaveQuota.findById(id);
    if (!quota) return res.status(404).json({ message: 'Leave quota not found' });
    const oldValue = quota.toObject();
    if (allocated !== undefined) quota.allocated = allocated;
    if (used !== undefined) quota.used = used;
    if (carriedOver !== undefined) quota.carriedOver = carriedOver;
    quota.updatedBy = userId;
    quota.changeHistory.push({ changedBy: userId, field: 'quota', oldValue, newValue: quota.toObject() });
    await quota.save();
    await AuditLog.create({
      action: 'update',
      entityType: 'LeaveQuota',
      entityId: quota._id,
      changedBy: userId,
      oldValue,
      newValue: quota.toObject(),
      details: 'Adjusted leave quota'
    });
    res.json({ message: 'Leave quota updated', quota });
  } catch (err) {
    res.status(500).json({ message: 'Error updating leave quota', error: err.message });
  }
};

// HR/Admin: Create a new leave quota
exports.createLeaveQuota = async (req, res) => {
  try {
    const { user, leaveType, year, allocated, carriedOver } = req.body;
    if (!user || !leaveType || !year || !allocated) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Check if quota already exists
    const exists = await LeaveQuota.findOne({ user, leaveType, year });
    if (exists) {
      return res.status(400).json({ message: 'Leave quota already exists for this user/type/year' });
    }
    const quota = new LeaveQuota({ user, leaveType, year, allocated, carriedOver: carriedOver || 0 });
    await quota.save();
    res.status(201).json({ message: 'Leave quota created', quota });
  } catch (err) {
    res.status(500).json({ message: 'Error creating leave quota', error: err.message });
  }
};

// Manager: Get leave requests from team members
exports.getTeamLeaveRequests = async (req, res) => {
  try {
    const managerId = req.user._id;
    const { status, leaveType, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    // Get the manager's teams
    const manager = await User.findById(managerId).populate('teams');
    if (!manager || !manager.teams || manager.teams.length === 0) {
      return res.json({ results: [], total: 0, page: parseInt(page), limit: parseInt(limit) });
    }
    
    // Get team member IDs
    const teamMemberIds = [];
    for (const team of manager.teams) {
      const teamMembers = await User.find({ teams: team._id }).select('_id');
      teamMemberIds.push(...teamMembers.map(member => member._id));
    }
    
    if (teamMemberIds.length === 0) {
      return res.json({ results: [], total: 0, page: parseInt(page), limit: parseInt(limit) });
    }
    
    // Build filter
    const filter = { user: { $in: teamMemberIds } };
    if (status) filter.status = status;
    if (leaveType) filter.leaveType = leaveType;
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [results, total] = await Promise.all([
      LeaveRequest.find(filter)
        .populate('user', 'personalDetails.firstName personalDetails.lastName contactDetails.email')
        .populate('leaveType', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      LeaveRequest.countDocuments(filter)
    ]);
    
    res.json({ results, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching team leave requests', error: err.message });
  }
};

// --- LEAVE QUOTA MATRIX LIST ---
// GET /api/leave-quotas/matrix?year=2024&department=...&role=...&status=...&leaveType=...
exports.getLeaveQuotaMatrix = async (req, res) => {
  try {
    const { year, department, role, status, leaveType, search } = req.query;
    // Build user filter
    const userFilter = {};
    if (department) userFilter['employmentDetails.department'] = department;
    if (role) userFilter['employmentDetails.role'] = role;
    if (status) userFilter['status'] = status;
    if (search) userFilter['$or'] = [
      { 'personalDetails.firstName': { $regex: search, $options: 'i' } },
      { 'personalDetails.lastName': { $regex: search, $options: 'i' } },
      { 'contactDetails.email': { $regex: search, $options: 'i' } }
    ];
    const users = await User.find(userFilter).select('_id personalDetails employmentDetails contactDetails status');
    const leaveTypeFilter = leaveType ? { _id: leaveType } : {};
    const leaveTypes = await LeaveType.find({ ...leaveTypeFilter, isActive: true });
    const quotas = await LeaveQuota.find({ year: Number(year) }).populate('user').populate('leaveType');
    // Build matrix: { userId: { leaveTypeId: quota } }
    const matrix = {};
    quotas.forEach(q => {
      if (!q.user || !q.leaveType) return; // skip if missing
      if (!matrix[q.user._id]) matrix[q.user._id] = {};
      matrix[q.user._id][q.leaveType._id] = q;
    });
    res.json({ users, leaveTypes, matrix });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching leave quota matrix', error: err.message });
  }
};

// --- ADD QUOTA FOR MISSING USER/TYPE/YEAR ---
// POST /api/leave-quotas
exports.addLeaveQuota = async (req, res) => {
  try {
    const { user, leaveType, year, allocated, carriedOver } = req.body;
    const userId = req.user._id;
    // Prevent duplicate
    const exists = await LeaveQuota.findOne({ user, leaveType, year });
    if (exists) return res.status(400).json({ message: 'Quota already exists for this user/type/year' });
    const quota = new LeaveQuota({ user, leaveType, year, allocated, carriedOver: carriedOver || 0, createdBy: userId, used: 0 });
    await quota.save();
    await AuditLog.create({
      action: 'create',
      entityType: 'LeaveQuota',
      entityId: quota._id,
      changedBy: userId,
      newValue: quota.toObject(),
      details: 'Added new leave quota'
    });
    res.status(201).json({ message: 'Leave quota created', quota });
  } catch (err) {
    res.status(500).json({ message: 'Error creating leave quota', error: err.message });
  }
};

// --- BULK IMPORT (CSV/Excel) ---
// POST /api/leave-quotas/import
exports.bulkImportLeaveQuotas = async (req, res) => {
  // Assume file is uploaded and available as req.file.path
  try {
    const userId = req.user._id;
    const results = [];
    const errors = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', async (row) => {
        try {
          // row: { user, leaveType, year, allocated, carriedOver }
          const exists = await LeaveQuota.findOne({ user: row.user, leaveType: row.leaveType, year: row.year });
          if (exists) {
            errors.push({ row, error: 'Duplicate quota' });
            return;
          }
          const quota = new LeaveQuota({
            user: row.user,
            leaveType: row.leaveType,
            year: row.year,
            allocated: row.allocated,
            carriedOver: row.carriedOver || 0,
            createdBy: userId,
            used: 0
          });
          await quota.save();
          await AuditLog.create({
            action: 'import',
            entityType: 'LeaveQuota',
            entityId: quota._id,
            changedBy: userId,
            newValue: quota.toObject(),
            details: 'Bulk import leave quota'
          });
          results.push(quota);
        } catch (err) {
          errors.push({ row, error: err.message });
        }
      })
      .on('end', () => {
        res.json({ message: 'Bulk import complete', results, errors });
      });
  } catch (err) {
    res.status(500).json({ message: 'Error in bulk import', error: err.message });
  }
};

// --- YEARLY RESET & CARRYOVER LOGIC ---
// Service function to reset quotas at year start
exports.resetYearlyQuotas = async (year) => {
  // For each user and leave type, apply carryover rules and reset allocated
  const leaveTypes = await LeaveType.find({ isActive: true });
  const users = await User.find({});
  for (const leaveType of leaveTypes) {
    for (const user of users) {
      const prevQuota = await LeaveQuota.findOne({ user: user._id, leaveType: leaveType._id, year: year - 1 });
      let carriedOver = 0;
      if (prevQuota) {
        carriedOver = Math.min(
          leaveType.maxCarryover || 0,
          Math.max(0, (prevQuota.allocated + prevQuota.carriedOver) - prevQuota.used)
        );
      }
      // Create or update quota for new year
      let quota = await LeaveQuota.findOne({ user: user._id, leaveType: leaveType._id, year });
      if (!quota) {
        quota = new LeaveQuota({
          user: user._id,
          leaveType: leaveType._id,
          year,
          allocated: leaveType.defaultQuota,
          carriedOver,
          used: 0
        });
      } else {
        quota.allocated = leaveType.defaultQuota;
        quota.carriedOver = carriedOver;
        quota.used = 0;
      }
      await quota.save();
      await AuditLog.create({
        action: 'reset',
        entityType: 'LeaveQuota',
        entityId: quota._id,
        changedBy: null,
        oldValue: prevQuota ? prevQuota.toObject() : null,
        newValue: quota.toObject(),
        details: `Yearly reset for ${year}`
      });
    }
  }
};

// --- AUDIT LOG LISTING ---
// GET /api/leaves/audit-logs?action=&entityType=&user=&entityId=&from=&to=
exports.getAuditLogs = async (req, res) => {
  try {
    const { action, entityType, user, entityId, from, to } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;
    if (user) filter.changedBy = user;
    if (entityId) filter.entityId = entityId;
    if (from || to) filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from);
    if (to) filter.timestamp.$lte = new Date(to);
    const logs = await AuditLog.find(filter).sort({ timestamp: -1 }).limit(200);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching audit logs', error: err.message });
  }
};

// --- AUDIT LOG ROLLBACK ---
// POST /api/leaves/audit-logs/:id/rollback
exports.rollbackAuditLog = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;
    const log = await AuditLog.findById(id);
    if (!log) return res.status(404).json({ message: 'Audit log not found' });
    if (!['update', 'create'].includes(log.action)) return res.status(400).json({ message: 'Rollback only allowed for update/create actions' });
    let entityModel;
    if (log.entityType === 'LeaveQuota') entityModel = require('../models/LeaveQuota');
    else if (log.entityType === 'LeaveType') entityModel = require('../models/LeaveType');
    else return res.status(400).json({ message: 'Rollback not supported for this entity type' });
    // Rollback logic: set entity to oldValue
    const entity = await entityModel.findById(log.entityId);
    if (!entity) return res.status(404).json({ message: 'Entity not found' });
    const oldValue = log.oldValue;
    if (!oldValue) return res.status(400).json({ message: 'No oldValue to rollback to' });
    Object.keys(oldValue).forEach(key => {
      if (key !== '_id') entity[key] = oldValue[key];
    });
    await entity.save();
    await AuditLog.create({
      action: 'rollback',
      entityType: log.entityType,
      entityId: log.entityId,
      changedBy: adminId,
      oldValue: log.newValue,
      newValue: oldValue,
      details: `Rollback via audit log ${id}`
    });
    res.json({ message: 'Rollback successful', entity });
  } catch (err) {
    res.status(500).json({ message: 'Error in rollback', error: err.message });
  }
};

// --- SYNC QUOTAS FOR ALL USERS AND LEAVE TYPES ---
// POST /api/leave-quotas/sync?year=2024
exports.syncQuotas = async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const users = await User.find({ 'personalDetails.role': { $ne: 'Admin' } });
    const leaveTypes = await LeaveType.find({ isActive: true });
    let created = 0;
    for (const user of users) {
      for (const leaveType of leaveTypes) {
        const exists = await LeaveQuota.findOne({ user: user._id, leaveType: leaveType._id, year });
        if (!exists) {
          await LeaveQuota.create({
            user: user._id,
            leaveType: leaveType._id,
            year,
            allocated: leaveType.defaultQuota,
            carriedOver: 0,
            used: 0
          });
          created++;
        }
      }
    }
    res.json({ message: `Sync complete. ${created} quotas created.` });
  } catch (err) {
    res.status(500).json({ message: 'Error syncing quotas', error: err.message });
  }
}; 