// frontend/types/attendance/page.ts (You might want to create this new file)
// This interface should accurately reflect the structure of your backend Attendance model
export interface AttendanceRecord {
    _id: string;
    employeeId: string;
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
export interface CheckInPayload {
    checkInTime: string;
    // employeeId is handled by backend middleware (req.user.id), no need to send from frontend body
}

// Define the payload for check-out mutation
export interface CheckOutPayload {
    checkOutTime: string;
    workingHours: string;
    breakTime: string;
    overtime: string;
    // employeeId is handled by backend middleware
}

// Define the response structure for check-in/check-out mutations
export interface AttendanceMutationResponse {
    message: string;
    attendance: AttendanceRecord; // The created/updated attendance record
}

// You'd import these into your api.ts file:
// import { AttendanceRecord, CheckInPayload, CheckOutPayload, AttendanceMutationResponse } from '@/types/attendance/page';