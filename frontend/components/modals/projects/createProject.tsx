import React, { useState } from "react";
import { useGetUsersQuery, useGetTeamsQuery, useGetDepartmentsQuery, useCreateDepartmentMutation, useCreateTeamMutation } from '@/store/api';
import { User } from '@/types/users/user';
import { Team } from '@/types/admin/team';
import { Department } from '@/types/admin/department';
import CreateDepartmentModal from '../department/CreateDepartmentModal';
import CreateTeamModal from '../team/CreateTeamModal';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status: string;
    manager?: string;
    team?: string[];
    departments?: string[];
  }) => void;
}

export default function CreateProjectModal({ open, onClose, onCreate }: CreateProjectModalProps) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "active",
    manager: "",
    team: [] as string[],
    departments: [] as string[],
  });

  const { data: users } = useGetUsersQuery();
  const { data: teams, refetch: refetchTeams } = useGetTeamsQuery();
  const { data: departments, refetch: refetchDepartments } = useGetDepartmentsQuery();
  const [createDepartment] = useCreateDepartmentMutation();
  const [createTeam] = useCreateTeamMutation();

  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.manager) {
      delete payload?.manager;
    }
    onCreate(payload);
    setForm({ name: "", description: "", startDate: "", endDate: "", status: "active", manager: "", team: [], departments: [] });
  };

  const handleMultiSelect = (field: 'team' | 'departments', value: string) => {
    setForm(f => {
      const arr = f[field].includes(value)
        ? f[field].filter(id => id !== value)
        : [...f[field], value];
      return { ...f, [field]: arr };
    });
  };

  const handleCreateDepartment = async (data: { name: string; description?: string }) => {
    try {
      await createDepartment(data).unwrap();
      alert('Department created!');
      setShowDepartmentModal(false);
      refetchDepartments();
    } catch {
      alert('Failed to create department.');
    }
  };

  const handleCreateTeam = async (data: { name: string; description?: string }) => {
    try {
      await createTeam(data).unwrap();
      alert('Team created!');
      setShowTeamModal(false);
      refetchTeams();
    } catch {
      alert('Failed to create team.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
            onClick={onClose}
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
              <input
                type="text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="Enter project name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                rows={3}
                placeholder="Enter project description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={form.startDate}
                  onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              >
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Manager</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.manager}
                onChange={e => setForm(f => ({ ...f, manager: e.target.value }))}
              >
                <option value="">Select Manager</option>
                {users && users.map((user: User) => (
                  <option key={user._id} value={user._id}>
                    {user.personalDetails.firstName} {user.personalDetails.lastName} ({user.personalDetails.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Teams</label>
                <button type="button" className="text-indigo-600 text-xs font-semibold" onClick={() => setShowTeamModal(true)}>+ Add Team</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {teams && teams.map((team: Team) => (
                  <button
                    type="button"
                    key={team._id}
                    className={`px-3 py-1 rounded-full border ${form.team.includes(team._id) ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                    onClick={() => handleMultiSelect('team', team._id)}
                  >
                    {team.name}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Departments</label>
                <button type="button" className="text-indigo-600 text-xs font-semibold" onClick={() => setShowDepartmentModal(true)}>+ Add Department</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {departments && departments.map((dept: Department) => (
                  <button
                    type="button"
                    key={dept._id}
                    className={`px-3 py-1 rounded-full border ${form.departments.includes(dept._id) ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                    onClick={() => handleMultiSelect('departments', dept._id)}
                  >
                    {dept.name}
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
                className="flex-1 px-4 py-3 bg-[#175075] text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
      <CreateDepartmentModal open={showDepartmentModal} onClose={() => setShowDepartmentModal(false)} onCreate={handleCreateDepartment} />
      <CreateTeamModal open={showTeamModal} onClose={() => setShowTeamModal(false)} onCreate={handleCreateTeam} />
    </>
  );
}
