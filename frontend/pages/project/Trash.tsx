'use client';
import React, { useState } from 'react';
import {
  useGetProjectsQuery,
  useRestoreProjectMutation,
  useHardDeleteProjectMutation,
} from "@/store/api";
import DeleteConfirm from '@/components/modals/confirmation/DeleteConfirm';

const TrashProjectsPage = () => {
  const { data: projects, isLoading, error, refetch } = useGetProjectsQuery();
  const [restoreProject] = useRestoreProjectMutation();
  const [hardDeleteProject] = useHardDeleteProjectMutation();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Filter trashed projects
  const trashedProjects = projects?.filter((project) => !!project.deletedAt) || [];

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    await restoreProject(id);
    setRestoringId(null);
    refetch();
  };

  const handleHardDelete = async (id: string) => {
    setConfirmDeleteId(null);
    await hardDeleteProject(id);
    refetch();
  };
  console.log("Trashed Projects:", trashedProjects);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2 text-[#04567B] flex items-center gap-2">
        <span role="img" aria-label="trash">🗑️</span> Trashed Projects
      </h1>
      <p className="mb-6 text-sm text-gray-600">
        Projects in trash will be permanently deleted after 30 days.
      </p>
      {isLoading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-600">Error loading projects.</div>
      ) : trashedProjects.length === 0 ? (
        <div className="text-center text-gray-400 mt-12">
          <span className="text-5xl block mb-2">🗑️</span>
          Trash is empty.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-[#E3F2FD] text-[#04567B]">
                <th className="py-3 px-4 text-left">Project Name</th>
                <th className="py-3 px-4 text-left">Deleted At</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trashedProjects.map((project) => (
                <tr key={project._id} className="border-b last:border-b-0">
                  <td className="py-3 px-4 font-semibold">{project.name}</td>
                  <td className="py-3 px-4 text-gray-500">
                    {project.deletedAt ? new Date(project.deletedAt).toLocaleString() : "—"}
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button
                      onClick={() => handleRestore(project._id)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                      disabled={restoringId === project._id}
                    >
                      {restoringId === project._id ? "Restoring..." : "Restore"}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(project._id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                    >
                      Delete Forever
                    </button>
                    {/* Confirmation Dialog */}
                    {/* {confirmDeleteId === project._id && (
                      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                        <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
                          <h2 className="text-lg font-bold mb-2 text-red-700">Delete Project</h2>
                          <p className="mb-4">Are you sure you want to permanently delete <span className="font-semibold">{project.name}</span>? This cannot be undone.</p>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleHardDelete(project._id)}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Delete Forever
                            </button>
                          </div>
                        </div>
                      </div>
                    )} */}
                    {confirmDeleteId === project._id && (
                      <DeleteConfirm
                      title="Confirm Delete"
                        message={`Are you sure you want to permanently delete ? `}
                        subMessage="This action cannot be undone."
                        open={true}
                        onClose={() => setConfirmDeleteId(null)}
                        Data={project}
                        handleDelete={() => handleHardDelete(project._id)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TrashProjectsPage;
