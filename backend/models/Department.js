const mongoose = require("mongoose");
const { Schema, Types } = mongoose;
const { protect, authorize } = require("../middleware/authMiddleware");

const DepartmentSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: "Organization", required: true },
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String },
    head: { type: Types.ObjectId, ref: "User" },
    customFields: { type: Schema.Types.Mixed },
    deletedAt: { type: Date },
    archivedAt: { type: Date },
  },
  { timestamps: true }
);

// Define all indexes explicitly
DepartmentSchema.index({ organizationId: 1, name: 1 }, { unique: true });
DepartmentSchema.index({ organizationId: 1 });
DepartmentSchema.index({ deletedAt: 1 });
DepartmentSchema.index({ archivedAt: 1 });

module.exports = mongoose.model("Department", DepartmentSchema);
