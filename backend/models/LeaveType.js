const mongoose = require('mongoose');

const LeaveTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  defaultQuota: { type: Number, required: true, default: 0 },
  maxCarryover: { type: Number, default: 0 },
  carryoverExpiry: { type: String, default: '03-31' }, // MM-DD format, e.g., March 31
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('LeaveType', LeaveTypeSchema); 