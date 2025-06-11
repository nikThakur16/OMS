import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RegistrationData } from '@/types/register/page';
import {User} from '@/types/users/page';
import { LoginData,LoginResponseData } from '@/types/auth/page';
import { logout } from '@/reducers/auth/LoginSlice';
import {AttendanceRecord , CheckInPayload, CheckOutPayload, AttendanceMutationResponse} from '@/types/attendance/page'; 

// Define interface for query parameters
interface GetEmployeeAttendanceParams {
    employeeId: string;
    date?: string; // Optional date in YYYY-MM-DD format
    startDate?: string; // Optional start date for range
    endDate?: string;   // Optional end date for range
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL , credentials: 'include'}), // Change if needed
  tagTypes: ['Users', 'Attendance'],
  endpoints: (builder) => ({
    // GET users
    getUsers: builder.query<User[], void>({
      query: () => 'api/auth/users',
      providesTags: ['Users'],
    }),

    // POST: Add user
    register: builder.mutation<any, RegistrationData>({
      query: (registrationData) => ({
        url: 'api/auth/register',
        method: 'POST',
        body: registrationData,
      }),
      invalidatesTags: ['Users'],
    }),
    // POST: Login user
    login:builder.mutation<LoginResponseData,LoginData>({
      query: (loginData) => ({
        url: 'api/auth/login',
        method: 'POST',
        body: loginData,
      }),
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/api/auth/logout',
        method: 'POST',
      }),
    }),
    checkIn: builder.mutation<AttendanceMutationResponse,CheckInPayload>({
      query: (payload) => ({
        url: '/api/attendance/check-in',
        method: 'POST',
        body:payload,
     
      }),
      invalidatesTags: ['Attendance'],
    }),
    checkOut: builder.mutation<AttendanceMutationResponse, CheckOutPayload>({
      query: (payload) => ({
        url: '/api/attendance/check-out',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Attendance'],
    }),
    getAllAttendance: builder.query<AttendanceRecord[], void>({
      query: () => 'api/attendance',
      providesTags: (result) =>
        result
          ? [...result.map(({ _id }) => ({ type: 'Attendance' as const, id: _id })), 'Attendance']
          : ['Attendance'],
    }),
    getEmployeeAttendanceById: builder.query<AttendanceRecord[], GetEmployeeAttendanceParams>({
      query: ({ employeeId, date, startDate, endDate }) => {
        let url = `api/attendance/${employeeId}`;
        const params = new URLSearchParams();
        if (date) params.append('date', date);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        return url;
      },
      providesTags: (result, error, { employeeId }) => [{ type: 'Attendance', id: employeeId }],
    }),
  }),
});

export const { useGetUsersQuery, useRegisterMutation ,useLoginMutation ,useLogoutMutation ,useCheckInMutation,useCheckOutMutation, useGetAllAttendanceQuery, useGetEmployeeAttendanceByIdQuery } = api;
