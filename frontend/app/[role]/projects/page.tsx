"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HiOutlinePlus, HiOutlineSearch, HiOutlineEye, HiOutlinePencil, HiOutlineTrash, HiOutlineCalendar } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { useGetProjectsQuery, useCreateProjectMutation } from '@/store/api';
import CreateProjectModal from '@/components/modals/projects/createProject';
import ShortMonthDate from '@/utils/time/ShortMonthDate'; 
export default function ProjectsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const router = useRouter();
  const { data: projectsData, isLoading, error } = useGetProjectsQuery();
  const [createProject] = useCreateProjectMutation();

  // Filter projects based on search and status
  const filteredProjects = (projectsData || []).filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleProjectClick = (id: string) => {
    router.push(`/admin/projects/${id}`);
  };

  // Placeholder for delete (should call backend API)
  const handleDeleteProject = () => {
    // TODO: Implement delete project API call
    alert('Delete project not implemented');
  };

  return (
    <div className="p-6 bg-gradient-to-br from-[#e0e7ff] to-[#f4fafd] min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Projects</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-[#175075] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:from-indigo-600 hover:to-fuchsia-600 transition-all duration-300 transform hover:scale-105"
          >
            <HiOutlinePlus className="text-xl" />
            Create Project
          </button>
        </div>
        <p className="text-gray-600">Manage and track all your projects in one place</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 placeholder-gray-400 shadow"
          />
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 shadow"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Loading/Error States */}
      {isLoading && <div className="text-center py-8">Loading projects...</div>}
      {error && <div className="text-center py-8 text-red-500">Error loading projects</div>}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <motion.div
            key={project._id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(80,80,180,0.15)' }}
            className="relative bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30 cursor-pointer transition-all duration-300 hover:shadow-2xl group"
            onClick={() => handleProjectClick(project._id)}
          >
            {/* Project Avatar */}
          
            {/* Project Header */}
            <div className="flex justify-between items-start mb-4 pt-2">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{project.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
              </div>
              <div className="flex flex-col gap-2 ml-4 items-end">
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-800">
                  {project.status}
                </span>
              </div>
            </div>
            {/* Dates */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <HiOutlineCalendar className="text-gray-400" />
                <span>{project.startDate ? <ShortMonthDate date={project.startDate}  /> : 'N/A'} - {project.endDate ? <ShortMonthDate date={project.endDate} /> : 'N/A'}</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Manager:</span> {project?.manager?.personalDetails?.firstName || "----"} {project?.manager?.personalDetails?.lastName}
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex gap-2 absolute top-4 right-4 z-20">
              <button
                onClick={e => { e.stopPropagation(); handleProjectClick(project._id); }}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors shadow"
                title="View Details"
              >
                <HiOutlineEye />
              </button>
              <button
                onClick={e => { e.stopPropagation(); /* Handle edit */ }}
                className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                title="Edit Project"
              >
                <HiOutlinePencil />
              </button>
              <button
                onClick={e => { e.stopPropagation(); handleDeleteProject(); }}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Delete Project"
              >
                <HiOutlineTrash />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-6">Create your first project to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-[#175075] hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Create Project
          </button>
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={async (data) => {
          try {
            await createProject(data).unwrap();
            alert('Project created successfully!');
            setShowCreateModal(false);
          } catch {
            alert('Failed to create project.');
          }
        }}
      />
    </div>
  );
} 