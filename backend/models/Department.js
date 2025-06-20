const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const { protect, authorize } = require("../middleware/authMiddleware");

const DepartmentSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String },
    head: { type: Types.ObjectId, ref: "User" },
    customFields: { type: Schema.Types.Mixed },
    deletedAt: { type: Date, index: true },
    archivedAt: { type: Date, index: true },
  },
  { timestamps: true }
);

DepartmentSchema.index({ organizationId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Department", DepartmentSchema);
