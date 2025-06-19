export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponseData {
  message: string;
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    department: string;
    email: string;
    organizationId: string;
  };
}

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: LoginResponseData["user"] | null;
  isLoading: boolean;
  error: string | null;
}
