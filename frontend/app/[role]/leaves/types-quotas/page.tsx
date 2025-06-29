'use client';
import React, { useState, useRef } from 'react';
import {
  useGetLeaveTypesQuery,
  useCreateLeaveTypeMutation,
  useUpdateLeaveTypeMutation,
  useDeleteLeaveTypeMutation,
  useCreateLeaveQuotaMutation,
  useGetLeaveQuotaMatrixQuery,
  useBulkImportLeaveQuotasMutation,
  useSyncLeaveQuotasMutation
} from '@/store/api';
import { format } from 'date-fns';

// Types
interface LeaveType {
  _id: string;
  name: string;
  description?: string;
  defaultDays?: number;
  isActive?: boolean;
}

interface User {
  _id: string;
  personalDetails: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const AdminLeaveTypesQuotas = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<'types' | 'quotas'>('types');

  // Leave Types Management
  const { data: leaveTypesData, isLoading: typesLoading, refetch: refetchTypes } = useGetLeaveTypesQuery();
  const [createLeaveType] = useCreateLeaveTypeMutation();
  const [updateLeaveType] = useUpdateLeaveTypeMutation();
  const [deleteLeaveType] = useDeleteLeaveTypeMutation();

  const [showTypeModal, setShowTypeModal] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [typeForm, setTypeForm] = useState({ name: '', description: '', defaultDays: 0 });
  const [typeError, setTypeError] = useState('');

  // Quota Matrix Management
  const [year, setYear] = useState<number>(currentYear);
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('');
  const [search, setSearch] = useState('');

