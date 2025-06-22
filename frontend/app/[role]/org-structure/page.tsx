import React, { useState } from 'react';
import { useGetDepartmentsQuery, useGetTeamsQuery, useGetUsersQuery, useCreateDepartmentMutation, useCreateTeamMutation } from '@/store/api';
import { useAppSelector } from '@/store/hooks';
import CreateDepartmentModal from '@/components/modals/department/CreateDepartmentModal';
import CreateTeamModal from '@/components/modals/team/CreateTeamModal';

export default function OrgStructurePage() {
  const { data: departments, refetch: refetchDepartments } = useGetDepartmentsQuery();
  const { data: teams, refetch: refetchTeams } = useGetTeamsQuery();
  const { data: users } = useGetUsersQuery();
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [createDepartment] = useCreateDepartmentMutation();
  const [createTeam] = useCreateTeamMutation();
  const user = useAppSelector(state => state.login.user);
  const allowedRoles = ['Admin', 'Manager', 'HR'];
  const canEdit = user && allowedRoles.includes(user.role);

  if (!user || !allowedRoles.includes(user.role)) {
    return <div className="p-8 text-center text-red-600 font-bold">Access Denied</div>;
  }

  const handleCreateDepartment = async (data: { name: string; description?: string }) => {
    try {
      await createDepartment(data).unwrap();
      setShowDepartmentModal(false);
      refetchDepartments();
    } catch {
      alert('Failed to create department.');
    }
  };

  const handleCreateTeam = async (data: { name: string; description?: string; departmentId?: string }) => {
    try {
      await createTeam(data).unwrap();
      setShowTeamModal(false);
      refetchTeams();
    } catch {
      alert('Failed to create team.');
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Organization Structure</h1>
        {canEdit && (
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
              onClick={() => setShowDepartmentModal(true)}
            >
              + Add Department
            </button>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
              onClick={() => setShowTeamModal(true)}
            >
              + Add Team
            </button>
          </div>
        )}
      </div>
      <div className="space-y-8">
        {departments && departments.length > 0 ? (
          departments.map(dept => (
            <div key={dept._id} className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-gray-800">{dept.name}</h2>
                <span className="text-gray-500">{dept.description || 'No description'}</span>
              </div>
              <div className="ml-4 mt-2">
                <h3 className="text-lg font-semibold mb-2">Teams</h3>
                <ul className="flex flex-wrap gap-3">
                  {teams && teams.filter((t: any) => t.departmentId === dept._id).length > 0 ? (
                    teams.filter((t: any) => t.departmentId === dept._id).map((team: any) => (
                      <li key={team._id} className="bg-indigo-50 px-4 py-2 rounded-lg font-semibold text-indigo-700 shadow">
                        {team.name}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400">No teams in this department.</li>
                  )}
                </ul>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No departments found.</p>
        )}
      </div>
      <CreateDepartmentModal open={showDepartmentModal} onClose={() => setShowDepartmentModal(false)} onCreate={handleCreateDepartment} />
      <CreateTeamModal open={showTeamModal} onClose={() => setShowTeamModal(false)} onCreate={handleCreateTeam} />
    </div>
  );
} 