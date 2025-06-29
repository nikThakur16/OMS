const mongoose = require('mongoose');

const ChangeHistorySchema = new mongoose.Schema({
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changedAt: { type: Date, default: Date.now },
  field: String,
  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
});

const LeaveQuotaSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leaveType: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
  year: { type: Number, required: true },
  allocated: { type: Number, required: true },
  used: { type: Number, required: true, default: 0 },
  carriedOver: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  changeHistory: [ChangeHistorySchema],
}, { timestamps: true });

LeaveQuotaSchema.virtual('remaining').get(function() {
  return (this.allocated + this.carriedOver) - this.used;
});

LeaveQuotaSchema.index({ user: 1, leaveType: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('LeaveQuota', LeaveQuotaSchema); 