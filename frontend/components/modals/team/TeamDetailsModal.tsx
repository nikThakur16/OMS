import React, { useState, useEffect } from "react";
import { TeamWithDetails } from '@/types/admin/team';
import { Department } from '@/types/admin/department';
import { User } from '@/types/users/user';
import { useGetDepartmentsQuery, useGetUsersQuery, useUpdateTeamMutation } from '@/store/api';

interface TeamDetailsModalProps {
  open: boolean;
  team: TeamWithDetails | null;
  onClose: () => void;
  onUpdated?: () => void;
}

export default function TeamDetailsModal({ open, team, onClose, onUpdated }: TeamDetailsModalProps) {
  const { data: departments } = useGetDepartmentsQuery();
  const { data: users } = useGetUsersQuery();
  const [updateTeam] = useUpdateTeamMutation();
  const [form, setForm] = useState({
    name: '',
    description: '',
    departmentId: '',
    lead: '',
    members: [] as string[],
  });

  useEffect(() => {
    if (team) {
      setForm({
        name: team.name || '',
        description: team.description || '',
        departmentId: team.departmentId || '',
        lead: team.lead || '',
        members: team.members ? [...team.members] : [],
      });
    }
  }, [team]);

  if (!open || !team) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleMemberToggle = (userId: string) => {
    setForm(f => ({
      ...f,
      members: f.members.includes(userId)
        ? f.members.filter(id => id !== userId)
        : [...f.members, userId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateTeam({ id: team._id, ...form }).unwrap();
    if (onUpdated) onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6">Team Details</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
            <input
              type="text"
              name="name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              rows={2}
              value={form.description}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              name="departmentId"
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={form.departmentId}
              onChange={handleChange}
            >
              <option value="">Select Department</option>
              {departments && departments.map((dept: Department) => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lead</label>
            <select
              name="lead"
              className="w-full p-3 border border-gray-300 rounded-lg"
              value={form.lead}
              onChange={handleChange}
            >
              <option value="">Select Lead</option>
              {users && users.map((user: User) => (
                <option key={user._id} value={user._id}>
                  {user.personalDetails.firstName} {user.personalDetails.lastName} ({user.personalDetails.role})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Members</label>
            <div className="flex flex-wrap gap-2">
              {users && users.map((user: User) => (
                <button
                  type="button"
                  key={user._id}
                  className={`px-3 py-1 rounded-full border ${form.members.includes(user._id) ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                  onClick={() => handleMemberToggle(user._id)}
                >
                  {user.personalDetails.firstName} {user.personalDetails.lastName}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 