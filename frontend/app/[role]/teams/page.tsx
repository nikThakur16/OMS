'use client';
import React, { useState } from 'react';
import { useGetTeamsQuery, useCreateTeamMutation, useGetDepartmentsQuery, useGetUsersQuery } from '@/store/api';
import { Team } from '@/types/admin/team';
import CreateTeamModal from '@/components/modals/team/CreateTeamModal';
import TeamDetailsModal from '@/components/modals/team/TeamDetailsModal';
import { useAppSelector } from '@/store/hooks';

export default function TeamsPage() {
  const { data: teams, refetch } = useGetTeamsQuery();
  const { data: departments } = useGetDepartmentsQuery();
  const { data: users } = useGetUsersQuery();
  const user = useAppSelector(state => state.login.user);
  const allowedRoles = ['Admin', 'Manager', 'HR'];
  const canEdit = user && allowedRoles.includes(user.role);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTeam] = useCreateTeamMutation();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleCreateTeam = async (data: { name: string; description?: string }) => {
    try {
      await createTeam(data).unwrap();
      setShowCreateModal(false);
      refetch();
    } catch {
      alert('Failed to create team.');
    }
  };

  const handleTeamClick = (team: Team) => {
    setSelectedTeam(team);
    setShowDetailsModal(true);
  };

  const getDepartmentName = (id?: string) => departments?.find(d => d._id === id)?.name || '—';
  const getLeadName = (id?: string) => {
    const user = users?.find(u => u._id === id);
    return user ? `${user.personalDetails.firstName} ${user.personalDetails.lastName}` : '—';
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Teams</h1>
        {canEdit && (
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
            onClick={() => setShowCreateModal(true)}
          >
            + Add Team
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {teams && teams.length > 0 ? (
          teams.map((team: Team) => (
            <div key={team._id} className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition cursor-pointer"
              onClick={canEdit ? () => handleTeamClick(team) : undefined} style={{ opacity: canEdit ? 1 : 0.7, pointerEvents: canEdit ? 'auto' : 'none' }}>
              <h2 className="text-xl font-bold mb-2">{team.name}</h2>
              <p className="text-gray-600 mb-2">{team.description || 'No description'}</p>
              <div className="text-sm text-gray-500 mb-1">Department: <span className="font-semibold text-gray-700">{getDepartmentName(team.departmentId)}</span></div>
              <div className="text-sm text-gray-500 mb-1">Lead: <span className="font-semibold text-gray-700">{getLeadName(team.lead)}</span></div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 col-span-2">No teams found.</p>
        )}
      </div>
      <CreateTeamModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreateTeam} />
      <TeamDetailsModal
        open={showDetailsModal}
        team={selectedTeam}
        onClose={() => setShowDetailsModal(false)}
        onUpdated={refetch}
      />
    </div>
  );
} 