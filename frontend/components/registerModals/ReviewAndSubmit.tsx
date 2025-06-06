'use client';

import React from 'react'
import { type RegistrationData } from '@/types/register/page';

interface ReviewAndSubmitProps {
  data: RegistrationData;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const ReviewAndSubmit = ({ data, onSubmit, isSubmitting }: ReviewAndSubmitProps) => {

  const renderSection = (title: string, details: Record<string, any> | undefined) => {
    if (!details) return null;

    const displayDetails = { ...details };
    if ('password' in displayDetails) delete displayDetails.password;
    if ('confirmPassword' in displayDetails) delete displayDetails.confirmPassword;

    if (Object.keys(displayDetails).length === 0) {
      return null;
    }

    return (
      <div className='mb-8 p-6 bg-[#D3E7F0] rounded-lg shadow-sm'>
        <h3 className='text-xl font-bold text-[#175075] mb-4'>{title}</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4'>
          {Object.entries(displayDetails).map(([key, value]) => (
            <div key={key}>
              <p className='text-md font-semibold text-[#175075]'>{key.replace(/([A-Z])/g, ' $1').trim()}:</p>
              <p className='text-gray-700'>{value !== null && value !== undefined && value !== '' ? String(value) : 'Not provided'}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className='px-4 bg-white w-full py-8 rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold text-[#175075] mb-6'>Review and Submit</h2>
      <div className='px-4 py-4'>
        <p className='mb-8 text-gray-700'>Please review your details before submitting.</p>

        {renderSection('Personal Details', data.personalDetails)}
        {renderSection('Address Details', data.addressDetails)}
        {renderSection('Contact Details', data.contactDetails)}
        {renderSection('Bank Details', data.bankDetails)}

        <div className="flex justify-end mt-8">
          <button
            type="button"
            className="px-6 py-2 bg-[#175075] text-white font-semibold rounded-lg hover:bg-[#0f3a56] focus:outline-none focus:ring-2 focus:ring-[#175075] disabled:opacity-50"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Registration'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReviewAndSubmit