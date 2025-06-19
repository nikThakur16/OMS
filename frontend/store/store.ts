// store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage"; // localStorage
import { persistReducer, persistStore } from "redux-persist";

import { api } from "./api";
import SearchSlice from "../reducers/search/SearchSlice";
import LoginSlice from "../reducers/auth/LoginSlice";

// 1. Set up persist config to only save user-login info
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["login"], // persist only login slice
};

// 2. Combine reducers
const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  search: SearchSlice,
  login: LoginSlice,
});

// 3. Wrap with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Configure store with persistor and RTK Query middleware
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(api.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
