import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RegistrationData } from '@/types/register/page';
import {User} from '@/types/users/page';
import { LoginData,LoginResponseData } from '@/types/auth/page';
import { logout } from '@/reducers/auth/LoginSlice';


export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_BACKEND_API_BASE_URL , credentials: 'include'}), // Change if needed
  tagTypes: ['Users'],
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


   


          
  }),
});

export const { useGetUsersQuery, useRegisterMutation ,useLoginMutation ,useLogoutMutation } = api;
