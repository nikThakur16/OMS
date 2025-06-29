import * as Yup from "yup";

export interface PersonalDetailsData {
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  team?: string[];
  password?: string;
  confirmPassword?: string;
}
export interface AddressDetailsData {
  streetAddress1: string;
  streetAddress2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}
export interface ContactDetailsData {
  email: string;
  primaryPhoneNumber: string;
  alternatePhoneNumber?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  githubUrl?: string;
}
export interface BankDetailsData {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName?: string;
}

export interface RegistrationData {
  personalDetails: PersonalDetailsData;
  addressDetails: AddressDetailsData;
  contactDetails: ContactDetailsData;
  bankDetails: BankDetailsData;
}

export const initialValues: RegistrationData = {
  personalDetails: {
    firstName: "",
    lastName: "",
    role: "",
    department: "",
    team: [],
    password: "",
    confirmPassword: "",
  },
  addressDetails: {
    streetAddress1: "",
    streetAddress2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  },
  contactDetails: {
    email: "",
    primaryPhoneNumber: "",
    alternatePhoneNumber: "",
    linkedinUrl: "",
    websiteUrl: "",
    githubUrl: "",
  },
  bankDetails: {
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
  },
};

export const RegistrationSchema = Yup.object().shape({
  personalDetails: Yup.object().shape({
    firstName: Yup.string().required("First Name is required"),
    lastName: Yup.string().required("Last Name is required"),
    role: Yup.string().required("Role is required"),
    department: Yup.string().required("Department is required"),
    team: Yup.array().of(Yup.string()).optional(),
    password: Yup.string().required("Password is required").min(6, "Too short"),
    confirmPassword: Yup.string()
      .required("Please confirm your password")
      .oneOf([Yup.ref("password")], "Passwords must match"),
  }),
  addressDetails: Yup.object().shape({
    streetAddress1: Yup.string().required("Street Address is required"),
    streetAddress2: Yup.string().optional(),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    zipCode: Yup.string().required("Zip Code is required"),
    country: Yup.string().required("Country is required"),
  }),
  contactDetails: Yup.object().shape({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
    primaryPhoneNumber: Yup.string()
      .required("Primary Phone Number is required")
      .matches(/^[0-9]+$/, {
        message: "contact should be a number",
        excludeEmptyString: true,
      }),
    alternatePhoneNumber: Yup.string()
      .optional()
      .matches(/^[0-9]*$/, {
        message: "Alternate contact should be a number",
        excludeEmptyString: true,
      }),
    linkedinUrl: Yup.string().url("Invalid URL").optional(),
    websiteUrl: Yup.string().url("Invalid URL").optional(),
    githubUrl: Yup.string().url("Invalid URL").optional(),
  }),
  bankDetails: Yup.object().shape({
    accountHolderName: Yup.string().required("Account Holder Name is required"),
    accountNumber: Yup.string().required("Account Number is required"),
    ifscCode: Yup.string().required("IFSC Code is required"),
    bankName: Yup.string().required("Bank Name is required"),
    branchName: Yup.string().optional(),
  }),
});
