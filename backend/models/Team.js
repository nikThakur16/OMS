const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const TeamSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: "Organization", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    lead: { type: Types.ObjectId, ref: "User" },
    members: [{ type: Types.ObjectId, ref: "User" }],
    departmentId: { type: Types.ObjectId, ref: "Department" },
    customFields: { type: Schema.Types.Mixed },
    deletedAt: { type: Date, index: true },
    archivedAt: { type: Date, index: true },
  },
  { timestamps: true }
);

TeamSchema.index({ organizationId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Team", TeamSchema);
