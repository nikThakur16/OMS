const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

// ─── Sub‑schemas ────────────────────────────────────────────────────────────────
const AttachmentSchema = new Schema({
  fileName: { type: String, required: true },
  url: { type: String, required: true },
  uploadedBy: { type: Types.ObjectId, ref: "User", required: true },
  uploadedAt: { type: Date, default: Date.now },
});

const CommentSchema = new Schema({
  authorId: { type: Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const ActivitySchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  details: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
});

// ─── Main Task Schema ──────────────────────────────────────────────────────────
const TaskSchema = new Schema(
  {
    organizationId: { type: Types.ObjectId, ref: "Organization", required: true, index: true },
    projectId: { type: Types.ObjectId, ref: "Project", required: true, index: true },
    teamId: { type: Types.ObjectId, ref: "Team", index: true },
    departmentId: { type: Types.ObjectId, ref: "Department", index: true },
    title: { type: String, required: true, trim: true, index: "text" },
    description: { type: String, required: true, index: "text" },
    tags: [{ type: String, index: true }],
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    assignedTo: [{ type: Types.ObjectId, ref: "User", index: true }],
    watchers: [{ type: Types.ObjectId, ref: "User" }],
    visibility: {
      type: String,
      enum: ["private", "team", "department", "organization", "public"],
      default: "team",
      index: true,
    },
    allowedRoles: [{ type: String }],
    startDate: Date,
    dueDate: { type: Date, required: true, index: true },
    dueDateTz: String,
    locale: String,
    isRecurring: { type: Boolean, default: false },
    recurrenceRule: String,
    estimatedHours: Number,
    actualHours: Number,
    hourlyRate: Number,
    budgetedCost: Number,
    actualCost: Number,
    status: {
      type: String,
      enum: [
        "backlog",
        "todo",
        "in-progress",
        "in-review",
        "blocked",
        "done",
        "cancelled",
      ],
      default: "backlog",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true,
    },
    workflowStage: String,
    percentComplete: Number,
    progressUpdates: [
      {
        date: Date,
        percent: Number,
      },
    ],
    parentTaskId: { type: Types.ObjectId, ref: "Task", index: true },
    subtaskIds: [{ type: Types.ObjectId, ref: "Task" }],
    dependencyTaskIds: [{ type: Types.ObjectId, ref: "Task" }],
    commentsCount: { type: Number, default: 0 },
    comments: [CommentSchema],
    activityLog: [ActivitySchema],
    attachments: [AttachmentSchema],
    sla: {
      dueWarningDays: { type: Number, default: 0 },
      overdueEscalationTo: { type: Types.ObjectId, ref: "User" },
    },
    notificationSettings: {
      reminderIntervals: [Number],
    },
    webhookUrls: [String],
    slackChannel: String,
    teamsChannel: String,
    isTemplate: { type: Boolean, default: false },
    templateId: { type: Types.ObjectId, ref: "Task" },
    customFields: { type: Schema.Types.Mixed },
    deletedAt: { type: Date, index: true },
    archivedAt: { type: Date, index: true },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

TaskSchema.index({ projectId: 1 });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ organizationId: 1 });
TaskSchema.index({ teamId: 1 });
TaskSchema.index({ departmentId: 1 });
TaskSchema.index({ deletedAt: 1 });
TaskSchema.index({ archivedAt: 1 });
TaskSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Task", TaskSchema);
