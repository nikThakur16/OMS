'use client';

import React from 'react';
import { FormikErrors, FormikTouched } from 'formik';
import { type BankDetailsData } from '@/types/register/page';

interface BankDetailsFormProps {
   values: BankDetailsData;
   errors: FormikErrors<BankDetailsData>;
   touched: FormikTouched<BankDetailsData>;
   handleChange: (e: React.ChangeEvent<any>) => void;
   handleBlur: (e: React.FocusEvent<any>) => void;
   setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
}

const BankDetails: React.FC<BankDetailsFormProps> = ({
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setFieldValue,
}) => {

  return (
    <div className='px-4 bg-white w-full py-8 rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold text-[#175075] mb-6'>Bank Account Details</h2>
      <div className='px-4 py-4'>
        <div className='grid grid-cols-1 gap-y-6 w-full'>

          <div className='flex flex-col'>
            <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="bankName">Bank Name</label>
            <input
              type="text"
              id="bankName"
              name="bankDetails.bankName"
              placeholder='eg: State Bank of India'
              value={values.bankName}
              onChange={handleChange}
              onBlur={handleBlur}
              className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075]'
            />
            {errors && touched && errors.bankName && touched.bankName && (
               <div className="text-red-500 text-sm mt-1">{errors.bankName as React.ReactNode}</div>
            )}
          </div>

          <div className='flex flex-col'>
            <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="branchName">Branch Name</label>
            <input
              type="text"
              id="branchName"
              name="bankDetails.branchName"
              placeholder='eg: kangra Branch'
              value={values.branchName || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075]'
            />
            {errors && touched && errors.branchName && touched.branchName && (
               <div className="text-red-500 text-sm mt-1">{errors.branchName as React.ReactNode}</div>
            )}
          </div>

          <div className='flex flex-col'>
            <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="accountHolderName">Account Holder Name</label>
            <input
              type="text"
              id="accountHolderName"
              name="bankDetails.accountHolderName"
              placeholder='eg: Nikhil Thakur'
              value={values.accountHolderName}
              onChange={handleChange}
              onBlur={handleBlur}
              className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075]'
            />
            {errors && touched && errors.accountHolderName && touched.accountHolderName && (
               <div className="text-red-500 text-sm mt-1">{errors.accountHolderName as React.ReactNode}</div>
            )}
          </div>

          <div className='flex flex-col'>
            <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="accountNumber">Account Number</label>
            <input
              type="text"
              id="accountNumber"
              name="bankDetails.accountNumber"
              placeholder='eg: 123456789012'
              value={values.accountNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075]'
            />
            {errors && touched && errors.accountNumber && touched.accountNumber && (
               <div className="text-red-500 text-sm mt-1">{errors.accountNumber as React.ReactNode}</div>
            )}
          </div>

          <div className='flex flex-col'>
            <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="ifscCode">IFSC Code</label>
            <input
              type="text"
              id="ifscCode"
              name="bankDetails.ifscCode"
              placeholder='eg: SBIN0000001'
              value={values.ifscCode}
              onChange={handleChange}
              onBlur={handleBlur}
              className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075]'
              maxLength={11}
            />
            {errors && touched && errors.ifscCode && touched.ifscCode && (
               <div className="text-red-500 text-sm mt-1">{errors.ifscCode as React.ReactNode}</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default BankDetails;
