const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const ProjectSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: "Organization", required: true },
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["active", "archived", "completed", "on-hold"],
      default: "active",
    },
    startDate: Date,
    endDate: Date,
    manager: { type: Types.ObjectId, ref: "User" },
    assignedTo: [{ type: Types.ObjectId, ref: "User" }],
    team: [{ type: Types.ObjectId, ref: "Team" }],
    departments: [{ type: Types.ObjectId, ref: "Department" }],
    customFields: [
      {
        name: { type: String, required: true },
        type: {
          type: String,
          enum: ["text", "number", "date", "select"],
          required: true,
        },
        options: [{ type: String }], // For 'select' type
      },
    ],
    customFieldValues: { type: Schema.Types.Mixed, default: {} },
    slackChannel: String,
    teamsChannel: String,
    deletedAt: { type: Date, default: null },
    archivedAt: { type: Date },
    estimatedHours: Number,
    actualHours: Number,
    hourlyRate: Number,
    budgetedCost: Number,
    actualCost: Number,
    budget: Number,
    currency: String,
  },
  { timestamps: true }
);

// Define all indexes explicitly
ProjectSchema.index({ organizationId: 1, name: 1 }, { unique: true });
ProjectSchema.index({ organizationId: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ deletedAt: 1 });
ProjectSchema.index({ archivedAt: 1 });

ProjectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
});
ProjectSchema.set('toObject', { virtuals: true });
ProjectSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("Project", ProjectSchema);
