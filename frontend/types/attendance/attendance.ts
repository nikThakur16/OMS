// Attendance Types - Based on backend Attendance model
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half-day' | 'leave' | 'holiday' | 'weekend';

export type AttendanceType = 'check-in' | 'check-out' | 'break-start' | 'break-end';

// Main Attendance interface
export interface Attendance {
  _id: string;
  organizationId: string;
  userId: string; // ObjectId
  date: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  breakStartTime?: Date;
  breakEndTime?: Date;
  totalWorkingHours?: number; // in hours
  totalBreakHours?: number; // in hours
  status: AttendanceStatus;
  notes?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  deviceInfo?: {
    deviceId?: string;
    deviceType?: string;
    browser?: string;
    ipAddress?: string;
  };
  approvedBy?: string; // ObjectId
  approvedAt?: Date;
  customFields?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Request types for API calls
export interface CreateAttendanceRequest {
  date?: Date; // Defaults to current date
  checkInTime?: Date;
  checkOutTime?: Date;
  breakStartTime?: Date;
  breakEndTime?: Date;
  status?: AttendanceStatus;
  notes?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  deviceInfo?: {
    deviceId?: string;
    deviceType?: string;
    browser?: string;
    ipAddress?: string;
  };
  customFields?: Record<string, unknown>;
}

export interface UpdateAttendanceRequest extends Partial<CreateAttendanceRequest> {
  approvedBy?: string; // ObjectId
  approvedAt?: Date;
}

// Check-in/Check-out requests
export interface CheckInRequest {
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  deviceInfo?: {
    deviceId?: string;
    deviceType?: string;
    browser?: string;
    ipAddress?: string;
  };
  notes?: string;
}

export interface CheckOutRequest {
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  deviceInfo?: {
    deviceId?: string;
    deviceType?: string;
    browser?: string;
    ipAddress?: string;
  };
  notes?: string;
}

// Response types
export interface AttendanceResponse {
  success: boolean;
  data?: Attendance;
  message?: string;
  error?: string;
}

export interface AttendancesResponse {
  success: boolean;
  data?: Attendance[];
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Attendance with populated references
export interface AttendanceWithDetails extends Attendance {
  userDetails?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department: string;
  };
  approvedByDetails?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Attendance statistics
export interface AttendanceStats {
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalHalfDay: number;
  totalLeave: number;
  averageWorkingHours: number;
  totalWorkingDays: number;
}

// Attendance report filters
export interface AttendanceFilters {
  userId?: string;
  departmentId?: string;
  teamId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: AttendanceStatus;
  approved?: boolean;
}

// Monthly attendance summary
export interface MonthlyAttendanceSummary {
  userId: string;
  month: number;
  year: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  leaveDays: number;
  totalWorkingHours: number;
  averageWorkingHours: number;
  attendancePercentage: number;
} 