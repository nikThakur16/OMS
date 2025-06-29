'use client';
import React, { useState } from 'react';
import { useGetUsersQuery, useUpdateUserRoleMutation } from '@/store/api';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  personalDetails: {
    firstName: string;
    lastName: string;
    role: string;
    department: string;
  };
  contactDetails: {
    email: string;
  };
}

const AdminToolsPage = () => {
  const { data: usersData, isLoading, error, refetch } = useGetUsersQuery();
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const roles = ['Employee', 'Manager', 'HR', 'Admin'];

  const handleRoleUpdate = async () => {
    if (!selectedUser || !newRole) return;
    
    setIsUpdating(true);
    try {
      await updateUserRole({ userId: selectedUser._id, role: newRole }).unwrap();
      toast.success(`Role updated successfully for ${selectedUser.personalDetails.firstName} ${selectedUser.personalDetails.lastName}`);
      refetch();
      setSelectedUser(null);
      setNewRole('');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Failed to update role');
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'HR': return 'bg-purple-100 text-purple-800';
      case 'Manager': return 'bg-blue-100 text-blue-800';
      case 'Employee': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-indigo-800">Admin Tools</h1>
      
      {/* User Role Management */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">User Role Management</h2>
        {isLoading ? (
          <div className="text-gray-500">Loading users...</div>
        ) : error ? (
          <div className="text-red-500">Error loading users</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-gray-500 uppercase">
                  <th className="py-2">Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Current Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersData?.map((user: User) => (
                  <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-2 font-semibold">
                      {user.personalDetails.firstName} {user.personalDetails.lastName}
                    </td>
                    <td>{user.contactDetails.email}</td>
                    <td>{user.personalDetails.department}</td>
                    <td>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.personalDetails.role)}`}>
                        {user.personalDetails.role}
                      </span>
                    </td>
                    <td>
                      <button
                        className="bg-indigo-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-indigo-700 transition"
                        onClick={() => setSelectedUser(user)}
                      >
                        Change Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Settings */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">System Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold mb-2">Leave Settings</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Default Annual Leave:</span>
                <span className="font-semibold">21 days</span>
              </div>
              <div className="flex justify-between">
                <span>Default Sick Leave:</span>
                <span className="font-semibold">10 days</span>
              </div>
              <div className="flex justify-between">
                <span>Default Casual Leave:</span>
                <span className="font-semibold">7 days</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold mb-2">System Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Users:</span>
                <span className="font-semibold">{usersData?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Active Departments:</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between">
                <span>System Version:</span>
                <span className="font-semibold">v1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role Update Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl w-96">
            <h3 className="font-bold mb-4 text-lg">Update User Role</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Updating role for: <span className="font-semibold">{selectedUser.personalDetails.firstName} {selectedUser.personalDetails.lastName}</span>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Current role: <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleColor(selectedUser.personalDetails.role)}`}>
                  {selectedUser.personalDetails.role}
                </span>
              </p>
              <label className="block text-sm font-semibold mb-2">New Role</label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="">Select new role</option>
                {roles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-4 justify-end">
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                onClick={handleRoleUpdate}
                disabled={!newRole || isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Update Role'}
              </button>
              <button
                className="bg-gray-200 px-4 py-2 rounded font-semibold hover:bg-gray-300 transition"
                onClick={() => {
                  setSelectedUser(null);
                  setNewRole('');
                }}
                disabled={isUpdating}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminToolsPage; 