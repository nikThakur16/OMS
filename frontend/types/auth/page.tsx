
export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponseData{
    message: string;
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    department: string;
    email: string;
    organizationId: string; // Matches the response
    // Add any other user properties returned by your backend
  };

}
// Type for the state we might store in a Redux auth slice
export interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    user: LoginResponseData['user'] | null; // Store the user details from the response
    isLoading: boolean; // To track if login is in progress
    error: string | null; // To store login error messages
  }
