import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RegistrationData } from "@/types/register/page";
import { User } from "@/types/users/page";
import { LoginData, LoginResponseData } from "@/types/auth/page";
import {
  AttendanceRecord,
  UpdateAttendancePayload,
  AttendanceMutationResponse,
} from "@/types/attendance/page";

// Optional: to support query string building
interface GetEmployeeAttendanceParams {
  employeeId: string | undefined;
  date?: string;
  startDate?: string;
  endDate?: string;
}

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any)?.login?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Users", "Attendance", "Announcements"],

  endpoints: (builder) => ({
    // USERS
    getUsers: builder.query<User[], void>({
      query: () => "api/auth/users",
      providesTags: ["Users"],
    }),

    getUserById: builder.query<User[], string>({
      query: (id) => `api/users/${id}`,
      providesTags: (result, error, id) => [{ type: "Users", id }],
    }),

    register: builder.mutation<any, RegistrationData>({
      query: (registrationData) => ({
        url: "api/auth/register",
        method: "POST",
        body: registrationData,
      }),
      invalidatesTags: ["Users"],
    }),

    login: builder.mutation<LoginResponseData, LoginData>({
      query: (loginData) => ({
        url: "api/auth/login",
        method: "POST",
        body: loginData,
      }),
    }),

    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/api/auth/logout",
        method: "POST",
      }),
    }),

    // ATTENDANCE
    getAllAttendance: builder.query<AttendanceRecord[], string | void>({
      query: (date) =>
        date ? `api/attendance?date=${date}` : "api/attendance",
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Attendance" as const,
                id: _id,
              })),
              "Attendance",
            ]
          : ["Attendance"],
    }),

    updateAttendance: builder.mutation<
      AttendanceMutationResponse,
      UpdateAttendancePayload
    >({
      query: (payload) => ({
        url: "/api/attendance/update",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Attendance"],
    }),

    getEmployeeAttendanceById: builder.query<
      AttendanceRecord[],
      GetEmployeeAttendanceParams
    >({
      query: ({ employeeId, date, startDate, endDate }) => {
        let url = `api/attendance/${employeeId}`;
        const params = new URLSearchParams();
        if (date) params.append("date", date);
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        return url;
      },
      providesTags: (result, error, { employeeId }) => [
        { type: "Attendance", id: employeeId },
      ],
    }),

    getEmployeeDashboard: builder.query<any, void>({
      query: () => "/api/attendance/employeeDashboard",
      providesTags: ["Attendance"],
    }),

    // ANNOUNCEMENTS
    getAnnouncements: builder.query<any[], void>({
      query: () => "api/announcements",
      providesTags: ["Announcements"],
    }),

    createAnnouncement: builder.mutation<any, Partial<any>>({
      query: (data) => ({
        url: "api/announcements",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Announcements"],
    }),

    deleteAnnouncement: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `api/announcements/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Announcements"],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useUpdateAttendanceMutation,
  useGetAllAttendanceQuery,
  useGetEmployeeAttendanceByIdQuery,
  useGetUserByIdQuery,
  useGetEmployeeDashboardQuery,
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useDeleteAnnouncementMutation,
} = api;
