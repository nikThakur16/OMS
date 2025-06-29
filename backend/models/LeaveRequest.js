const mongoose = require('mongoose');

const LeaveRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leaveType: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveType', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  days: { type: Number, required: true },
  reason: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
  approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [{
    by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    date: { type: Date, default: Date.now }
  }],
  isHalfDay: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('LeaveRequest', LeaveRequestSchema); 