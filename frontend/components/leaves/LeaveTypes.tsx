'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useGetLeaveBalanceQuery, useGetLeaveHistoryQuery } from '@/store/api';

interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  remaining: number;
  leaveTypeId: string;
}

interface LeaveHistory {
  _id: string;
  leaveType?: { name: string };
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  reason?: string;
  isHalfDay?: boolean;
  createdAt: string;
}

const LeaveDashboard = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const { data: balanceData, isLoading: balanceLoading } = useGetLeaveBalanceQuery();
  const { data: historyData, isLoading: historyLoading } = useGetLeaveHistoryQuery();

  useEffect(() => {
    const role = localStorage.getItem('role')?.toLowerCase();
    setUserRole(role || null);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleSpecificLinks = () => {
    const baseLinks = [
      {
        title: "Apply for Leave",
        path: "/leaves/apply",
        icon: "📝",
        description: "Submit a new leave request",
        color: "bg-indigo-600 hover:bg-indigo-700"
      },
      {
        title: "Leave Balance",
        path: "/leaves/balance",
        icon: "📊",
        description: "View your leave balance",
        color: "bg-white hover:bg-indigo-50 text-indigo-700"
      },
      {
        title: "Leave History",
        path: "/leaves/history",
        icon: "📋",
        description: "See your leave request history",
        color: "bg-white hover:bg-indigo-50 text-indigo-700"
      }
    ];

    if (userRole === 'admin' || userRole === 'hr') {
      baseLinks.push(
        {
          title: "Leave Management",
          path: "/leaves/management",
          icon: "⚙️",
          description: "Manage all leave requests",
          color: "bg-green-600 hover:bg-green-700 text-white"
        },
        {
          title: "Leave Reports",
          path: "/leaves/report",
          icon: "📈",
          description: "View leave statistics and reports",
          color: "bg-purple-600 hover:bg-purple-700 text-white"
        },
        {
          title: "Leave Types & Quotas",
          path: "/leaves/types-quotas",
          icon: "🔧",
          description: "Manage leave types and quotas",
          color: "bg-orange-600 hover:bg-orange-700 text-white"
        }
      );
    } else if (userRole === 'manager') {
      baseLinks.push(
        {
          title: "Team Leaves",
          path: "/leaves/management",
          icon: "👥",
          description: "View and manage team leave requests",
          color: "bg-green-600 hover:bg-green-700 text-white"
        }
      );
    }

    return baseLinks;
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-indigo-800">Leave Dashboard</h1>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Leave Balance</h3>
          {balanceLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <div className="text-3xl font-bold text-indigo-600">
              {balanceData?.balance?.reduce((sum: number, item: LeaveBalance) => sum + item.remaining, 0) || 0} days
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Pending Requests</h3>
          {historyLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <div className="text-3xl font-bold text-yellow-600">
              {historyData?.history?.filter((item: LeaveHistory) => item.status === 'pending').length || 0}
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Approved This Year</h3>
          {historyLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : (
            <div className="text-3xl font-bold text-green-600">
              {historyData?.history?.filter((item: LeaveHistory) => 
                item.status === 'approved' && 
                new Date(item.createdAt).getFullYear() === new Date().getFullYear()
              ).length || 0}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {getRoleSpecificLinks().map((link, index) => (
          <Link key={index} href={link.path}>
            <div className={`${link.color} rounded-xl shadow p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-full`}>
              <div className="text-4xl mb-4">{link.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{link.title}</h3>
              <p className="text-sm opacity-90">{link.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Leave Requests */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-indigo-800">Recent Leave Requests</h2>
        {historyLoading ? (
          <div className="text-gray-500">Loading...</div>
        ) : historyData?.history?.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No leave requests found.</div>
        ) : (
          <div className="space-y-4">
            {historyData?.history?.slice(0, 5).map((item: LeaveHistory) => (
              <div key={item._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">📅</div>
                  <div>
                    <div className="font-semibold">{item.leaveType?.name}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  <span className="text-sm text-gray-600">{item.days} days</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {historyData?.history?.length > 5 && (
          <div className="mt-4 text-center">
            <Link href="/leaves/history">
              <span className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer">
                View All Leave History →
              </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveDashboard; 