"use client";
import React, { useState } from "react";
import { useGetDepartmentsQuery, useCreateDepartmentMutation, useGetUsersQuery, useGetTeamsQuery } from '@/store/api';
import CreateDepartmentModal from '@/components/modals/department/CreateDepartmentModal';
import { useAppSelector } from "@/store/hooks";

export default function DepartmentsPage() {
  const { data: departments, refetch } = useGetDepartmentsQuery();
  const [createDepartment] = useCreateDepartmentMutation();
  const { data: users } = useGetUsersQuery();
  const { data: teams } = useGetTeamsQuery();
  const loggedUser = useAppSelector((state) => state?.login?.user);
 

  const [showModal, setShowModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const handleCreateDepartment = async (data: { name: string; description?: string }) => {
    try {
      await createDepartment(data).unwrap();
      alert('Department created!');
      setShowModal(false);
      refetch();
    } catch {
      alert('Failed to create department.');
    }
  };

  const getMembers = (deptName: string) => {
    if (!users) return [];
    return users.filter((u: any) => u.personalDetails?.department === deptName);
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Departments</h1>
       {loggedUser && loggedUser?.role!=="Employee" ? (
         <button
         onClick={() => setShowModal(true)}
         className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300"
       >
         + Create Department
       </button>):""}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments && departments.map((dept) => (
          <div key={dept._id} className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">{dept.name}</h2>
              <p className="text-gray-600 mb-4">{dept.description || 'No description'}</p>
            </div>
            <button
              className="mt-auto bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-200 transition"
              onClick={() => setSelectedDept(dept.name)}
            >
              View Members
            </button>
          </div>
        ))}
      </div>
      <CreateDepartmentModal open={showModal} onClose={() => setShowModal(false)} onCreate={handleCreateDepartment} />
      {/* Members Modal */}
      {selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setSelectedDept(null)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-6">Members in {selectedDept}</h2>
            <ul>
              {getMembers(selectedDept).length === 0 && <li className="text-gray-500">No members in this department.</li>}
              {getMembers(selectedDept).map((user: any) => (
                <li key={user._id} className="mb-2 text-gray-700">
                  {user.personalDetails.firstName} {user.personalDetails.lastName} ({user.personalDetails.role})
                </li>
              ))}
            </ul>
            <h3 className="text-xl font-bold mt-8 mb-4">Teams in {selectedDept}</h3>
            <ul>
              {teams && departments && (() => {
                const deptObj = departments.find(d => d.name === selectedDept);
                if (!deptObj) return <li className="text-gray-500">No teams found.</li>;
                const deptTeams = teams.filter((t: any) => t.departmentId === deptObj._id);
                if (deptTeams.length === 0) return <li className="text-gray-500">No teams in this department.</li>;
                return deptTeams.map((team: any) => (
                  <li key={team._id} className="mb-2 text-gray-700 font-semibold">{team.name}</li>
                ));
              })()}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 