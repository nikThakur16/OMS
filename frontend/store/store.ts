// store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { api } from "./api";
import SearchSlice from "../reducers/search/SearchSlice";
import LoginSlice from "../reducers/auth/LoginSlice";

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  search: SearchSlice,
  login: LoginSlice,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
