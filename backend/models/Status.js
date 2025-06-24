const mongoose = require('mongoose');

const StatusSchema = new mongoose.Schema({
  name: { type: String, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: false },
  color: { type: String, default: '#cccccc' },
}, { timestamps: true });

module.exports = mongoose.model('Status', StatusSchema); 