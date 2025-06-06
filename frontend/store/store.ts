import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import SearchSlice from '../reducers/search/SearchSlice';
import LoginSlice from '../reducers/auth/LoginSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    search: SearchSlice,  
    login:LoginSlice, // Add the login slice to the store
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
