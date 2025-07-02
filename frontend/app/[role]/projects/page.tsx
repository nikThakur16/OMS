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
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from "@/store/api";
import CreateProjectModal from "@/components/modals/projects/createProject";
import ShortMonthDate from "@/utils/time/ShortMonthDate";
import { useAppSelector } from "@/store/hooks";
import EditProjectModal from "@/components/modals/projects/EditProjectModal";
import { Project } from "@/types/admin/project";
import useClickOutside from "@/utils/hooks/clickOutsideHook";
import { toast } from "react-toastify";
import DeleteConfirm from "@/components/modals/confirmation/DeleteConfirm";
import SuccessToast, { FailedToast } from "@/components/toasts/Notifications";
export default function ProjectsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const router = useRouter();
  const { data: projectsData, isLoading, error } = useGetProjectsQuery();
  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();
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
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter projects based on search and status
  const filteredProjects = (projectsData || []).filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || project.status === filterStatus;
    const isTrashed = project.deletedAt !== null;

    if (loggedUser?.role === "Employee") {
      return (
        matchesSearch &&
        matchesStatus &&
        !isTrashed &&
        (
          project.assignedTo?.some(
            (member) => String(member._id) === String(loggedUser.id)
          ) ||
          String(project.manager?._id) === String(loggedUser.id)
        )
      );
    }
    return matchesSearch && matchesStatus && !isTrashed;
  });

  const handleProjectClick = (id: string) => {
    if (loggedUser?.role) {
      router.push(`/${loggedUser.role.toLowerCase()}/projects/${id}`);
    }
  };

  // Placeholder for delete (should call backend API)
  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id).unwrap();
     
    } catch (error) {
      console.error("Failed to delete project:", error);
 
    }
  };
  const handleEditClose = () => {
    setShowEditModal(false);
    setSelectedProject(null);
  };

  const handleUpdateProject = async (data: any) => {
    if (!selectedProject) return;
    try {
      await updateProject({ id: selectedProject._id, data }).unwrap();
      toast(<SuccessToast message="Project moved to trash successfully" />);
      handleEditClose();
    } catch (error) {
      console.error("Failed to update project:", error);
      toast(<FailedToast message="Failed to move project to trash" />);
    }
  };

  return (
    <div
      onClick={() => {
        setShowMenu(false);
        setOpenMenuProjectId(null);
      }}
      className="p-6  min-h-screen"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold  text-[#04567B]">Projects</h1>
          {loggedUser && loggedUser.role !== "Employee" && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center gap-2 bg-[#175075] text-white px-3 py-2 rounded-xl font-semibold shadow-lg transition-all text-sm duration-300 transform hover:scale-105"
              >
                <HiOutlinePlus className="text-md" />
                Create Project
              </button>
              <button
                onClick={() =>
                  router.push(
                    `/${loggedUser.role.toLowerCase()}/projects/trash-projects`
                  )
                }
                className="flex items-center justify-center gap-2 bg-[#175075] text-sm text-white px-3 py-2 rounded-xl font-semibold shadow-lg transition-all duration-300 transform hover:scale-105"
              >
               <img width="15" height="15" className="mt-[-4px]" src="https://img.icons8.com/forma-regular-filled-sharp/24/FFFFFF/trash.png" alt="trash"/>
                Trash Projects
              </button>
            </div>
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
          className="px-4 py-3 rounded-xl bg-white/60 border text-[#04567B] border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-300 font-bold shadow"
        >
          <option className="font-bold text-[#04567B]" value="all">All Status</option>
          <option  className="font-semibold text-[#04567B]" value="active">Active</option>
          <option className="font-semibold text-[#04567B]" value="on-hold">On Hold</option>
          <option className="font-semibold text-[#04567B]" value="completed">Completed</option>
          <option className="font-semibold text-[#04567B]" value="archived">Archived</option>
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
          
            className="relative bg-white backdrop-blur-md rounded-lg px-6 py-2 shadow border border-white/30 cursor-pointer transition-all duration-300  group"
            onClick={(event) => {
              if (!showMenu) {
                handleProjectClick(project._id);
              }
            }}
          >
            {/* Project Avatar */}

            {/* Project Header */}
            <div className="flex justify-between items-start text-[#04567B] mb-4 pt-2">
              <div className="flex-1">
                <h3 className="text-xl tracking-wider font-bold  mb-2">
                  {project.name}
                </h3>
                <p className=" text-sm font-medium line-clamp-2">
                  {project.description}
                </p>
              </div>
              <div className="flex flex-col gap-2 mr-4 items-end">
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
                  className="absolute right-2 top-10 bg-[#D3E7F0] shadow-lg flex flex-col text-[#04567B] text-sm  font-semibold items-center rounded-lg p-4 w-48 z-30"
                >
                  <button
                    onClick={() =>
                      router.push(
                        `/${loggedUser?.role.toLowerCase()}/projects/${
                          project._id
                        }`
                      )
                    }
                    className="flex items-center gap-2 text-[#04567B] hover:text-indigo-600 transition-colors mb-2"
                  >
                    <HiOutlineEye className="text-xl" />
                    View Details
                  </button>
                  {loggedUser && (String(loggedUser.id) ===String(project.manager?._id)|| loggedUser.role ==="Admin")&& (
                    <div className="flex flex-col ">
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setShowEditModal(true);
                        }}
                        className="flex items-center gap-3 text-[#04567B] hover:text-indigo-600 transition-colors mb-2"
                      >
                        <HiOutlinePencil className="text-xl" />
                        Edit Project
                      </button>
                      <button
                        onClick={() => {
                          setConfirmDeleteId(project?._id);
                        }}
                        className=" flex gap-2 items-center text-[#04567B] hover:text-red-600 transition-colors"
                        title="Delete Project"
                      >
                        <HiOutlineTrash className="text-xl" />
                        move to trash
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
                    <ShortMonthDate className=" font-bold" date={project.startDate} />
                  ) : (
                    "N/A"
                  )}{" "}
                  -{" "}
                  {project.endDate ? (
                    <ShortMonthDate className="font-bold " date={project.endDate} />
                  ) : (
                    "N/A"
                  )}
                </span>
              </div>
              <div className="text-sm font-semibold text-gray-600">
                <span className="font-bold text-[#04567B] text-[15px]">Manager:</span>{" "}
                {project?.manager?.personalDetails?.firstName || "----"}{" "}
                {project?.manager?.personalDetails?.lastName}
              </div>
            </div>
          </motion.div>
        ))}
        {/* {confirmDeleteId === project?._id && (
                    <DeleteConfirm
                    open={true}
                    title="Confirm Trash"
                    
                      onClose={() => setConfirmDeleteId(null)}
                      Data={project}
                      message={"Are you sure move to trash?"}
                      subMessage={""}
                      handleDelete={() => handleDeleteProject(project?._id)}
                    />
                  )} */}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCreateModal(true);
                }}
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
            toast.success("Project created successfully");
            setShowCreateModal(false);
          } catch {
            toast.error("Failed to create project");
          }
        }}
      />
      <EditProjectModal
        open={showEditModal}
        project={selectedProject}
        onClose={handleEditClose}
        onUpdate={handleUpdateProject}
      />
      <DeleteConfirm
        open={!!confirmDeleteId}
        title="Confirm Trash"
        message="Are you sure want to move to Trash?"
        subMessage=""
        onClose={() => {setConfirmDeleteId(null);   setOpenMenuProjectId(null);}}
        Data={selectedProject}
        handleDelete={() => {
          if (confirmDeleteId) {
            handleDeleteProject(confirmDeleteId);
            setConfirmDeleteId(null);
            setOpenMenuProjectId(null);
          }
        }
      }
      />
    </div>
  );
}
