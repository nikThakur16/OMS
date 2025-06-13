// frontend/types/attendance/page.ts (You might want to create this new file)

import { User } from "../users/page";

// This interface should accurately reflect the structure of your backend Attendance model
export interface AttendanceRecord {
    _id: string;
    employeeId: string |User;
    employeeName: string;
    date: string; // Or Date if you convert it client-side
    checkInTime: string | null;
    checkOutTime: string | null;
    status: string;
    workingHours: string;
    breakTime: string;
    overtime: string;
    createdAt: string;
    updatedAt: string;
}

// Define the payload for check-in mutation
export interface UpdateAttendancePayload {
    type: 'checkIn' | 'checkOut' | 'onBreak' | 'back';
    checkInTime?: string;
    checkOutTime?: string;
    workingHours?: string;
    breakTime?: string;
    overtime?: string;
    // Add other fields as necessary depending on what your backend expects for each action
    // e.g., employeeId: string; if not derived from auth token
}


// Define the response structure for check-in/check-out mutations
export interface AttendanceMutationResponse {
    message: string;
    attendance: AttendanceRecord; // The created/updated attendance record
}

// You'd import these into your api.ts file:
// import { AttendanceRecord, CheckInPayload, CheckOutPayload, AttendanceMutationResponse } from '@/types/attendance/page';