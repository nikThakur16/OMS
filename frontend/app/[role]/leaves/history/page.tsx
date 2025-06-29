'use client';
import React from 'react';
import { useGetLeaveHistoryQuery, useCancelLeaveMutation } from '@/store/api';
import toast from 'react-hot-toast';
import LeaveToast from '@/components/toasts/LeaveToast';
import dayjs from 'dayjs';

interface LeaveRequest {
  _id: string;
  leaveType?: { name: string };
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  reason?: string;
  isHalfDay?: boolean;
  createdAt: string;
  approver?: string;
  comments?: { text: string; date: string }[];
}

const LeaveHistoryPage = () => {
  const { data, isLoading, error, refetch } = useGetLeaveHistoryQuery();
  const [cancelLeave, { isLoading: isCancelling }] = useCancelLeaveMutation();
  const [cancelId, setCancelId] = React.useState<string | null>(null);
  const [cancelError, setCancelError] = React.useState<string | null>(null);
  const [commentModal, setCommentModal] = React.useState<{ id: string } | null>(null);
  const [comment, setComment] = React.useState('');
  const [commentsModal, setCommentsModal] = React.useState<{ comments: { text: string; date: string }[] }>({ comments: [] });
  const [showConfirmModal, setShowConfirmModal] = React.useState<{ id: string } | null>(null);

  const handleCancel = (id: string) => {
    setShowConfirmModal({ id });
  };

  const handleSubmitCancel = async () => {
    if (!commentModal) return;
    setCancelId(commentModal.id);
    setCancelError(null);
    try {
      await cancelLeave(commentModal.id).unwrap();
      toast.custom(<LeaveToast type="success" message="Leave cancelled successfully!" />);
      refetch();
      setCommentModal(null);
    } catch (err: any) {
      setCancelError(err?.data?.message || 'Failed to cancel leave');
      toast.custom(<LeaveToast type="error" message={err?.data?.message || 'Failed to cancel leave'} />);
    } finally {
      setCancelId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { color: 'bg-green-100 text-green-800 border-green-200', icon: '✅' },
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⏳' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', icon: '❌' },
      cancelled: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '🚫' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getLeaveTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'Annual Leave': '🏖️',
      'Sick Leave': '🏥',
      'Casual Leave': '📅',
      'Maternity Leave': '🤱',
      'Paternity Leave': '👨‍👩‍👧‍👦',
      'Bereavement Leave': '🕊️',
      'Study Leave': '📚'
    };
    return icons[type] || '📋';
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-indigo-800">My Leave History</h1>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {cancelError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{cancelError}</p>
                </div>
              </div>
            </div>
          )}

        {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-3 text-gray-600">Loading leave history...</span>
            </div>
        ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Error Loading Leave History</h3>
              <p className="text-gray-500">Please try refreshing the page.</p>
            </div>
          ) : data?.history?.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Leave Requests Found</h3>
              <p className="text-gray-500">You haven&apos;t submitted any leave requests yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Leave Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Applied On
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Comments
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
              </tr>
            </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.history?.map((req: LeaveRequest) => (
                    <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="text-2xl mr-3">
                            {getLeaveTypeIcon(req.leaveType?.name || '')}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {req.leaveType?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {req.isHalfDay ? 
                                `${dayjs(req.startDate).format('MMM DD, YYYY')} (Half Day)` :
                                `${dayjs(req.startDate).format('MMM DD, YYYY')} - ${dayjs(req.endDate).format('MMM DD, YYYY')}`
                              }
                            </div>
                            {req.reason && (
                              <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                                {req.reason}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="font-semibold">{req.days}</span> day{req.days !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(req.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {dayjs(req.createdAt).format('MMM DD, YYYY')}
                      </td>
                      <td className="px-6 py-4">
                      {req.comments && req.comments.length > 0 ? (
                          <button 
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            onClick={() => setCommentsModal({ comments: req.comments || [] })}
                          >
                            View ({req.comments.length})
                        </button>
                      ) : (
                          <span className="text-gray-400 text-sm">No comments</span>
                      )}
                    </td>
                      <td className="px-6 py-4">
                      {(req.status === 'pending' || req.status === 'approved') && (
                        <button
                            className="inline-flex items-center px-3 py-1 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                          onClick={() => handleCancel(req._id)}
                          disabled={isCancelling && cancelId === req._id}
                        >
                            {isCancelling && cancelId === req._id ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-red-700 mr-1"></div>
                                Cancelling...
                              </>
                            ) : (
                              'Cancel'
                            )}
                        </button>
                      )}
                    </td>
                  </tr>
                  ))}
            </tbody>
          </table>
            </div>
        )}
        </div>
      </div>

      {/* Confirm Cancel Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl w-96 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="text-red-500 text-2xl mr-3">⚠️</div>
              <h3 className="font-bold text-lg text-gray-800">Cancel Leave Request</h3>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to cancel this leave request? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                onClick={() => setShowConfirmModal(null)}
              >
                No, Keep It
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                onClick={() => {
                  setShowConfirmModal(null);
                  setComment('');
                  setCommentModal({ id: showConfirmModal.id });
                }}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {commentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl w-96 max-w-md mx-4">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Add Cancellation Comment</h3>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Optional: Add a reason for cancellation..."
            />
            <div className="flex gap-3 justify-end mt-4">
              <button
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                onClick={() => setCommentModal(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                onClick={handleSubmitCancel}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments View Modal */}
      {commentsModal && commentsModal.comments.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl w-96 max-w-md mx-4 max-h-96 overflow-y-auto">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Comments</h3>
            <div className="space-y-3">
              {commentsModal.comments.map((c, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-3 last:border-b-0">
                  <div className="text-sm text-gray-700 mb-1">{c.text}</div>
                  <div className="text-xs text-gray-400">{dayjs(c.date).format('MMM DD, YYYY HH:mm')}</div>
                </div>
              ))}
            </div>
            <button 
              className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              onClick={() => setCommentsModal(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveHistoryPage; 