// Path: OMS/frontend/store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginResponseData } from '@/types/auth/page'; // Import types

// Try to load token and user data from localStorage on app startup
const loadAuthState = (): AuthState => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  // You might also store user data in localStorage and parse it here
  // const user = typeof window !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
   const user = null; // For now, we'll rely on the login response for user data

  return {
    token,
    isAuthenticated: !!token, // True if a token exists
    user, // Initialize user as null
    isLoading: false,
    error: null,
  };
};

const initialState: AuthState = loadAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action to set credentials (token and user data) after successful login
    setCredentials(state, action: PayloadAction<LoginResponseData>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null; // Clear any previous errors
      // Optionally store user data in localStorage if needed across sessions
      // localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    // Action to clear credentials on logout
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      // Clear credentials from localStorage
      localStorage.removeItem('token');
      // localStorage.removeItem('user');
    },
    // You might add reducers for setting loading or error states manually if needed,
    // but RTK Query's isLoading and error often suffice for the login process itself.
  },
  // You can also use extraReducers to handle the pending/fulfilled/rejected states
  // from the login mutation if you want to manage loading/error state within this slice
  // instead of directly in the component.
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;