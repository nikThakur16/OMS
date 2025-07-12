import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RegistrationData } from "@/types/register/page";
import { User } from "@/types/users/page";
import { LoginData, LoginResponseData } from "@/types/auth/page";
import {
  AttendanceRecord,
  UpdateAttendancePayload,
  AttendanceMutationResponse,
} from "@/types/attendance/page";
import { Task } from "@/types/admin/task";
import { Project, CreateProjectRequest } from "@/types/admin/project";

import { Announcement } from "@/types/admin/announcement";
import { Team } from '@/types/admin/team';
import { Department } from '@/types/admin/department';

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
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL || "http://localhost:5000",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any)?.login?.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Users", "Attendance", "Announcements", "Tasks", "Projects", "Teams", "Departments", "Leaves"],

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

    getEmployeeDashboard: builder.query<any[], void>({
      query: () => "/api/attendance/employeeDashboard",
      providesTags: ["Attendance"],
    }),

    // ANNOUNCEMENTS
    getAnnouncements: builder.query<Announcement[], void>({
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

    // TASKS
    getTasks: builder.query<Task[], void>({
      query: () => "api/tasks",
      providesTags: ["Tasks"],
    }),

    getTaskById: builder.query<Task, string>({
      query: (id) => `api/tasks/${id}`,
      providesTags: (result, error, id) => [{ type: "Tasks", id }],
    }),

    createTask: builder.mutation<Task, Partial<Task>>({
      query: (data) => ({
        url: "api/tasks",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Tasks"],
    }),

    updateTask: builder.mutation<Task, { id: string; data: Partial<Task> }>({
      query: ({ id, data }) => ({
        url: `api/tasks/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Tasks"],
    }),

    deleteTask: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `api/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tasks"],
    }),

    // PROJECTS
    getProjects: builder.query<Project[], void>({
      query: () => "api/projects",
      providesTags: ["Projects"],
    }),

    getProjectById: builder.query<Project, string>({
      query: (id) => `api/projects/${id}`,
      providesTags: (result, error, id) => [{ type: "Projects", id }],
    }),

    createProject: builder.mutation<Project, CreateProjectRequest>({
      query: (data) => ({
        url: "api/projects",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Projects"],
    }),

    // TEAMS
    getTeams: builder.query<Team[], void>({
      query: () => "api/teams",
      providesTags: ["Teams"],
    }),

    updateTeam: builder.mutation<Team, { id: string; name?: string; description?: string; departmentId?: string; lead?: string; members?: string[] }>({
      query: ({ id, ...data }) => ({
        url: `api/teams/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Teams"],
    }),

    createTeam: builder.mutation<Team, { name: string; description?: string; departmentId?: string }>({
      query: (data) => ({
        url: "api/teams",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Teams"],
    }),

    // DEPARTMENTS
    getDepartments: builder.query<Department[], void>({
      query: () => "api/departments",
      providesTags: ["Departments"],
    }),

    createDepartment: builder.mutation<Department, { name: string; description?: string }>({
      query: (data) => ({
        url: "api/departments",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Departments"],
    }),

    // PROJECT-SCOPED TASKS
    getTasksByProject: builder.query<Task[], string>({
      query: (project) => `api/projects/${project}/tasks`,
      providesTags: ["Tasks"],
    }),
    createTaskForProject: builder.mutation<Task, { project: string; data: Partial<Task> }>({
      query: ({ project, data }) => ({
        url: `api/projects/${project}/tasks`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Tasks"],
    }),

    // STATUSES
    getStatuses: builder.query<any[], { project?: string }>({
      query: ({ project }) => {
        let url = 'api/statuses';
        if (project) url += `?project=${project}`;
        return url;
      },
      providesTags: ['Tasks'], // Optionally add a Statuses tag if you want
    }),
    createStatus: builder.mutation<any, Partial<any>>({
      query: (data) => ({
        url: 'api/statuses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Tasks'],
    }),
    updateStatus: builder.mutation<any, { id: string; data: Partial<any> }>({
      query: ({ id, data }) => ({
        url: `api/statuses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Tasks'],
    }),
    deleteStatus: builder.mutation<any, string>({
      query: (id) => ({
        url: `api/statuses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tasks'],
    }),

    // LEAVES
    getLeaveBalance: builder.query<any, void>({

      query: () => "/api/leaves/balance",
        
      providesTags: ["Leaves"],
    }),
    getLeaveHistory: builder.query<any, void>({
      query: () => "/api/leaves/history",
      providesTags: ["Leaves"],
    }),
    applyForLeave: builder.mutation<any, {
      leaveTypeId: string;
      startDate: string;
      endDate: string;
      reason?: string;
      isHalfDay?: boolean;
    }>({
      query: (data) => ({
        url: "/api/leaves/apply",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Leaves"],
    }),
    cancelLeave: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/leaves/cancel/${id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ["Leaves"],
    }),
    approveLeave: builder.mutation<any, { id: string; comment?: string }>({
      query: ({ id, comment }) => ({
        url: `/api/leaves/approve/${id}`,
        method: 'PATCH',
        body: comment ? { comment } : undefined,
      }),
      invalidatesTags: ["Leaves"],
    }),
    rejectLeave: builder.mutation<any, { id: string; comment?: string }>({
      query: ({ id, comment }) => ({
        url: `/api/leaves/reject/${id}`,
        method: 'PATCH',
        body: comment ? { comment } : undefined,
      }),
      invalidatesTags: ["Leaves"],
    }),
    adminCancelLeave: builder.mutation<any, { id: string; comment?: string }>({
      query: ({ id, comment }) => ({
        url: `/api/leaves/admin-cancel/${id}`,
        method: 'PATCH',
        body: comment ? { comment } : undefined,
      }),
      invalidatesTags: ["Leaves"],
    }),
    getLeaveReport: builder.query<any, void>({
      query: () => "/api/leaves/report",
      providesTags: ["Leaves"],
    }),
    getAllLeaveRequests: builder.query<any, any>({
      query: (filters) => {
        // Filter out empty values
        const cleanFilters = filters ? Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
        ) : {};
        const search = new URLSearchParams(cleanFilters).toString();
        return `/api/leaves/requests${search ? `?${search}` : ''}`;
      },
      providesTags: ["Leaves"],
    }),
    getTeamLeaveRequests: builder.query<any, any>({
      query: (filters) => {
        // Filter out empty values
        const cleanFilters = filters ? Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
        ) : {};
        const search = new URLSearchParams(cleanFilters).toString();
        return `/api/leaves/team${search ? `?${search}` : ''}`;
      },
      providesTags: ["Leaves"],
    }),
    getLeaveTypes: builder.query<any, void>({
      query: () => "/api/leaves/types",
      providesTags: ["Leaves"],
    }),
    // LEAVE TYPES
    createLeaveType: builder.mutation<any, { name: string; description?: string; defaultDays?: number }>({
      query: (data) => ({
        url: '/api/leaves/types',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Leaves'],
    }),
    updateLeaveType: builder.mutation<any, { id: string; name: string; description?: string; defaultDays?: number }>({
      query: ({ id, ...data }) => ({
        url: `/api/leaves/types/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Leaves'],
    }),
    deleteLeaveType: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/leaves/types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Leaves'],
    }),
    // LEAVE QUOTAS
    updateLeaveQuota: builder.mutation<any, { id: string; total: number; used: number }>({
      query: ({ id, ...data }) => ({
        url: `/api/leaves/quotas/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Leaves'],
    }),
    getLeaveQuotas: builder.query<any, any>({
      query: (params) => {
        // Filter out empty values
        const cleanParams = params ? Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
        ) : {};
        const search = Object.keys(cleanParams).length > 0 ? `?${new URLSearchParams(cleanParams).toString()}` : '';
        return `/api/leaves/quotas${search}`;
      },
      providesTags: ['Leaves'],
    }),
    createLeaveQuota: builder.mutation<any, { user: string; leaveType: string; year: number; allocated: number; carriedOver?: number }>({
      query: (data) => ({
        url: '/api/leaves/quotas',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Leaves'],
    }),

    // USER ROLE MANAGEMENT
    updateUserRole: builder.mutation<any, { userId: string; role: string }>({
      query: ({ userId, role }) => ({
        url: `/api/users/${userId}/role`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: ['Users'],
    }),

    searchUsers: builder.query<User[], string>({
      query: (q) => `/api/users/search?q=${encodeURIComponent(q)}`,
      providesTags: ["Users"],
    }),

    // LEAVE QUOTA MATRIX
    getLeaveQuotaMatrix: builder.query<any, { year: number; department?: string; role?: string; status?: string; leaveType?: string; search?: string }>({
      query: (params) => {
        const cleanParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined));
        const search = Object.keys(cleanParams).length > 0 ? `?${new URLSearchParams(cleanParams as any).toString()}` : '';
        return `/api/leaves/quotas/matrix${search}`;
      },
      providesTags: ['Leaves'],
    }),
    // BULK IMPORT LEAVE QUOTAS
    bulkImportLeaveQuotas: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: '/api/leaves/quotas/import',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Leaves'],
    }),
    // AUDIT LOGS
    getAuditLogs: builder.query<any, any>({
      query: (params) => {
        const search = params ? `?${new URLSearchParams(params).toString()}` : '';
        return `/api/leaves/audit-logs${search}`;
      },
      providesTags: ['Leaves'],
    }),
    rollbackAuditLog: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/leaves/audit-logs/${id}/rollback`,
        method: 'POST',
      }),
      invalidatesTags: ['Leaves'],
    }),
    syncLeaveQuotas: builder.mutation<any, { year?: number }>({
      query: ({ year }) => ({
        url: '/api/leave-quotas/quotas/sync',
        method: 'POST',
      }),
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
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useGetTeamsQuery,
  useGetDepartmentsQuery,
  useCreateProjectMutation,
  useCreateDepartmentMutation,
  useUpdateTeamMutation,
  useCreateTeamMutation,
  useGetTasksByProjectQuery,
  useCreateTaskForProjectMutation,
  useGetStatusesQuery,
  useCreateStatusMutation,
  useUpdateStatusMutation,
  useDeleteStatusMutation,
  useGetLeaveBalanceQuery,
  useGetLeaveHistoryQuery,
  useApplyForLeaveMutation,
  useCancelLeaveMutation,
  useApproveLeaveMutation,
  useRejectLeaveMutation,
  useAdminCancelLeaveMutation,
  useGetLeaveReportQuery,
  useGetAllLeaveRequestsQuery,
  useGetLeaveTypesQuery,
  useCreateLeaveTypeMutation,
  useUpdateLeaveTypeMutation,
  useDeleteLeaveTypeMutation,
  useUpdateLeaveQuotaMutation,
  useGetLeaveQuotasQuery,
  useCreateLeaveQuotaMutation,
  useGetTeamLeaveRequestsQuery,
  useUpdateUserRoleMutation,
  useSearchUsersQuery,
  useGetLeaveQuotaMatrixQuery,
  useBulkImportLeaveQuotasMutation,
  useGetAuditLogsQuery,
  useRollbackAuditLogMutation,
  useSyncLeaveQuotasMutation,
} = api;
