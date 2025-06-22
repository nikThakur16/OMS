// Team Types - Based on backend Team model
export interface Team {
  _id: string;
  organizationId: string;
  name: string;
  description?: string;
  lead?: string; // ObjectId
  members?: string[]; // ObjectIds
  departmentId?: string; // ObjectId
  customFields?: Record<string, unknown>;
  deletedAt?: Date;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Request types for API calls
export interface CreateTeamRequest {
  name: string;
  description?: string;
  lead?: string; // ObjectId
  members?: string[]; // ObjectIds
  departmentId?: string; // ObjectId
  customFields?: Record<string, unknown>;
}

export interface UpdateTeamRequest extends Partial<CreateTeamRequest> {
  // Additional fields that can be updated
  archivedAt?: Date;
}

// Response types
export interface TeamResponse {
  success: boolean;
  data?: Team;
  message?: string;
  error?: string;
}

export interface TeamsResponse {
  success: boolean;
  data?: Team[];
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Team with populated references
export interface TeamWithDetails extends Team {
  leadDetails?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  memberDetails?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }>;
  departmentDetails?: {
    _id: string;
    name: string;
    description?: string;
  };
}

// Team member management
export interface AddTeamMemberRequest {
  userId: string; // ObjectId
  role?: 'lead' | 'member';
}

export interface RemoveTeamMemberRequest {
  userId: string; // ObjectId
} 