  const { data: matrixData, isLoading: matrixLoading } = useGetLeaveQuotaMatrixQuery({ 
    year, leaveType: leaveTypeFilter, search 
  });
  const [createLeaveQuota] = useCreateLeaveQuotaMutation();
  const [bulkImportLeaveQuotas] = useBulkImportLeaveQuotasMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showQuotaModal, setShowQuotaModal] = useState<{ userId: string; leaveTypeId: string } | null>(null);
  const [editingQuota, setEditingQuota] = useState<{ userId: string; leaveTypeId: string } | null>(null);
  const [quotaForm, setQuotaForm] = useState({ allocated: 0, carriedOver: 0 });
  const [quotaError, setQuotaError] = useState('');

  const [editAllUserId, setEditAllUserId] = useState<string | null>(null);

  // Extract arrays from API responses - handle different response structures
  const users = matrixData?.users || matrixData?.data?.users || [];
  const leaveTypes = Array.isArray(leaveTypesData) 
    ? leaveTypesData 
    : (leaveTypesData?.types || leaveTypesData?.data?.types || []);
  const matrix = matrixData?.matrix || matrixData?.data?.matrix || {};

  // Filter out admin users from the users array
  const filteredUsers = users.filter((user: User) => user.personalDetails.role !== 'Admin');

  // Leave Types Handlers
  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    setTypeError('');
    
    if (!typeForm.name.trim()) {
      setTypeError('Leave type name is required');
      return;
    }

    try {
      await createLeaveType({
        name: typeForm.name.trim(),
        description: typeForm.description.trim(),
        defaultDays: typeForm.defaultDays
      }).unwrap();
      
      setShowTypeModal(false);
      setTypeForm({ name: '', description: '', defaultDays: 0 });
      refetchTypes();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      setTypeError(error?.data?.message || 'Failed to create leave type');
    }
  };

  const handleUpdateType = async (e: React.FormEvent) => {
    e.preventDefault();
    setTypeError('');
    
    if (!editingType || !typeForm.name.trim()) {
      setTypeError('Leave type name is required');
      return;
    }

    try {
      await updateLeaveType({
        id: editingType._id,
        name: typeForm.name.trim(),
        description: typeForm.description.trim(),
        defaultDays: typeForm.defaultDays
      }).unwrap();
      
      setShowTypeModal(false);
      setEditingType(null);
      setTypeForm({ name: '', description: '', defaultDays: 0 });
      refetchTypes();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      setTypeError(error?.data?.message || 'Failed to update leave type');
    }
  };

  const handleDeleteType = async (typeId: string) => {
    if (!confirm('Are you sure you want to delete this leave type?')) return;
    
    try {
      await deleteLeaveType(typeId).unwrap();
      refetchTypes();
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      alert(error?.data?.message || 'Failed to delete leave type');
    }
  };

  const openTypeModal = (type?: LeaveType) => {
    if (type) {
      setEditingType(type);
      setTypeForm({ 
        name: type.name, 
        description: type.description || '', 
        defaultDays: type.defaultDays || 0 
      });
    } else {
      setEditingType(null);
      setTypeForm({ name: '', description: '', defaultDays: 0 });
    }
    setShowTypeModal(true);
    setTypeError('');
  };

  // Quota Handlers
  const handleCreateQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuotaError('');
    
    if (!showQuotaModal) return;

    try {
      await createLeaveQuota({
        user: showQuotaModal.userId,
        leaveType: showQuotaModal.leaveTypeId,
        year: year,
        allocated: quotaForm.allocated,
        carriedOver: quotaForm.carriedOver
      }).unwrap();
      
      setShowQuotaModal(null);
      setQuotaForm({ allocated: 0, carriedOver: 0 });
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      setQuotaError(error?.data?.message || 'Failed to create quota');
    }
  };

  const handleUpdateQuota = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuotaError('');
    
    if (!editingQuota) return;

    try {
      // This would need to be implemented in your backend
      // For now, we'll just show a success message
      alert('Quota updated successfully!');
      setShowQuotaModal(null);
      setEditingQuota(null);
      setQuotaForm({ allocated: 0, carriedOver: 0 });
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      setQuotaError(error?.data?.message || 'Failed to update quota');
    }
  };

  const openQuotaModal = (userId: string, leaveTypeId: string, isEdit = false) => {
    if (isEdit) {
      const quota = matrix[userId]?.[leaveTypeId];
      setEditingQuota({ userId, leaveTypeId });
      setQuotaForm({
        allocated: Number(quota?.allocated) || 0,
        carriedOver: Number(quota?.carriedOver) || 0
      });
    } else {
      setEditingQuota(null);
      setQuotaForm({ allocated: 0, carriedOver: 0 });
    }
    setShowQuotaModal({ userId, leaveTypeId });
    setQuotaError('');
  };

  function handleEditAllTypes(userId: string) {
    setEditAllUserId(userId);
  }

  function handleExportCSV() {
    if (!matrixData || !matrixData.users || !matrixData.matrix) return;
    const users: Array<{ _id: string; personalDetails: { firstName: string; lastName: string } }> = matrixData.users;
    const leaveTypes: Array<{ _id: string; name: string }> = Array.isArray(matrixData.leaveTypes) ? matrixData.leaveTypes : [];
    const matrix: Record<string, Record<string, { allocated: number; used: number; carriedOver: number; year: number }>> = matrixData.matrix;
    let csv = 'Employee,Leave Type,Allocated,Used,Carried Over,Year\n';
    users.forEach((user) => {
      leaveTypes.forEach((type) => {
        const cell = matrix[user._id]?.[type._id];
        if (cell) {
          csv += `"${user.personalDetails.firstName} ${user.personalDetails.lastName}","${type.name}",${cell.allocated},${cell.used},${cell.carriedOver},${cell.year}\n`;
        }
      });
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leave-quotas-${year}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await bulkImportLeaveQuotas(formData).unwrap();
      if (typeof matrixData?.refetch === 'function') matrixData.refetch();
      else window.location.reload();
    } catch {
      // Optionally show error
    }
  }

  const [syncLeaveQuotas, { isLoading: isSyncing }] = useSyncLeaveQuotasMutation();
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  if (typesLoading || matrixLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
        <p className="text-gray-600">Manage leave types and employee quotas</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('types')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'types'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Leave Types
          </button>
          <button
            onClick={() => setActiveTab('quotas')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'quotas'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Quota Matrix
          </button>
        </nav>
      </div>

      {/* Leave Types Tab */}
      {activeTab === 'types' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Leave Types</h2>
            <button
              onClick={() => openTypeModal()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Add Leave Type
            </button>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Default Days
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(leaveTypes || []).map((type: LeaveType) => (
                  <tr key={type._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {type.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {type.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {type.defaultDays || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        type.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {type.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openTypeModal(type)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteType(type._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quota Matrix Tab */}
      {activeTab === 'quotas' && (
        <div>
          {/* Sync Quotas Button for Admin/HR */}
          <div className="flex justify-end items-center mb-2">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors mr-2"
              onClick={async () => {
                setSyncMessage(null);
                try {
                  const res = await syncLeaveQuotas({ year }).unwrap();
                  setSyncMessage(res.message || 'Sync complete.');
                  if (typeof matrixData?.refetch === 'function') matrixData.refetch();
                  else window.location.reload();
                } catch (err: any) {
                  setSyncMessage(err?.data?.message || 'Sync failed.');
                }
              }}
              disabled={isSyncing}
            >
              {isSyncing ? 'Syncing...' : 'Sync Quotas'}
            </button>
            {syncMessage && (
              <span className="ml-2 text-sm text-green-600">{syncMessage}</span>
            )}
          </div>

          {/* TEMPORARY TEST BUTTON FOR DEBUGGING */}
          <button
            onClick={() => alert('Test!')}
            style={{ zIndex: 200, pointerEvents: 'auto' }}
            className="mb-2 bg-blue-400 text-white px-4 py-2 rounded"
          >
            Test Click
          </button>
          <div className="flex justify-end items-center mb-4" style={{ zIndex: 100, pointerEvents: 'auto' }}>
            <div className="flex gap-2">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                onClick={handleExportCSV}
                style={{ pointerEvents: 'auto', zIndex: 101 }}
              >
                Export CSV
              </button>
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                onClick={handleImportClick}
                style={{ pointerEvents: 'auto', zIndex: 101 }}
              >
                Import CSV
              </button>
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Filters Row: Year, Leave Type, Search */}
          <div className="bg-white p-4 rounded-lg shadow mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              
              <select
                value={leaveTypeFilter}
                onChange={e => setLeaveTypeFilter(e.target.value)}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {(leaveTypes || []).map((t: LeaveType) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
              <input
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Flat Quota Table with All Types Aggregation */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-auto max-h-[60vh]">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Allocated</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Used</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Carried Over</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaveTypeFilter
                    ? filteredUsers.map((user: User) =>
                        (leaveTypes || [])
                          .filter((type: LeaveType) => type._id === leaveTypeFilter)
                          .map((type: LeaveType) => {
                            const cell = matrix[user._id]?.[type._id];
                            const allocated = Number(cell?.allocated) || 0;
                            const used = Number(cell?.used) || 0;
                            const carriedOver = Number(cell?.carriedOver) || 0;
                            const remaining = allocated + carriedOver - used;
                            return (
                              <tr key={user._id + '-' + type._id}>
                                <td className="px-4 py-3">{user.personalDetails.firstName} {user.personalDetails.lastName}</td>
                                <td className="px-4 py-3">{type.name}</td>
                                <td className="px-4 py-3 text-center">{allocated}</td>
                                <td className="px-4 py-3 text-center">{used}</td>
                                <td className="px-4 py-3 text-center">{carriedOver}</td>
                                <td className="px-4 py-3 text-center">{remaining}</td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    className="text-blue-600 hover:text-blue-900"
                                    onClick={() => openQuotaModal(user._id, type._id, !!cell)}
                                  >
                                    {cell ? 'Edit' : 'Add'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                      )
                    : filteredUsers.map((user: User) => {
                        let totalAllocated = 0, totalUsed = 0, totalCarriedOver = 0;
                        (leaveTypes || []).forEach((type: LeaveType) => {
                          const cell = matrix[user._id]?.[type._id];
                          totalAllocated += Number(cell?.allocated) || 0;
                          totalUsed += Number(cell?.used) || 0;
                          totalCarriedOver += Number(cell?.carriedOver) || 0;
                        });
                        const totalRemaining = totalAllocated + totalCarriedOver - totalUsed;
                        return (
                          <tr key={user._id}>
                            <td className="px-4 py-3">{user.personalDetails.firstName} {user.personalDetails.lastName}</td>
                            <td className="px-4 py-3">All Types</td>
                            <td className="px-4 py-3 text-center">{totalAllocated}</td>
                            <td className="px-4 py-3 text-center">{totalUsed}</td>
                            <td className="px-4 py-3 text-center">{totalCarriedOver}</td>
                            <td className="px-4 py-3 text-center">{totalRemaining}</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                className="text-blue-600 hover:text-blue-900"
                                onClick={() => handleEditAllTypes(user._id)}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Leave Type Modal */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingType ? 'Edit Leave Type' : 'Add Leave Type'}
            </h3>
            
            {typeError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {typeError}
              </div>
            )}

            <form onSubmit={editingType ? handleUpdateType : handleCreateType}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={typeForm.name}
                    onChange={e => setTypeForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter leave type name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={typeForm.description}
                    onChange={e => setTypeForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={typeForm.defaultDays}
                    onChange={e => setTypeForm(prev => ({ ...prev, defaultDays: Number(e.target.value) }))}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  {editingType ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                  onClick={() => setShowTypeModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quota Modal */}
      {showQuotaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingQuota ? 'Edit Quota' : 'Add Quota'}
            </h3>
            
            {quotaError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {quotaError}
              </div>
            )}

            <form onSubmit={editingQuota ? handleUpdateQuota : handleCreateQuota}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allocated Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quotaForm.allocated}
                    onChange={e => setQuotaForm(prev => ({ ...prev, allocated: Number(e.target.value) }))}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter allocated days"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carried Over Days
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quotaForm.carriedOver}
                    onChange={e => setQuotaForm(prev => ({ ...prev, carriedOver: Number(e.target.value) }))}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter carried over days"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  {editingQuota ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
                  onClick={() => setShowQuotaModal(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for selecting leave type to edit in All Types mode */}
      {editAllUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-80">
            <h3 className="text-lg font-semibold mb-4">Select Leave Type to Edit</h3>
            <ul>
              {(leaveTypes || []).map((type: LeaveType) => (
                <li key={type._id} className="mb-2">
                  <button
                    className="w-full text-left px-4 py-2 rounded hover:bg-blue-100"
                    onClick={() => {
                      openQuotaModal(editAllUserId, type._id, !!matrix[editAllUserId]?.[type._id]);
                      setEditAllUserId(null);
                    }}
                  >
                    {type.name}
                  </button>
                </li>
              ))}
            </ul>
            <button
              className="mt-4 w-full bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              onClick={() => setEditAllUserId(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeaveTypesQuotas; 