// frontend/types/attendance/page.ts (You might want to create this new file)


import { PersonalDetailsData ,AddressDetailsData,ContactDetailsData,BankDetailsData} from "../register/page";

// This interface should accurately reflect the structure of your backend Attendance model
export interface AttendanceRecord {
    _id: string;
    employeeId: Employee;
    employeeName: string;
    date: string; // Or Date if you convert it client-side
    checkInTime: number ;
    checkOutTime:  number;
    status: string;
    workingHours: number;
    breakTime: number;
    currentBreakStartTime: number ; // Nullable if the employee is not currently on break
    
 
    overtime: number;
    createdAt: string;
    updatedAt: string;
    sessions: AttendanceSession[];
}

// Define the payload for check-in mutation
export interface UpdateAttendancePayload {
    type: 'checkIn' | 'checkOut' | 'onBreak' | 'back';
    checkInTime?: number;
    checkOutTime?: number;
    workingHours?: number;
    breakTime?: number;
    overtime?: number;
    backTime?: number; // For 'back' action, when the employee returns from break

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


interface Employee {
    personalDetails: PersonalDetailsData;
    addressDetails: AddressDetailsData;
    contactDetails: ContactDetailsData;
    bankDetails: BankDetailsData;
    _id: string;
    organizationId: string;
}
export interface AttendanceData {
    _id: string;
    employeeId: Employee;
    employeeName: string;
    date: string;
    checkInTime: string;
    checkOutTime: string | null;
    status: string;
    workingHours: string;
    breakTime: string;
    overtime: string;
    totalBreakTime: number;
    currentBreakStartTime: number | null;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface AttendanceSession {
  checkIn: string;
  checkOut: string | null;
}
