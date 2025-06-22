// Announcement Types - Based on backend Announcement model
export interface Announcement {
  _id: string;
  organizationId: string;
  title: string;
  content: string;
  author: string; // ObjectId
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience?: string[]; // ObjectIds (users, departments, teams)
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  attachments?: Array<{
    fileName: string;
    url: string;
    uploadedBy: string; // ObjectId
    uploadedAt: Date;
  }>;
  readBy?: string[]; // ObjectIds of users who read it
  customFields?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Request types for API calls
export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience?: string[]; // ObjectIds
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
  attachments?: Array<{
    fileName: string;
    url: string;
  }>;
  customFields?: Record<string, unknown>;
}

export interface UpdateAnnouncementRequest extends Partial<CreateAnnouncementRequest> {
  readBy?: string[]; // ObjectIds
}

// Response types
export interface AnnouncementResponse {
  success: boolean;
  data?: Announcement;
  message?: string;
  error?: string;
}

export interface AnnouncementsResponse {
  success: boolean;
  data?: Announcement[];
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Announcement with populated references
export interface AnnouncementWithDetails extends Announcement {
  authorDetails?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  targetAudienceDetails?: Array<{
    _id: string;
    firstName?: string;
    lastName?: string;
    name?: string; // For departments/teams
    email?: string;
  }>;
  readByDetails?: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    readAt?: Date;
  }>;
}

// Announcement filters
export interface AnnouncementFilters {
  isActive?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  author?: string; // ObjectId
  targetAudience?: string; // ObjectId
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

// Mark as read request
export interface MarkAsReadRequest {
  announcementId: string;
  userId: string;
}

// Announcement statistics
export interface AnnouncementStats {
  totalAnnouncements: number;
  activeAnnouncements: number;
  urgentAnnouncements: number;
  totalReads: number;
  averageReadRate: number;
} 