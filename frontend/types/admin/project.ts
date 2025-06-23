// Project Types - Based on backend Project model
export type ProjectStatus = "active" | "archived" | "completed" | "on-hold";
interface personalDetails {
  firstName: string;
  lastName: string;
  role: string;
  department: string;
}
interface manager {
  personalDetails: personalDetails;
  _id: string;
}

// Main Project interface
export interface Project {
  _id: string;
  organizationId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  manager?: manager; // ObjectId
  team?: object[]; // ObjectIds
  departments?: string[]; // ObjectIds
  customFields?: Record<string, unknown>;
  deletedAt?: Date;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Request types for API calls
export interface CreateProjectRequest {
  name: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: Date;
  endDate?: Date;
  manager?: object; // ObjectId
  team?: object[]; // ObjectIds
  departments?: string[]; // ObjectIds
  customFields?: Record<string, unknown>;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  // Additional fields that can be updated
  archivedAt?: Date;
}

// Response types
export interface ProjectResponse {
  success: boolean;
  data?: Project;
  message?: string;
  error?: string;
}

export interface ProjectsResponse {
  success: boolean;
  data?: Project[];
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Project statistics
export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  progress: number;
}

// Project with populated references
export interface ProjectWithDetails extends Project {
  managerDetails?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  teamDetails?: Array<{
    _id: string;
    name: string;
    description?: string;
  }>;
  departmentDetails?: Array<{
    _id: string;
    name: string;
    description?: string;
  }>;
} 