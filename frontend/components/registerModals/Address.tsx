'use client'

import React from 'react';
import { FormikErrors, FormikTouched } from 'formik';
import { type AddressDetailsData } from '@/types/register/page';


interface AddressFormProps {
  values: AddressDetailsData;
  errors: FormikErrors<AddressDetailsData>;
  touched: FormikTouched<AddressDetailsData>;
  handleChange: (e: React.ChangeEvent<any>) => void;
  handleBlur: (e: React.FocusEvent<any>) => void;
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
}

const Address: React.FC<AddressFormProps> = ({values, errors, touched, handleChange, handleBlur, setFieldValue}) => {
  


  return (
    <div className='px-4 bg-white w-full py-8 rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold text-[#175075] mb-6'>Address Details</h2>
      <div className='px-4 py-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full'>

          <div className='flex flex-col md:col-span-2'>
            <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="streetAddress1">Street Address Line 1</label>
            <input
              type="text"
              id="streetAddress1"
              name="addressDetails.streetAddress1"
              placeholder='eg: 123 Main St'
              value={values.streetAddress1}
              onChange={handleChange}
              onBlur={handleBlur}
          

              className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075]'
            />
            {errors && touched && errors.streetAddress1 && touched.streetAddress1 && (
               <div className="text-red-500 text-sm mt-1">{errors.streetAddress1 as React.ReactNode}</div>
            )}
          </div>

          <div className='flex flex-col md:col-span-2'>
            <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="streetAddress2">Street Address Line 2 (Optional)</label>
            <input
              type="text"
              id="streetAddress2"
              name="addressDetails.streetAddress2"
              placeholder='eg: Apartment, Suite, Unit'
              value={values.streetAddress2 || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075]'
            />
            {errors && touched && errors.streetAddress2 && touched.streetAddress2 && (
               <div className="text-red-500 text-sm mt-1">{errors.streetAddress2 as React.ReactNode}</div>
            )}
          </div>

          <div className='flex flex-col'>
            <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="city">City</label>
            <input
              type="text"
              id="city"
         name='addressDetails.city'
              placeholder='eg: New York'
              value={values.city}
              onChange={handleChange}
              onBlur={handleBlur}
              className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075]'
            />
            {errors && touched && errors.city && touched.city && (
               <div className="text-red-500 text-sm mt-1">{errors.city as React.ReactNode}</div>
            )}
          </div>

          <div className='flex flex-col'>
            <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="state">State / Province</label>
            <input
              type="text"
              id="state"
              name="addressDetails.state"
              placeholder='eg: NY'
              value={values.state}
              onChange={handleChange}
              onBlur={handleBlur}
              className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075]'
            />
            {errors && touched && errors.state && touched.state && (
               <div className="text-red-500 text-sm mt-1">{errors.state as React.ReactNode}</div>
            )}
          </div>

          <div className='flex flex-col'>
            <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="zipCode">ZIP / Postal Code</label>
            <input
              type="text"
              id="zipCode"
              name="addressDetails.zipCode"
              placeholder='eg: 10001'
              value={values.zipCode}
              onChange={handleChange}
              onBlur={handleBlur}
              className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075]'
            />
            {errors && touched && errors.zipCode && touched.zipCode && (
               <div className="text-red-500 text-sm mt-1">{errors.zipCode as React.ReactNode}</div>
            )}
          </div>

          <div className='flex flex-col'>
            <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="country">Country</label>
            <select
              id="country"
              name="addressDetails.country"
              value={values.country}
              onChange={handleChange}
              onBlur={handleBlur}
              className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075] appearance-none'
            >
                <option value="">Select Country</option>
                <option value="US">India</option>
                <option value="CA">Canada</option>
            </select>
            {errors && touched && errors.country && touched.country && (
               <div className="text-red-500 text-sm mt-1">{errors.country as React.ReactNode}</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default Address;