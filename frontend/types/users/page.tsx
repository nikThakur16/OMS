 // Example type definition - adjust based on your actual backend response
 export interface User {
    id: string; // Assuming each user has an ID
    personalDetails: {
      firstName: string;
      lastName: string;
      role: string;
      department: string;
      // Add other personal details properties here
    };
    contactDetails: {
      email: string;
      contact: string; // Assuming contact number is also here
      // Add other contact details properties here
    };
    profile?: string; // Profile image URL, optional
    joinDate?: string; // Join date, optional
    // Add any other top-level user properties
  }