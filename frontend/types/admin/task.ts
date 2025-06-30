export type TaskStatus =
  | "backlog"
  | "todo"
  | "inprogress"
  | "in-review"
  | "blocked"
  | "done"
  | "cancelled";

export type TaskPriority = "low" | "medium" | "high" | "critical";

export type TaskVisibility = "private" | "team" | "department" | "organization" | "public";

// Sub-schemas
export interface TaskAttachment {
  fileName: string;
  url: string;
  uploadedBy: string; // ObjectId
  uploadedAt: Date;
}

export interface TaskComment {
  authorId: string; // ObjectId
  content: string;
  createdAt: Date;
}

export interface TaskActivity {
  userId: string; // ObjectId
  action: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

export interface TaskProgressUpdate {
  date: Date;
  percent: number;
}

export interface TaskSLA {
  dueWarningDays?: number;
  overdueEscalationTo?: string; // ObjectId
}

export interface TaskNotificationSettings {
  reminderIntervals?: number[];
}

// Main Task interface
export interface Task {
  _id: string;
  organizationId: string;
  project: string;
  teamId?: string;
  departmentId?: string;
  title: string;
  description: string;
  tags?: string[];
  createdBy?: string; // ObjectId
  updatedBy?: string; // ObjectId
  assignedTo?: string[]; // ObjectIds
  watchers?: string[]; // ObjectIds
  visibility: TaskVisibility;
  allowedRoles?: string[];
  startDate?: Date;
  dueDate?: Date;
  dueDateTz?: string;
  locale?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
  estimatedHours?: number;
  actualHours?: number;
  hourlyRate?: number;
  budgetedCost?: number;
  actualCost?: number;
  status: TaskStatus;
  priority: TaskPriority;
  workflowStage?: string;
  percentComplete?: number;
  progressUpdates?: TaskProgressUpdate[];
  parentTaskId?: string; // ObjectId
  subtaskIds?: string[]; // ObjectIds
  dependencyTaskIds?: string[]; // ObjectIds
  commentsCount?: number;
  comments?: TaskComment[];
  activityLog?: TaskActivity[];
  attachments?: TaskAttachment[];
  sla?: TaskSLA;
  notificationSettings?: TaskNotificationSettings;
  webhookUrls?: string[];
  slackChannel?: string;
  teamsChannel?: string;
  isTemplate?: boolean;
  templateId?: string; // ObjectId
  customFields?: Record<string, unknown>;
  deletedAt?: Date;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Request types for API calls
export interface CreateTaskRequest {
  project: string;
  title: string;
  description: string;
  dueDate: Date;
  assignedTo?: string[];
  tags?: string[];
  priority?: TaskPriority;
  status?: TaskStatus;
  visibility?: TaskVisibility;
  startDate?: Date;
  estimatedHours?: number;
  budgetedCost?: number;
  teamId?: string;
  departmentId?: string;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  percentComplete?: number;
  actualHours?: number;
  actualCost?: number;
  workflowStage?: string;
}

// Response types
export interface TaskResponse {
  success: boolean;
  data?: Task;
  message?: string;
  error?: string;
}

export interface TasksResponse {
  success: boolean;
  data?: Task[];
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
