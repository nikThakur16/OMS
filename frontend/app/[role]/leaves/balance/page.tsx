'use client';
import React from 'react';
import { useGetLeaveBalanceQuery } from '@/store/api';

interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  remaining: number;
  leaveTypeId: string;
}

const LeaveBalancePage = () => {
  const { data, isLoading, error } = useGetLeaveBalanceQuery();

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-indigo-800">My Leave Balance</h1>
      {isLoading ? (
        <div className="text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-500">Error loading leave balance</div>
      ) : data?.balance?.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <div className="text-gray-400 mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Leave Quotas Found</h3>
          <p className="text-gray-500">Your leave quotas haven&apos;t been set up yet. Please contact HR.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50">
            <tr className="text-xs text-gray-500 uppercase">
                <th className="py-4 px-6">Leave Type</th>
                <th className="py-4 px-6 text-center">Total Days</th>
                <th className="py-4 px-6 text-center">Used Days</th>
                <th className="py-4 px-6 text-center">Remaining Days</th>
                <th className="py-4 px-6 text-center">Usage %</th>
            </tr>
          </thead>
          <tbody>
              {data?.balance?.map((item: LeaveBalance, index: number) => {
                const usagePercentage = Math.round((item.used / item.total) * 100);
                return (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="py-4 px-6 font-semibold text-gray-800">{item.type}</td>
                    <td className="py-4 px-6 text-center">{item.total}</td>
                    <td className="py-4 px-6 text-center text-red-600 font-semibold">{item.used}</td>
                    <td className="py-4 px-6 text-center text-green-600 font-bold text-lg">{item.remaining}</td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${usagePercentage > 80 ? 'bg-red-500' : usagePercentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${usagePercentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">{usagePercentage}%</span>
                      </div>
                    </td>
              </tr>
                );
              })}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
};

export default LeaveBalancePage; 