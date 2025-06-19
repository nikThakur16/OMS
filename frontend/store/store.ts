// store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import { api } from "./api";
import SearchSlice from "../reducers/search/SearchSlice";
import LoginSlice from "../reducers/auth/LoginSlice";

const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  search: SearchSlice,
  login: LoginSlice,
});

const isServer = typeof window === "undefined";
const storage = isServer
  ? createNoopStorage()
  : require("redux-persist/lib/storage").default;

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["login"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(api.middleware),
});

export let persistor: ReturnType<typeof persistStore> | undefined = undefined;
if (!isServer) {
  persistor = persistStore(store);
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
