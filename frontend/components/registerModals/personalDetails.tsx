'use client';

import React, { useState } from 'react'
// Import Formik types for props
import { FormikErrors, FormikTouched } from 'formik';
// Import the specific type for personalDetails data
// Assuming PersonalDetailsData is defined and exported from your central types file
import { type PersonalDetailsData } from '@/types/register/page'; // ADJUST THIS IMPORT PATH if needed and ensure PersonalDetailsData is exported
import { useGetDepartmentsQuery, useCreateDepartmentMutation, useGetTeamsQuery } from '@/store/api';
import CreateDepartmentModal from '../modals/department/CreateDepartmentModal';
import TeamsMultiSelect from './TeamsMultiSelect';

// Define the props that this component will receive from the parent Formik instance
interface PersonalDetailsFormProps {
   values: PersonalDetailsData;
   errors: FormikErrors<PersonalDetailsData>;
   touched: FormikTouched<PersonalDetailsData>;
   handleChange: (e: React.ChangeEvent<any>) => void;
   handleBlur: (e: React.FocusEvent<any>) => void;
   setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
   showDepartmentModal: boolean;
   setShowDepartmentModal: (open: boolean) => void;
   handleCreateDepartment: (data: { name: string; description?: string }) => void;
}

const PersonalDetails: React.FC<PersonalDetailsFormProps> = ({values, errors, touched, handleChange, handleBlur, setFieldValue, showDepartmentModal, setShowDepartmentModal, handleCreateDepartment}) => {
  const roleOptions = ['Admin', 'Employee', 'HR', 'Manager'];
  const { data: departments, refetch } = useGetDepartmentsQuery();
  const { data: teams } = useGetTeamsQuery();

  return (
    // Outer container with same styling as Address.tsx
    <div className='px-4 bg-white w-full py-8 rounded-lg shadow-md'>
      {/* Heading with same styling as Address.tsx */}
      <h2 className='text-2xl font-bold text-[#175075] mb-6'>Personal Details</h2>
      {/* Inner content container with same styling as Address.tsx */}
      <div className='px-4 py-4'>
        {/* Form layout using responsive grid - structure should match Address.tsx */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full'>

          {/* First Name Field */}
          <div className='flex flex-col'>
            {/* Label styling from Address.tsx */}
            <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="firstName">First Name</label>
            <input
                type="text"
                id="firstName"
                name="personalDetails.firstName"
                placeholder='First Name'
                value={values.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                // Input styling from Address.tsx
                className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075]'
            />
            {errors && touched && errors.firstName && touched.firstName && (
              <div className="text-red-500 text-sm mt-1">{errors.firstName as React.ReactNode}</div>
            )}
          </div>

          {/* Last Name Field */}
          <div className='flex flex-col'>
            {/* Label styling from Address.tsx */}
            <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="lastName">Last Name</label>
            <input
                type="text"
                id="lastName"
                name="personalDetails.lastName"
                placeholder='Last Name'
                value={values.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="off"
                // Input styling from Address.tsx
                className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075]'
            />
            {errors && touched && errors.lastName && touched.lastName && (
              <div className="text-red-500 text-sm mt-1">{errors.lastName as React.ReactNode}</div>
            )}
          </div>

          {/* Role Field - Changed to Select */}
          <div className='flex flex-col'>
             {/* Label styling from Address.tsx */}
             <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="role">Role</label>
              <select // Changed from input to select
                  id="role"
                  name="personalDetails.role"
                  value={values.role}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  // Input styling from Address.tsx
                  className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075] appearance-none' // Added appearance-none for custom arrow
              >
                  <option value="">Select Role</option> {/* Optional: Add a default empty option */}
                  {roleOptions.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
              </select>
               {errors && touched && errors.role && touched.role && (
                  <div className="text-red-500 text-sm mt-1">{errors.role as React.ReactNode}</div>
              )}
          </div>

           {/* Department Field - Changed to Select with Add button */}
           <div className='flex flex-col'>
              <div className='flex items-center justify-between'>
                {/* Label styling from Address.tsx */}
                <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="department">Department</label>
                <button type="button" className="text-indigo-600 text-xs font-semibold" onClick={() => setShowDepartmentModal(true)}>+ Add Department</button>
              </div>
              <select // Changed from input to select
                  id="department"
                  name="personalDetails.department"
                  value={values.department}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  // Input styling from Address.tsx
                  className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075] appearance-none' // Added appearance-none for custom arrow
              >
                  <option value="">Select Department</option> {/* Optional: Add a default empty option */}
                  {departments && departments.map(dept => (
                    <option key={dept._id} value={dept.name}>{dept.name}</option>
                  ))}
              </select>
               {errors && touched && errors.department && touched.department && (
                  <div className="text-red-500 text-sm mt-1">{errors.department as React.ReactNode}</div>
              )}
          </div>

          {/* Team Field - Multi Select Dropdown with Checkboxes */}
          <TeamsMultiSelect
            teams={teams || []}
            value={values.team || []}
            onChange={selected => setFieldValue('personalDetails.team', selected)}
            label="Teams"
          />

          {/* Password Field */}
          <div className='flex flex-col'>
              {/* Label styling from Address.tsx */}
              <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="password">Password</label>
              <input
                  type="password"
                  id="password"
                  name="personalDetails.password"
                  placeholder='Password'
                  value={values.password || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  // Input styling from Address.tsx
                  className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075]'
              />
               {errors && touched && errors.password && touched.password && (
                  <div className="text-red-500 text-sm mt-1">{errors.password as React.ReactNode}</div>
              )}
          </div>

           {/* Confirm Password Field */}
          <div className='flex flex-col'>
               {/* Label styling from Address.tsx */}
               <label className='mb-2 text-md font-semibold text-[#175075] pl-1' htmlFor="confirmPassword">Confirm Password</label>
               <input
                  type="password"
                  id="confirmPassword"
                  name="personalDetails.confirmPassword"
                   placeholder='Confirm Password'
                  value={values.confirmPassword || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  // Input styling from Address.tsx
                  className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#175075]'
              />
               {errors && touched && errors.confirmPassword && touched.confirmPassword && (
                  <div className="text-red-500 text-sm mt-1">{errors.confirmPassword as React.ReactNode}</div>
              )}
          </div>
          {/* Add other personal details fields here */}

        </div>
      </div>
      <CreateDepartmentModal open={showDepartmentModal} onClose={() => setShowDepartmentModal(false)} onCreate={handleCreateDepartment} />
    </div>
  );
};

export default PersonalDetails;