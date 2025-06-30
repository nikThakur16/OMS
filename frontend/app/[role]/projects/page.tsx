"use client";
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineCalendar,
} from "react-icons/hi";
import { useRouter } from "next/navigation";
import { useGetProjectsQuery, useCreateProjectMutation, useUpdateProjectMutation } from "@/store/api";
import CreateProjectModal from "@/components/modals/projects/createProject";
import ShortMonthDate from "@/utils/time/ShortMonthDate";
import { useAppSelector } from "@/store/hooks";
import EditProjectModal from "@/components/modals/projects/EditProjectModal";
import { Project } from "@/types/admin/project";
import useClickOutside from "@/utils/hooks/clickOutsideHook";

export default function ProjectsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const router = useRouter();
  const { data: projectsData, isLoading, error } = useGetProjectsQuery();
  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const loggedUser = useAppSelector((state) => state?.login?.user);
  const [showMenu, setShowMenu] = useState(false);
  const [openMenuProjectId, setOpenMenuProjectId] = useState<string | null>(
    null
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  // Helper to get status colors
  const statusColors: { [key: string]: string } = {
    active: "bg-green-100 text-green-800",
    "on-hold": "bg-yellow-100 text-yellow-800",
    completed: "bg-blue-100 text-blue-800",
    archived: "bg-red-100 text-red-800",
  };

  // Filter projects based on search and status
  const filteredProjects = (projectsData || []).filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || project.status === filterStatus;

    if (loggedUser?.role === "Employee") {
      return (
        matchesSearch &&
        matchesStatus &&
        project.assignedTo?.some(
          (member) => String(member._id) === String(loggedUser.id)
        )
      );
    }
    return matchesSearch && matchesStatus;
  });

  const handleProjectClick = ( id: string) => {
    
    if (loggedUser?.role ) {
      router.push(`/${loggedUser.role.toLowerCase()}/projects/${id}`);
    }
  };

  // Placeholder for delete (should call backend API)
  const handleDeleteProject = () => {
    // TODO: Implement delete project API call
    alert("Delete project not implemented");
  };
  const handleEditClose = () => {
    setShowEditModal(false);
    setSelectedProject(null);
  };

  const handleUpdateProject = async (data: any) => {
    if (!selectedProject) return;
    try {
      await updateProject({ id: selectedProject._id, data }).unwrap();
      alert("Project updated successfully!");
      handleEditClose();
    } catch (error) {
      console.error("Failed to update project:", error);
      alert("Failed to update project.");
    }
  };


  return (
    <div onClick={()=> {
      setShowMenu(false);
      setOpenMenuProjectId(null);
     
    }} className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold  text-[#04567B]">Projects</h1>
          {loggedUser && loggedUser.role !== "Employee" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-[#175075] text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:from-indigo-600 hover:to-fuchsia-600 transition-all duration-300 transform hover:scale-105"
            >
              <HiOutlinePlus className="text-xl" />
              Create Project
            </button>
          )}
        </div>
        <p className="text-[#04567B] font-semibold">
          Manage and track all your projects in one place
        </p>
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
      {error && (
        <div className="text-center py-8 text-red-500">
          Error loading projects
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <motion.div
            key={project._id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{
              scale: 1.03,
              boxShadow: "0 8px 32px rgba(80,80,180,0.15)",
            }}
            className="relative bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30 cursor-pointer transition-all duration-300 hover:shadow-2xl group"
            onClick={(event) => {
              if (!showMenu) {
                handleProjectClick(project._id);
              }
            }}
          >
            {/* Project Avatar */}

            {/* Project Header */}
            <div className="flex justify-between items-start mb-4 pt-2">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#04567B] mb-1">
                  {project.name}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {project.description}
                </p>
              </div>
              <div className="flex flex-col gap-2 ml-4 items-end">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                    statusColors[project.status] || "bg-gray-200 text-gray-800"
                  }`}
                >
                  {project.status}
                </span>

                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (openMenuProjectId === project._id) {
                      setOpenMenuProjectId(null);
                      setShowMenu(false);
                    } else {
                      setOpenMenuProjectId(project._id);
                      setSelectedProject(project);
                      setShowMenu(true);
                    }
                  }}
                  className="absolute right-2 top-2 cursor-pointer p-2"
                >
                  <img
                    width="14"
                    height="14"
                    src="https://img.icons8.com/color/48/menu-2.png"
                    alt="menu-2"
                  />
                </div>
              </div>
              {openMenuProjectId === project._id && showMenu && (
                <div
                  ref={menuRef}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-2 top-10 bg-white shadow-lg flex flex-col items-center rounded-lg p-4 w-48 z-30"
                >
                  <button
                    onClick={() =>
                      router.push(
                        `/${loggedUser?.role.toLowerCase()}/projects/${
                          project._id
                        }`
                      )
                    }
                    className="flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors mb-2"
                  >
                    <HiOutlineEye />
                    View Details
                  </button>
                  {loggedUser && loggedUser.role !== "Employee" && (
                    <div className="flex flex-col ">
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setShowEditModal(true);
                        }}
                        className="flex items-center gap-3 text-gray-700 hover:text-indigo-600 transition-colors mb-2"
                      >
                        <HiOutlinePencil />
                        Edit Project
                      </button>
                      <button
                        onClick={handleDeleteProject}
                        className=" flex gap-2 items-center text-gray-700 hover:text-red-600 transition-colors"
                        title="Delete Project"
                      >
                        <HiOutlineTrash />
                        delete Project
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Dates */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <HiOutlineCalendar className="text-gray-400" />
                <span>
                  {project.startDate ? (
                    <ShortMonthDate date={project.startDate} />
                  ) : (
                    "N/A"
                  )}{" "}
                  -{" "}
                  {project.endDate ? (
                    <ShortMonthDate date={project.endDate} />
                  ) : (
                    "N/A"
                  )}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Manager:</span>{" "}
                {project?.manager?.personalDetails?.firstName || "----"}{" "}
                {project?.manager?.personalDetails?.lastName}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No projects found
          </h3>

          {loggedUser && loggedUser.role !== "Employee" && (
            <div>
              <p className="text-gray-500 mb-6">
                Create your first project to get started
              </p>
              <button
                onClick={(e) =>{ e.stopPropagation(); setShowCreateModal(true)}}
                className="bg-[#175075] hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Create Project
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={async (data) => {
          try {
            await createProject(data).unwrap();
            alert("Project created successfully!");
            setShowCreateModal(false);
          } catch {
            alert("Failed to create project.");
          }
        }}
      />
      <EditProjectModal
        open={showEditModal}
        project={selectedProject}
        onClose={handleEditClose}
        onUpdate={handleUpdateProject}
      />
    </div>
  );
}
