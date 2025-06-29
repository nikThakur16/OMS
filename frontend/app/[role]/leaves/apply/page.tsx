'use client';
import React from 'react';
import { useGetLeaveTypesQuery, useApplyForLeaveMutation, useGetLeaveBalanceQuery } from '@/store/api';
import toast from 'react-hot-toast';
import LeaveToast from '@/components/toasts/LeaveToast';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Types
interface LeaveType {
  _id: string;
  name: string;
}

interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  remaining: number;
  leaveTypeId: string;
}

const validationSchema = Yup.object({
  leaveTypeId: Yup.string().required('Leave type is required'),
  startDate: Yup.string().required('Start date is required'),
  endDate: Yup.string().when('isHalfDay', (isHalfDay, schema) =>
    !isHalfDay
      ? schema.required('End date is required')
      : schema
  ),
  reason: Yup.string().required('Reason is required').min(10, 'Reason must be at least 10 characters'),
});

const ApplyLeavePage = () => {
  const { data: typesData, isLoading: typesLoading } = useGetLeaveTypesQuery();
  const { data: balanceData, isLoading: balanceLoading } = useGetLeaveBalanceQuery();
  const [applyLeave, { isLoading: isApplying }] = useApplyForLeaveMutation();
  const [formError, setFormError] = React.useState<string | null>(null);

  const getRemainingDays = (leaveTypeId: string) => {
    if (!balanceData?.balance) return 0;
    const balance = balanceData.balance.find((item: LeaveBalance) => item.leaveTypeId === leaveTypeId);
    return balance ? balance.remaining : 0;
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-indigo-800">Apply for Leave</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leave Application Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Leave Application</h2>
            <Formik
              initialValues={{
                leaveTypeId: '',
                startDate: '',
                endDate: '',
                isHalfDay: false,
                reason: '',
              }}
              validationSchema={validationSchema}
              onSubmit={async (values, { resetForm }) => {
                setFormError(null);
                try {
                  await applyLeave(values).unwrap();
                  toast.custom(<LeaveToast type="success" message="Leave applied successfully!" />);
                  resetForm();
                } catch (err) {
                  const apiMsg = (err as { data?: { message?: string } })?.data?.message;
                  setFormError(apiMsg || 'Failed to apply for leave');
                  toast.custom(<LeaveToast type="error" message={apiMsg || 'Failed to apply for leave'} />);
                }
              }}
            >
              {({ values, setFieldValue }) => (
                <Form className="space-y-4">
                  {formError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {formError}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Leave Type</label>
                    <Field
                      as="select"
                      name="leaveTypeId"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    >
                      <option value="">Select leave type</option>
                      {typesData?.types?.map((type: LeaveType) => (
                        <option key={type._id} value={type._id}>
                          {type.name} ({getRemainingDays(type._id)} days remaining)
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="leaveTypeId" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Start Date</label>
                      <Field
                        type="date"
                        name="startDate"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      />
                      <ErrorMessage name="startDate" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">End Date</label>
                      <Field
                        type="date"
                        name="endDate"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        disabled={values.isHalfDay}
                      />
                      <ErrorMessage name="endDate" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Field
                      type="checkbox"
                      name="isHalfDay"
                      checked={values.isHalfDay}
                      onChange={() => setFieldValue('isHalfDay', !values.isHalfDay)}
                      id="isHalfDay"
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label htmlFor="isHalfDay" className="text-sm font-semibold text-gray-700">Half Day Leave</label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Reason for Leave</label>
                    <Field
                      as="textarea"
                      name="reason"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      rows={4}
                      placeholder="Please provide a detailed reason for your leave request..."
                    />
                    <ErrorMessage name="reason" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:bg-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isApplying || typesLoading}
                  >
                    {isApplying ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Applying...
                      </div>
                    ) : (
                      'Submit Leave Request'
                    )}
                  </button>
                </Form>
              )}
            </Formik>
          </div>

          {/* Leave Balance Information */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">My Leave Balance</h2>
            {balanceLoading ? (
              <div className="text-gray-500 text-center py-8">Loading leave balance...</div>
            ) : balanceData?.balance?.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Leave Quotas Found</h3>
                <p className="text-gray-500">Please contact HR to set up your leave quotas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {balanceData?.balance?.map((item: LeaveBalance, index: number) => {
                  const usagePercentage = Math.round((item.used / item.total) * 100);
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-gray-800">{item.type}</h3>
                        <span className="text-2xl font-bold text-indigo-600">{item.remaining}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        {item.used} of {item.total} days used
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            usagePercentage > 80 ? 'bg-red-500' : 
                            usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${usagePercentage}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-right">{usagePercentage}% used</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeavePage; 