import {
  PersonalDetailsData,
  AddressDetailsData,
  ContactDetailsData,
  BankDetailsData,
} from "../register/page";
interface Message {
  sender?: string;
  content?: string;
  chatId?: string;
  createdAt?: string;
}
export interface User {
  _id: string; 
  personalDetails: PersonalDetailsData;
  addressDetails: AddressDetailsData;
  bankDetails: BankDetailsData;

  contactDetails: ContactDetailsData;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  lastMessage?: Message;
  lastSeen?: string | Date;
  
}
