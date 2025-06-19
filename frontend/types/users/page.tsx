import {
  PersonalDetailsData,
  AddressDetailsData,
  ContactDetailsData,
  BankDetailsData,
} from "../register/page";
export interface User {
  _id: string; 
  personalDetails: PersonalDetailsData;
  addressDetails: AddressDetailsData;
  bankDetails: BankDetailsData;

  contactDetails: ContactDetailsData;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
}
