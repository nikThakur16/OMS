// User Types - Based on backend User model
export type UserRole = 'Admin' | 'Employee' | 'HR' | 'Manager';

export type UserDepartment = 
  | 'Sales' 
  | 'Marketing' 
  | 'ReactJS' 
  | 'NodeJS' 
  | 'Python' 
  | 'Java'
  | 'ReactNative' 
  | 'Laravel' 
  | 'Other' 
  | 'Frontend' 
  | 'Backend' 
  | 'Fullstack';

// Personal Details
export interface PersonalDetails {
  firstName: string;
  lastName: string;
  role: UserRole;
  department: UserDepartment;
}

// Address Details
export interface AddressDetails {
  streetAddress1: string;
  streetAddress2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Contact Details
export interface ContactDetails {
  email: string;
  primaryPhoneNumber: string;
  alternatePhoneNumber?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  githubUrl?: string;
}

// Bank Details
export interface BankDetails {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName?: string;
}

// Main User interface
export interface User {
  _id: string;
  personalDetails: PersonalDetails;
  organizationId: string;
  addressDetails: AddressDetails;
  contactDetails: ContactDetails;
  bankDetails: BankDetails;
  password: string; // Only for create/update, not for responses
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  updatedAt: Date;
  teams: string[]; // Array of team IDs the user belongs to
  projects: string[]; // Array of project IDs the user is associated with
}

// Request types for API calls
export interface CreateUserRequest {
  personalDetails: PersonalDetails & {
    password: string;
    confirmPassword: string;
  };
  addressDetails: AddressDetails;
  contactDetails: ContactDetails;
  bankDetails: BankDetails;
}

export interface UpdateUserRequest {
  personalDetails?: Partial<PersonalDetails>;
  addressDetails?: Partial<AddressDetails>;
  contactDetails?: Partial<ContactDetails>;
  bankDetails?: Partial<BankDetails>;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Response types
export interface UserResponse {
  success: boolean;
  data?: User;
  message?: string;
  error?: string;
}

export interface UsersResponse {
  success: boolean;
  data?: User[];
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User for display (without sensitive data)
export interface UserDisplay {
  _id: string;
  personalDetails: PersonalDetails;
  organizationId: string;
  addressDetails: AddressDetails;
  contactDetails: {
    email: string;
    primaryPhoneNumber: string;
    alternatePhoneNumber?: string;
    linkedinUrl?: string;
    websiteUrl?: string;
    githubUrl?: string;
  };
  bankDetails: {
    accountHolderName: string;
    bankName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// User profile (for current user)
export interface UserProfile extends UserDisplay {
  // Additional fields for current user
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
}

// User summary (for lists, dropdowns, etc.)
export interface UserSummary {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  department: UserDepartment;
  fullName: string; // Computed field
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserProfile;
  error?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
} 