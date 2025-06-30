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
import { Project, CreateProjectRequest, UpdateProjectRequest } from "@/types/admin/project";

import { Announcement } from "@/types/admin/announcement";
import { Team } from '@/types/admin/team';
import { Department } from '@/types/admin/department';
import { update } from "lodash";

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
  tagTypes: ["Users", "Attendance", "Announcements", "Tasks", "Projects", "Teams", "Departments"],

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

    createTask: builder.mutation<Task, { data: Partial<Task>, projectId: string }>({
      query: ({ data, projectId }) => ({
        url: `api/projects/${projectId}/tasks`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Tasks"],
    }),

    updateTask: builder.mutation<Task, { id: string; data: Partial<Task> }>({
      query: ({ id, data }) => ({
        url: `api/tasks/${id}`,
        method: "PUT",
        body: {
          ...data,
          _id: id,
        },
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

    updateProject: builder.mutation<Project, { id: string; data: UpdateProjectRequest }>({
      query: ({ id, data }) => ({
        url: `api/projects/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ["Projects", { type: "Projects", id }],
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
      providesTags: (result, error, project) => [{ type: "Tasks", id: project }],
    }),
    createTaskForProject: builder.mutation<Task, { project: string; data: Partial<Task> }>({
      query: ({ project, data }) => ({
        url: `api/projects/${project}/tasks`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { project }) => [{ type: "Tasks", id: project }],
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

    getTaskAssigneesByProject: builder.query<any[], string>({
      query: (projectId) => `api/projects/${projectId}/task-assignees`,
    }),

    // NEW ENDPOINT FOR ASSIGNABLE USERS
    getAssignableUsersByProject: builder.query<User[], string>({
      query: (projectId) => `api/projects/${projectId}/assignable-users`,
      providesTags: (result, error, projectId) => [{ type: 'Users', id: `assignable-${projectId}` }],
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
  useUpdateProjectMutation,
  useCreateDepartmentMutation,
  useUpdateTeamMutation,
  useCreateTeamMutation,
  useGetTasksByProjectQuery,
  useCreateTaskForProjectMutation,
  useGetStatusesQuery,
  useCreateStatusMutation,
  useUpdateStatusMutation,
  useDeleteStatusMutation,
  useGetTaskAssigneesByProjectQuery,
  useGetAssignableUsersByProjectQuery,
} = api;
