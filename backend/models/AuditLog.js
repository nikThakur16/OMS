const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., 'create', 'update', 'delete', 'reset', 'import'
  entityType: { type: String, required: true }, // e.g., 'LeaveQuota', 'LeaveType'
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  details: { type: String },
});

module.exports = mongoose.model('AuditLog', AuditLogSchema); 