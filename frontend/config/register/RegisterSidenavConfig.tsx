
export interface RegisterSidenavItem {
  id: string;
  title: string;
  icon: string;
}


export const registerSidebnavConfig:RegisterSidenavItem[] = [
  {
    id: 'personalDetails',
    title: 'Personal Details',
    icon: '👤'  
    },
    {
    id: 'addressDetails',
    title: 'Address Details',
    icon: '🏠       '
    },
    {
    id: 'contactDetails',
    title: 'Contact Details',
    icon: '📞'
    },
    {
    id: 'bankDetails',
    title: 'Bank Details',
    icon: '🏦   '
    },
    {
    id: 'reviewAndSubmit',
    title: 'Review and Submit',
    icon: '✅'
    }
];