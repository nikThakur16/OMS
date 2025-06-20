export type TaskStatus =
  | "backlog"
  | "todo"
  | "in-progress"
  | "in-review"
  | "blocked"
  | "done"
  | "cancelled";

export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string[];
  dueDate: string;
  createdBy: string;
  organizationId: string;
  projectId?: string;
  projectName?: string;
  teamId?: string;
  teamName?: string;
  departmentId?: string;
  departmentName?: string;
  tags?: string[];
  commentsCount?: number;
  percentComplete?: number;
  createdAt: string;
  updatedAt: string;
}
