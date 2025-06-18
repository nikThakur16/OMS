const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetRoles: [{ type: String, default: ['all'] }], // e.g. ['Employee', 'HR', 'Admin']
});

module.exports = mongoose.model('Announcement', AnnouncementSchema);
