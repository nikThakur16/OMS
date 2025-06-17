 // Example type definition - adjust based on your actual backend response
 import { PersonalDetailsData ,AddressDetailsData,ContactDetailsData,BankDetailsData} from "../register/page";
 export interface User {
    _id: string; // Assuming each user has an ID
    personalDetails: PersonalDetailsData; // Personal details of the user
    addressDetails: AddressDetailsData; // Address details of the user
    bankDetails: BankDetailsData; // Bank details of the user
  
    contactDetails: ContactDetailsData; // Contact details of the user
    createdAt: string; // Creation date of the user record
    updatedAt: string; // Last update date of the user record
    organizationId: string; // Organization ID to which the user belongs

  }
  