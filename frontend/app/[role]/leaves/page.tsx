'use client';
import Link from 'next/link';
import { useGetLeaveBalanceQuery, useGetLeaveHistoryQuery, useGetLeaveReportQuery, useGetAllLeaveRequestsQuery } from '@/store/api';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useApproveLeaveMutation, useRejectLeaveMutation, useCancelLeaveMutation } from '@/store/api';
import { PersonalDetailsData } from '@/types/register/page';

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

interface AdminLeaveRequest {
  _id: string;
  user: {
    personalDetails?:PersonalDetailsData
  };
  leaveType?: { name: string };
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  reason?: string;
  isHalfDay?: boolean;
  createdAt: string;
  approver?: {
    personalDetails?:PersonalDetailsData;
    id:string
  }; // Added approver property
}

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LeaveDashboard = () => {
const userRole = useAppSelector((state: RootState) => state.login.user?.role)?.toLowerCase();
  const { data: balanceData, isLoading: balanceLoading } = useGetLeaveBalanceQuery();
  const { data: historyData, isLoading: historyLoading } = useGetLeaveHistoryQuery();
  const { data: reportData, isLoading: reportLoading } = useGetLeaveReportQuery();
  const { data: allLeaveRequestsData } = useGetAllLeaveRequestsQuery(userRole === 'admin' ? { limit: 5, page: 1 } : undefined);
  console.log(allLeaveRequestsData)


  console.log(userRole);

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
    const basePath = `/${userRole}/leaves`;
    const baseLinks = [];
    if (userRole === 'employee') {
      baseLinks.push(
        {
          title: "Apply for Leave",
          path: `${basePath}/apply`,
          icon: "📝",
          description: "Submit a new leave request",
          color: "bg-indigo-600 hover:bg-indigo-700"
        },
        {
          title: "Leave Balance",
          path: `${basePath}/balance`,
          icon: "📊",
          description: "View your leave balance",
          color: "bg-white hover:bg-indigo-50 text-indigo-700"
        },
        {
          title: "Leave History",
          path: `${basePath}/history`,
          icon: "📋",
          description: "See your leave request history",
          color: "bg-white hover:bg-indigo-50 text-indigo-700"
        }
      );
    }
    if (userRole == 'admin' || userRole == 'hr') {
      baseLinks.push(
        {
          title: "Leave Management",
          path: `${basePath}/management`,
          icon: "⚙️",
          description: "Manage all leave requests",
          color: "bg-green-600 hover:bg-green-700 text-white"
        },
        {
          title: "Leave Reports",
          path: `${basePath}/report`,
          icon: "📈",
          description: "View leave statistics and reports",
          color: "bg-purple-600 hover:bg-purple-700 text-white"
        },
        {
          title: "Leave Types & Quotas",
          path: `${basePath}/types-quotas`,
          icon: "🔧",
          description: "Manage leave types and quotas",
          color: "bg-orange-600 hover:bg-orange-700 text-white"
        }
      );
    } else if (userRole == 'manager') {
      baseLinks.push(
        {
          title: "Team Leaves",
          path: `${basePath}/management`,
          icon: "👥",
          description: "View and manage team leave requests",
          color: "bg-green-600 hover:bg-green-700 text-white"
        }
      );
    }
    return baseLinks;
  };

  // Mutation hooks for admin actions
  const [approveLeave] = useApproveLeaveMutation();
  const [rejectLeave] = useRejectLeaveMutation();
  const [cancelLeave] = useCancelLeaveMutation();

  // State for action loading and current action id
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [openReasonId, setOpenReasonId] = useState<string | null>(null);

  // Handle approve/reject/cancel actions
  const handleAction = async (id: string, action: 'approve' | 'reject' | 'cancel') => {
    setActionId(id);
    if (action === 'approve') {
      setIsApproving(true);
      try {
        await approveLeave({ id }).unwrap();
      } catch {
        // Optionally handle error
      }
      setIsApproving(false);
    } else if (action === 'reject') {
      setIsRejecting(true);
      try {
        await rejectLeave({ id }).unwrap();
      } catch {
        // Optionally handle error
      }
      setIsRejecting(false);
    } else if (action === 'cancel') {
      setIsCancelling(true);
      try {
        await cancelLeave(id).unwrap();
      } catch {
        // Optionally handle error
      }
      setIsCancelling(false);
    }
    setActionId(null);
  };

  return (
    <div className="p-6 w-[80vw] bg-white overflow-hidden  min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-indigo-800">Leave Dashboard</h1>
      
      {/* Quick Stats - Only for Employee */}
      {userRole === 'employee' && (
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
      )}

      {/* ADMIN DASHBOARD SECTION */}
      {userRole === 'admin' && (
        <div className="mb-10 w-full">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <div className="text-xs text-gray-500">Total Requests</div>
              <div className="text-2xl font-bold text-indigo-700">{reportLoading ? '...' : reportData?.summary?.total ?? 0}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <div className="text-xs text-gray-500">Approved</div>
              <div className="text-2xl font-bold text-green-600">{reportLoading ? '...' : reportData?.summary?.approved ?? 0}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <div className="text-xs text-gray-500">Pending</div>
              <div className="text-2xl font-bold text-yellow-600">{reportLoading ? '...' : reportData?.summary?.pending ?? 0}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <div className="text-xs text-gray-500">Rejected</div>
              <div className="text-2xl font-bold text-red-600">{reportLoading ? '...' : reportData?.summary?.rejected ?? 0}</div>
            </div>
            <div className="bg-white rounded-xl shadow p-4 text-center">
              <div className="text-xs text-gray-500">Cancelled</div>
              <div className="text-2xl font-bold text-gray-600">{reportLoading ? '...' : reportData?.summary?.cancelled ?? 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Cards - visible for all roles */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-8">
        {getRoleSpecificLinks().map((link, index) => (
          <Link key={index} href={link.path}>
            <div className={`${link.color} rounded-xl shadow p-2 hover:shadow-lg transition-all duration-200 cursor-pointer h-full`}>
              <div className="text-4xl mb-4">{link.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{link.title}</h3>
              <p className="text-sm opacity-90">{link.description}</p>
            </div>
          </Link>
        ))}
      </div>

  
    {/* Recent Leave Requests Table */}
{userRole === 'admin' && (
   <div className="bg-white  rounded-lg shadow-lg overflow-x-auto">
   <table className="  table-auto border-collapse">
      <thead className="bg-[#F2F2F2] sticky top-0">
        <tr>
          <th className="px-4 py-2 text-center whitespace-nowrap w-30 ">User</th>
          <th className="px-4 py-2 text-center whitespace-nowrap w-40">Type</th>
          <th className="px-4 py-2 text-center whitespace-nowrap w-40">Dates</th>
          <th className="px-4 py-2 text-center whitespace-nowrap w-40">Days</th>
          <th className="px-4 py-2 text-center whitespace-nowrap w-40">Status</th>
          <th className="px-4 py-2 text-center whitespace-nowrap w-40">Reason</th>
          <th className="px-4 py-2 text-center whitespace-nowrap w-40">Applied</th>
          <th className="px-4 py-2 text-center whitespace-nowrap w-40">Approver</th>
          <th className="px-4 py-2 text-center ">Actions</th>
        
        </tr>
      </thead>
      <tbody>
        {allLeaveRequestsData?.results?.slice(0, 5).map((req: AdminLeaveRequest) => (
          <tr key={req._id} className="border-b text-center border-gray-200">
            <td className="whitespace-nowrap ">{req.user?.personalDetails?.firstName} {req.user?.personalDetails?.lastName}</td>
            <td className="whitespace-nowrap">{req.leaveType?.name}</td>
            <td className="whitespace-nowrap">{req.isHalfDay ? `${dayjs(req.startDate).format('D MMM YYYY')} (Half Day)` : `${dayjs(req.startDate).format('D MMM YYYY')} - ${dayjs(req.endDate).format('D MMM YYYY')}`}</td>
            <td className="whitespace-nowrap">{req.days}</td>
            <td className={`whitespace-nowrap font-bold ${getStatusColor(req.status)}`}>{req.status}</td>
            <td className="whitespace-nowrap">
              <button
                className="text-indigo-600 underline hover:text-indigo-800"
                onClick={() => setOpenReasonId(req._id)}
                disabled={!req.reason}
              >
                View Reason
              </button>
            </td>
            <td className="whitespace-nowrap">{dayjs(req?.createdAt).format('D MMM YYYY')}</td>
            <td className="whitespace-nowrap">{req.approver?.personalDetails?.firstName   || '-'} {req.approver?.personalDetails?.lastName || "-"}</td>
            <td className="whitespace-nowrap">
              {req.status === 'pending' && (
                <>
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded mr-2 text-xs font-semibold hover:bg-green-600 transition"
                    onClick={() => handleAction(req._id, 'approve')}
                    disabled={isApproving && actionId === req._id}
                  >
                    {isApproving && actionId === req._id ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-red-600 transition"
                    onClick={() => handleAction(req._id, 'reject')}
                    disabled={isRejecting && actionId === req._id}
                  >
                    {isRejecting && actionId === req._id ? 'Rejecting...' : 'Reject'}
                  </button>
                </>
              )}
              {req.status === 'approved' && (
                <button
                  className="bg-gray-500 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-gray-600 transition"
                  onClick={() => handleAction(req._id, 'cancel')}
                  disabled={isCancelling && actionId === req._id}
                >
                  {isCancelling && actionId === req._id ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

)}

{openReasonId && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h2 className="text-lg font-bold mb-4">Leave Reason</h2>
      <p className="mb-6">{allLeaveRequestsData?.results?.find((r: AdminLeaveRequest) => r._id === openReasonId)?.reason || 'No reason provided.'}</p>
      <button
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        onClick={() => setOpenReasonId(null)}
      >
        Close
      </button>
    </div>
  </div>
)}


      {/* Recent Leave Requests - Only for Employee */}
      {userRole === 'employee' && (
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
              <Link href={`/${userRole}/leaves/history`}>
                <span className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer">
                  View All Leave History →
                </span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaveDashboard; 