// Department Types - Based on backend Department model
export interface Department {
  _id: string;
  organizationId: string;
  name: string;
  description?: string;
  head?: string; // ObjectId
  customFields?: Record<string, unknown>;
  deletedAt?: Date;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Request types for API calls
export interface CreateDepartmentRequest {
  name: string;
  description?: string;
  head?: string; // ObjectId
  customFields?: Record<string, unknown>;
}

export interface UpdateDepartmentRequest extends Partial<CreateDepartmentRequest> {
  // Additional fields that can be updated
  archivedAt?: Date;
}

// Response types
export interface DepartmentResponse {
  success: boolean;
  data?: Department;
  message?: string;
  error?: string;
}

export interface DepartmentsResponse {
  success: boolean;
  data?: Department[];
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Department with populated references
export interface DepartmentWithDetails extends Department {
  headDetails?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Department statistics
export interface DepartmentStats {
  totalEmployees: number;
  totalTeams: number;
  totalProjects: number;
  totalTasks: number;
} 