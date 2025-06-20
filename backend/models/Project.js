const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const ProjectSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["active", "archived", "completed", "on-hold"],
      default: "active",
      index: true,
    },
    startDate: Date,
    endDate: Date,
    manager: { type: Types.ObjectId, ref: "User" },
    teamIds: [{ type: Types.ObjectId, ref: "Team" }],
    departmentIds: [{ type: Types.ObjectId, ref: "Department" }],
    customFields: { type: Schema.Types.Mixed },
    deletedAt: { type: Date, index: true },
    archivedAt: { type: Date, index: true },
  },
  { timestamps: true }
);

ProjectSchema.index({ organizationId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Project", ProjectSchema);
