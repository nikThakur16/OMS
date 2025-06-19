

import {
  PersonalDetailsData,
  AddressDetailsData,
  ContactDetailsData,
  BankDetailsData,
} from "../register/page";


export interface AttendanceRecord {
  _id: string;
  employeeId: Employee;
  employeeName: string;
  date: string; 
  checkInTime: number;
  checkOutTime: number;
  status: string;
  workingHours: number;
  breakTime: number;
  currentBreakStartTime: number; 

  overtime: number;
  createdAt: string;
  updatedAt: string;
  sessions: AttendanceSession[];
}

export interface UpdateAttendancePayload {
  type: "checkIn" | "checkOut" | "onBreak" | "back";
  checkInTime?: number;
  checkOutTime?: number;
  workingHours?: number;
  breakTime?: number;
  overtime?: number;
  backTime?: number; 
}


export interface AttendanceMutationResponse {
  message: string;
  attendance: AttendanceRecord; 
}
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
