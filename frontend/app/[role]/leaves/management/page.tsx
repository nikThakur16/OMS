'use client';
import React, { useState, useEffect } from 'react';
import {
  useGetAllLeaveRequestsQuery,
  useGetTeamLeaveRequestsQuery,
  useApproveLeaveMutation,
  useRejectLeaveMutation,
  useAdminCancelLeaveMutation,
  useSearchUsersQuery,
  useGetLeaveTypesQuery
} from '@/store/api';
import toast from 'react-hot-toast';
import LeaveToast from '@/components/toasts/LeaveToast';
import dayjs from 'dayjs';

const LeaveManagementPage = () => {
  const [filters, setFilters] = useState({ status: '', user: '',leaveType: '', startDate: '', endDate: '' });
  const [pendingFilters, setPendingFilters] = useState({ status: '', user: '', leaveType: '', startDate: '', endDate: '' });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userDropdown, setUserDropdown] = useState(false);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-search-container')) {
        setUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Get user role from localStorage
  useEffect(() => {
    const role = localStorage.getItem('role')?.toLowerCase();
    setUserRole(role || null);
  }, []);

  // Use different queries based on role
  const { data: allLeavesData, isLoading: allLeavesLoading, error: allLeavesError, refetch: refetchAllLeaves } = useGetAllLeaveRequestsQuery(filters, { skip: userRole !== 'admin' && userRole !== 'hr' });
  const { data: teamLeavesData, isLoading: teamLeavesLoading, error: teamLeavesError, refetch: refetchTeamLeaves } = useGetTeamLeaveRequestsQuery(filters, { skip: userRole !== 'manager' });
  const { data: userOptions, isLoading: userSearchLoading } = useSearchUsersQuery(userSearch, { skip: !userSearch || userRole === 'manager' });
  const { data: leaveTypes } = useGetLeaveTypesQuery();

  // Use the appropriate data based on role
  const data = userRole === 'manager' ? teamLeavesData : allLeavesData;
  const isLoading = userRole === 'manager' ? teamLeavesLoading : allLeavesLoading;
  const error = userRole === 'manager' ? teamLeavesError : allLeavesError;
  const refetch = userRole === 'manager' ? refetchTeamLeaves : refetchAllLeaves;

  const [approveLeave, { isLoading: isApproving }] = useApproveLeaveMutation();
  const [rejectLeave, { isLoading: isRejecting }] = useRejectLeaveMutation();
  const [adminCancelLeave, { isLoading: isCancelling }] = useAdminCancelLeaveMutation();
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [commentModal, setCommentModal] = useState<{ id: string; action: 'approve' | 'reject' | 'cancel' } | null>(null);
  const [comment, setComment] = useState('');
  const [reasonModal, setReasonModal] = useState<{ reason: string; userName: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPendingFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleAction = (id: string, action: 'approve' | 'reject' | 'cancel') => {
    setComment('');
    setCommentModal({ id, action });
  };

  const handleViewReason = (reason: string, userName: string) => {
    setReasonModal({ reason, userName });
  };

  const handleSubmitAction = async () => {
    if (!commentModal) return;
    setActionId(commentModal.id);
    setActionError(null);
    try {
      if (commentModal.action === 'approve') {
        await approveLeave({ id: commentModal.id, comment }).unwrap();
        toast.custom(<LeaveToast type="success" message="Leave approved!" />);
      } else if (commentModal.action === 'reject') {
        await rejectLeave({ id: commentModal.id, comment }).unwrap();
        toast.custom(<LeaveToast type="success" message="Leave rejected!" />);
      } else if (commentModal.action === 'cancel') {
        await adminCancelLeave({ id: commentModal.id, comment }).unwrap();
        toast.custom(<LeaveToast type="success" message="Leave cancelled!" />);
      }
      refetch();
      setCommentModal(null);
    } catch (err: unknown) {
      const errorMessage = err && typeof err === 'object' && 'data' in err && err.data && typeof err.data === 'object' && 'message' in err.data 
        ? String(err.data.message) 
        : 'Failed to perform action';
      setActionError(errorMessage);
      toast.custom(<LeaveToast type="error" message={errorMessage} />);
    } finally {
      setActionId(null);
    }
  };

  const getPageTitle = () => {
    switch (userRole) {
      case 'manager':
        return 'Team Leave Management';
      case 'hr':
        return 'HR Leave Management';
      case 'admin':
        return 'Admin Leave Management';
      default:
        return 'Leave Management';
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-indigo-800">{getPageTitle()}</h1>
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold mb-1">Status</label>
          <select name="status" value={pendingFilters.status} onChange={handleChange} className="border rounded px-2 py-1">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        {userRole !== 'manager' && (
          <div className="relative user-search-container">
            <label className="block text-xs font-semibold mb-1">Employee (Name/Email)</label>
            <input
              type="text"
              value={userSearch}
              onChange={e => {
                const value = e.target.value;
                setUserSearch(value);
                setUserDropdown(true);
                // Allow direct typing for search
                if (value.trim()) {
                  setPendingFilters(prev => ({ ...prev, user: value }));
                } else {
                  setPendingFilters(prev => ({ ...prev, user: '' }));
                }
              }}
              onFocus={() => setUserDropdown(true)}
              className="border rounded px-2 py-1 w-48"
              placeholder="Search employee..."
              autoComplete="off"
            />
            {userDropdown && userSearch && (
              <div className="absolute z-10 bg-white border rounded shadow w-48 max-h-48 overflow-y-auto">
                {userSearchLoading ? (
                  <div className="p-2 text-gray-400">Searching...</div>
                ) : userOptions && userOptions.length > 0 ? (
                  userOptions.map(user => (
                    <div
                      key={user._id}
                      className="p-2 hover:bg-indigo-50 cursor-pointer text-sm"
                      onClick={() => {
                        setPendingFilters(prev => ({ ...prev, user: user.personalDetails.firstName + ' ' + user.personalDetails.lastName }));
                        setUserSearch(user.personalDetails.firstName + ' ' + user.personalDetails.lastName + ' (' + user.contactDetails.email + ')');
                        setUserDropdown(false);
                      }}
                    >
                      <span className="font-semibold">{user.personalDetails.firstName} {user.personalDetails.lastName}</span> <span className="text-gray-400">({user.contactDetails.email})</span>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-400">No users found</div>
                )}
              </div>
            )}
          
          </div>
        )}
        <div>
          <label className="block text-xs font-semibold mb-1">Leave Type (ID)</label>
          <select
            name="leaveType"
            value={pendingFilters.leaveType}
            onChange={handleChange}
            className="border rounded px-2 py-1"
          >
            <option value="">All Types</option>
            {leaveTypes?.types?.map((type: { _id: string; name: string }) => (
              <option key={type._id} value={type._id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Start Date</label>
          <input type="date" name="startDate" value={pendingFilters.startDate} onChange={handleChange} className="border rounded px-2 py-1" />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">End Date</label>
          <input type="date" name="endDate" value={pendingFilters.endDate} onChange={handleChange} className="border rounded px-2 py-1" />
        </div>
        <button className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700 transition font-semibold" onClick={() => setFilters(pendingFilters)}>Filter</button>
        <button className="ml-2 bg-gray-200 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-300 transition font-semibold" onClick={() => { 
          setFilters({ status: '', user: '', leaveType: '', startDate: '', endDate: '' }); 
          setPendingFilters({ status: '', user: '', leaveType: '', startDate: '', endDate: '' }); 
          setUserSearch('');
          setUserDropdown(false);
        }}>Clear All</button>
      </div>
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        {actionError && <div className="text-red-600 mb-2">{actionError}</div>}
        {isLoading ? (
          <div className="text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-red-500">Error loading leave requests</div>
        ) : (
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="text-xs text-gray-500 uppercase text-center">
                <th className="py-2 w-1/10">User</th>
                <th className="w-1/10">Type</th>
                <th className="w-2/10">Dates</th>
                <th className="w-1/10">Days</th>
                <th className="w-1/10">Status</th>
                <th className="w-1/10">Reason</th>
                <th className="w-1/10">Applied</th>
                <th className="w-1/10">Approver</th>
                <th className="w-1/10">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.results?.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-gray-400 py-4">No leave requests found.</td></tr>
              ) : (
                data?.results?.map((req: {
                  _id: string;
                  user?: {
                    personalDetails?: {
                      firstName?: string;
                      lastName?: string;
                    };
                  };
                  leaveType?: {
                    name?: string;
                  };
                  startDate: string;
                  endDate: string;
                  days: number;
                  status: string;
                  reason?: string;
                  createdAt: string;
                  approver?: {
                    personalDetails?: {
                      firstName?: string;
                      lastName?: string;
                    };
                  };
                  isHalfDay?: boolean;
                }) => (
                  <tr key={req._id} className="border-b border-gray-200 hover:bg-blue-50 transition text-center">
                    <td className="align-middle">{req.user?.personalDetails?.firstName} {req.user?.personalDetails?.lastName}</td>
                    <td className="align-middle">{req.leaveType?.name}</td>
                    <td className="align-middle">{req.isHalfDay ? `${dayjs(req.startDate).format('D MMM YYYY')} (Half Day)` : `${dayjs(req.startDate).format('D MMM YYYY')} - ${dayjs(req.endDate).format('D MMM YYYY')}`}</td>
                    <td className="align-middle">{req.days}</td>
                    <td className={`font-bold align-middle ${req.status === 'approved' ? 'text-green-600' : req.status === 'pending' ? 'text-yellow-600' : req.status === 'rejected' ? 'text-red-600' : 'text-gray-500'}`}>{req.status}</td>
                    <td className="align-middle">
                      {req.reason ? (
                        <button
                          className="text-blue-600 hover:text-blue-800 underline text-xs font-semibold"
                          onClick={() => handleViewReason(req.reason!, `${req.user?.personalDetails?.firstName || ''} ${req.user?.personalDetails?.lastName || ''}`.trim())}
                        >
                          View Reason
                        </button>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="align-middle">{dayjs(req.createdAt).format('D MMM YYYY')}</td>
                    <td className="align-middle">{req.approver?.personalDetails?.firstName   || '-'} {req.approver?.personalDetails?.lastName || "-"}</td>
                    <td className="align-middle">
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
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      {commentModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl w-96">
            <h3 className="font-bold mb-2 capitalize">{commentModal.action} Leave</h3>
            <label className="block mb-2 text-sm">Comment (optional)</label>
            <textarea
              className="border rounded px-2 py-1 w-full mb-2"
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Enter a comment (optional)"
            />
            <div className="flex gap-2 mt-2">
              <button
                className="bg-indigo-600 text-white px-4 py-1 rounded font-semibold"
                onClick={handleSubmitAction}
                disabled={isApproving || isRejecting || isCancelling}
              >
                {isApproving || isRejecting || isCancelling ? 'Processing...' : 'Submit'}
              </button>
              <button
                className="bg-gray-200 px-4 py-1 rounded"
                onClick={() => setCommentModal(null)}
                disabled={isApproving || isRejecting || isCancelling}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Reason Modal */}
      {reasonModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl w-96 max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Leave Reason</h3>
              <button
                onClick={() => setReasonModal(null)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-semibold">Employee:</span> {reasonModal.userName}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-800 whitespace-pre-wrap">{reasonModal.reason}</p>
            </div>
            <div className="flex justify-end">
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded font-semibold hover:bg-indigo-700 transition"
                onClick={() => setReasonModal(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagementPage; 