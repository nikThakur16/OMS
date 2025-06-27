"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineSortAscending,
  HiPlus,
  HiViewBoards,
  HiViewList,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineEye,
} from "react-icons/hi";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useGetProjectByIdQuery, useGetTasksByProjectQuery, useCreateTaskForProjectMutation, useUpdateTaskMutation, useDeleteTaskMutation, useGetUsersQuery, useGetStatusesQuery, useCreateStatusMutation, useUpdateStatusMutation, useDeleteStatusMutation } from "@/store/api";
import ShortMonthDate from "@/utils/time/ShortMonthDate";
import { TaskStatus } from '@/types/admin/task';
import KanbanBoard from '@/components/admin/KanbanBoard';
import CreateTaskModal from "@/components/admin/CreateTaskModal";
import TaskDetailsModal from "@/components/admin/TaskDetailsModal";
import useDebounce from "@/utils/hooks/useDebounce";
import DeleteConfirm from "@/components/modals/confirmation/DeleteConfirm";

interface TaskType {
  id: string;
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: "high" | "low" | "medium" | "critical";
  dueDate: string;
  tags?: string[];
  assignedTo?: string[];
  parentTaskId?: string;
  activityLog?: { userId: string; action: string; details?: any; timestamp: string }[];
}

interface User {
  _id: string;
  personalDetails: {
    firstName: string;
    lastName: string;
  }
}


function KanbanTaskCard({
  task,
  onView,
  onEdit,
  onDelete,
  listeners,
  attributes,
  isDragging,
  style,
}: {
  task: TaskType;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  listeners?: unknown;
  attributes?: unknown;
  isDragging?: boolean;
  style?: React.CSSProperties;
})


 {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className={`mb-3 p-4 rounded-xl shadow bg-gradient-to-br from-white/80 to-${
        task.priority === "high"
          ? "red"
          : task.priority === "medium"
          ? "yellow"
          : "blue"
      }-100 border-l-4 ${
        task.priority === "high"
          ? "border-red-400"
          : task.priority === "medium"
          ? "border-yellow-400"
          : "border-blue-400"
      } cursor-pointer transition ${isDragging ? "opacity-60" : ""}`}
      style={style}
      {...(typeof attributes === "object" && attributes ? attributes : {})}
      {...(typeof listeners === "object" && listeners ? listeners : {})}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-sm text-gray-800 truncate max-w-[70%]">
          {task.title}
        </h4>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="text-gray-400 hover:text-blue-600 transition"
          >
            <HiOutlineEye />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-gray-400 hover:text-green-600 transition"
          >
            <HiOutlinePencil />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-gray-400 hover:text-red-600 transition"
          >
            <HiOutlineTrash />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {task.tags?.map((tag: string) => (
          <span
            key={tag}
            className="bg-gradient-to-r from-blue-200 to-fuchsia-200 text-xs px-2 py-1 rounded-full shadow-sm"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
        <div className="flex -space-x-2">
          {task.assignedTo?.map((userId: string) => (
            <span
              key={userId}
              className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 border-2 border-white flex items-center justify-center text-xs font-bold shadow"
            >
              {userId[0]?.toUpperCase()}
            </span>
          ))}
        </div>
        <span>
          {task.dueDate ? <ShortMonthDate date={task.dueDate} /> : ""}
        </span>
      </div>
    </motion.div>
  );
}

function SortableTask({
  task,
  onView,
  onEdit,
  onDelete,
}: {
  task: TaskType;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };
  return (
    <div ref={setNodeRef} style={style}>
      <KanbanTaskCard
        task={task}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        listeners={listeners}
        attributes={attributes}
        isDragging={isDragging}
      />
    </div>
  );
}

// Helper to normalize tasks from backend
function normalizeTasks(tasks: any[] = []): TaskType[] {
  return tasks.map((t) => ({
    ...t,
    id: t._id || t.id,
    _id: t._id,
    status: t.status as TaskStatus,
    dueDate: t.dueDate ? String(t.dueDate) : '',
  }));
}

const Header = ({ projectData, onAddTask }: { projectData: any; onAddTask: () => void; }) => (
    <div className="relative rounded-3xl p-6 bg-[#175075]  shadow-xl mb-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="">
          <div className="flex items-center justify-between">
            {" "}
            <h2 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-2">
              {projectData.name}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 items-center mb-2">
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
              Status: {projectData.status}
            </span>
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
              Start:{" "}
              {projectData.startDate ? (
                <ShortMonthDate date={projectData.startDate} />
              ) : (
                "N/A"
              )}
            </span>
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
              Due:{" "}
              {projectData.endDate ? (
                <ShortMonthDate date={projectData.endDate} />
              ) : (
                "N/A"
              )}
            </span>
            {projectData.budget && (
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
                Budget: {projectData.currency || ''} {projectData.budget}
              </span>
            )}
          </div>
          {projectData.description && (
            <div className="text-white/80 text-sm mb-2">
              {projectData.description}
            </div>
          )}
          {projectData.manager && (
            <div className="text-white/80 text-sm">
              Manager:{" "}
              <span className="font-bold text-white">
                {projectData?.manager?.personalDetails.firstName}{" "}
                {projectData?.manager?.personalDetails.lastName}
              </span>
            </div>
          )}
          {projectData.team && projectData.team.length > 0 && (
            <div className="text-white/80 text-sm">
              Teams: {projectData.team.map((team: any) => team.name).join(", ")}
            </div>
          )}
          {projectData.departments && projectData.departments.length > 0 && (
            <div className="text-white/80 text-sm">
              Departments:{" "}
              {projectData.departments
                .map((department: any) => department.name)
                .join(", ")}
            </div>
          )}
          {projectData.customFields && projectData.customFields.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {projectData.customFields.map((field: any) => (
                <span
                  key={field.name}
                  className="bg-white/20 text-white text-xs px-3 py-1 rounded-full"
                >
                  {field.name}: {projectData.customFieldValues?.[field.name] || "N/A"}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <button
      onClick={onAddTask}
        className="bg-white/20 absolute right-5 top-5   text-white text-xs px-3 py-2 cursor-pointer rounded-full items-baseline font-semibold uppercase tracking-wider"
      >
        Add task
      </button>
    </div>
  );

const Toolbar = ({
  taskCount,
  onAddTask,
  searchTerm,
  onSearchTermChange,
  filters,
  onFiltersChange,
  view,
  onViewChange,
}: {
  taskCount: number;
  onAddTask: () => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  filters: { priority: string; dueDate: string; sort: string };
  onFiltersChange: (filters: { priority: string; dueDate: string; sort: string }) => void;
  view: string;
  onViewChange: (view: "kanban" | "list" | "whiteboard") => void;
}) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-gray-700">
          {taskCount} tasks
        </span>
        <button
          className="flex items-center gap-2 bg-[#235C7F] text-white px-4 py-2 rounded-xl font-semibold shadow "
          onClick={onAddTask}
        >
          <HiPlus /> Add New
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-xl bg-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 placeholder-gray-400 shadow"
          />
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        </div>
        <div className="relative">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 bg-white/60 border border-white/30 px-3 py-2 rounded-xl text-gray-700 hover:bg-white/80 transition"
          >
            <HiOutlineFilter /> Filters
          </button>
          {showFilters && (
            <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-20 w-72 border">
              <h4 className="font-semibold mb-2 text-gray-700">Filter & Sort</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => onFiltersChange({ ...filters, priority: e.target.value })}
                    className="w-full p-2 mt-1 border rounded-md text-sm"
                  >
                    <option value="">All Priorities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Due Date</label>
                  <input
                    type="date"
                    value={filters.dueDate}
                    onChange={(e) => onFiltersChange({ ...filters, dueDate: e.target.value })}
                    className="w-full p-2 mt-1 border rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Sort By</label>
                  <select
                    value={filters.sort}
                    onChange={(e) => onFiltersChange({ ...filters, sort: e.target.value })}
                    className="w-full p-2 mt-1 border rounded-md text-sm"
                  >
                    <option value="">Default</option>
                    <option value="_id-desc">Newest First</option>
                    <option value="_id-asc">Oldest First</option>
                    <option value="dueDate-asc">Due Date (Asc)</option>
                    <option value="dueDate-desc">Due Date (Desc)</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => {
                  onFiltersChange({ priority: "", dueDate: "", sort: "" });
                  setShowFilters(false);
                }}
                className="w-full mt-4 text-sm text-blue-600 hover:underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-1 ml-2">
          <button
            className={`p-2 rounded-lg ${
              view === "kanban"
                ? "bg-[#235C7F] text-white"
                : "bg-white/60 text-gray-700"
            }`}
            onClick={() => onViewChange("kanban")}
          >
            <HiViewBoards />
          </button>
          <button
            className={`p-2 rounded-lg ${
              view === "list"
                ? "bg-[#235C7F] text-white"
                : "bg-white/60 text-gray-700"
            }`}
            onClick={() => onViewChange("list")}
          >
            <HiViewList />
          </button>
          <button
            className={`p-2 rounded-lg ${
              view === "whiteboard"
                ? "bg-indigo-500 text-white"
                : "bg-white/60 text-gray-700"
            }`}
            onClick={() => onViewChange("whiteboard")}
          >
            📝
          </button>
        </div>
      </div>
    </div>
  );
};





const TaskList = ({ tasks, users, onView, onEdit, onDelete }: { tasks: TaskType[], users: User[], onView: (task: TaskType) => void, onEdit: (task: TaskType) => void, onDelete: (task: TaskType) => void }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<TaskType | null>(null);

  const handleClick = (task: TaskType) => {
    setTaskToDelete(task);
    setShowConfirm(true);
  };

  const handleDelete = () => {
    if (taskToDelete) {
      onDelete(taskToDelete);
      setTaskToDelete(null);
      setShowConfirm(false);
    }
  };

  

  return (
   <div>
     <div  className="rounded-2xl bg-white/60 border border-white/30 backdrop-blur-md shadow-xl p-4">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[16px] text-center text-[#04567B] uppercase">
            <th className="py-2">Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Due</th>
            <th>Tags</th>
            <th>Assignees</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
        {tasks.map((task) => (
            <tr
              key={task.id}
              className="border-b border-gray-200 text-center text-[#04567B] text-[14px] py-8 hover:bg-white/80 transition"
            >
              <td className="py-4 font-semibold">{task.title}</td>
              <td className="font-bold">{task.description}</td>
              <td className="font-semibold">{task.status}</td>
              <td className="font-semibold">{task.priority}</td>
              <td className="font-semibold">{task.dueDate ? <ShortMonthDate date={task.dueDate} /> : "N/A"}</td>
              <td className="font-semibold">{task.tags?.join(", ")}</td>
              <td className="font-semibold">
                <div className="flex -space-x-2 items-center justify-center">
                  {task.assignedTo?.map((userId) => (
                    <span
                      key={userId}
                      className="w-6 h-6 rounded-full  bg-gradient-to-br from-gray-100 to-gray-300 border-2 border-white flex items-center justify-center text-xs font-bold shadow"
                    >
                      {users.find(u => u._id === userId)?.personalDetails.firstName[0]?.toUpperCase() || 'U'}
                    </span>
                  ))}
                </div>
              </td>
              <td>
                <button
                onClick={() => onView(task)}
                  className="text-gray-400 hover:text-blue-600 mx-1"
                >
                  <HiOutlineEye />
                </button>
                <button
                onClick={() => onEdit(task)}
                  className="text-gray-400 hover:text-green-600 mx-1"
                >
                  <HiOutlinePencil />
                </button>
                <button
                onClick={() => handleClick(task)}
                  className="text-gray-400 hover:text-red-600 mx-1"
                >
                  <HiOutlineTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
    </div>
    {showConfirm && (
        <div className='absolute right-0 mt-2 w-48 bg-black-900/40 border rounded shadow z-50'>
        <DeleteConfirm 
        Data={tasks}
        onClose={() => setShowConfirm(false)}
        open={showConfirm}
        handleDelete={handleDelete}/>
     
        </div>
      )}
   </div>
  );
};

export default function ProjectDetailsPage() {
  const params = useParams();
  const project = Array.isArray(params?.projectId)
    ? params.projectId[0]
    : params?.projectId || "";
  const { data: projectData, isLoading, error } = useGetProjectByIdQuery(project);
  const { data: tasksData = [] } = useGetTasksByProjectQuery(project);
  const [createTaskForProject] = useCreateTaskForProjectMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const { data: users = [] } = useGetUsersQuery();

  console.log("Project Data:", projectData);
  console.log("Tasks Data:", tasksData);

  // Fetch statuses for this project
  // const { data: statuses = [], refetch: refetchStatuses } = useGetStatusesQuery({ project });
  // const [createStatus] = useCreateStatusMutation();
  // const [updateStatus] = useUpdateStatusMutation();
  // const [deleteStatus] = useDeleteStatusMutation();

  const [view, setView] = useState<"kanban" | "list" | "whiteboard">("kanban");
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">("view");
  // const [newTask, setNewTask] = useState({ title: "", description: "" });
  // const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  // const [newComment, setNewComment] = useState("");
  const [tasks, setTasks] = useState<TaskType[]>([]);
  


  // Modal state for creating a new status
  const [showStatusModal, setShowStatusModal] = useState(false);
  // const [newStatusName, setNewStatusName] = useState("");
  // const [newStatusColor, setNewStatusColor] = useState("#cccccc");

  // // Add advanced status deletion modal state
  // const [showDeleteStatusModal, setShowDeleteStatusModal] = useState(false);
  // const [statusToDelete, setStatusToDelete] = useState<Status | null>(null);
  // const [moveToStatus, setMoveToStatus] = useState("");
  // const [tasksInStatus, setTasksInStatus] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priority: "",
    dueDate: "",
    sort: "",
  });
  
  

const debouncedSearchTerm = useDebounce(searchTerm, 300); // 1. Debounce the search term

const normalizedTasks = useMemo(() => normalizeTasks(tasksData), [tasksData]);

  const filteredAndSortedTasks = useMemo(() => {
    // 2. THIS NOW USES YOUR LOCAL `tasks` STATE
    let result = tasks; 

    if (debouncedSearchTerm) {
      result = result.filter((task) =>
        task.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    if (filters.priority) {
      result = result.filter((task) => task.priority === filters.priority);
    }

    if (filters.dueDate) {
      result = result.filter(
        (task) => task.dueDate && task.dueDate.startsWith(filters.dueDate)
      );
    }

    if (filters.sort) {
      const [key, order] = filters.sort.split("-");
      result.sort((a, b) => {
        const valA = a[key as keyof TaskType] || "";
        const valB = b[key as keyof TaskType] || "";
        if (valA < valB) return order === "asc" ? -1 : 1;
        if (valA > valB) return order === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [tasks, debouncedSearchTerm, filters]); // 2.1 DEPENDS ON LOCAL `tasks`

  useEffect(() => {
    // This now correctly syncs the server data to your local state
    setTasks(normalizedTasks);
  }, [normalizedTasks]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xl text-gray-500">Loading...</div>
    );
  }
  if (error || !projectData) {
    return (
      <div className="p-8 text-center text-xl text-gray-500">
        Project not found.
      </div>
    );
  }

  // 3. THIS HANDLER NOW PERFORMS AN OPTIMISTIC UPDATE
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    // Update the UI instantly
    setTasks(prevTasks =>
        prevTasks.map(task =>
            task.id === taskId ? { ...task, status: newStatus } : task
        )
    );

    // Then, send the update to the server
    try {
      await updateTask({ id: taskId, data: { status: newStatus as TaskStatus } }).unwrap();
    } catch (err) {
      console.error("Failed to update task status:", err);
      // If the server fails, revert the change in the UI
      setTasks(normalizedTasks);
      alert("Failed to update task. Please try again.");
    }
  };

  const handleView = (task: TaskType) => { setSelectedTask(task); setModalMode('view'); setShowModal(true); };
  const handleEdit = (task: TaskType) => { setSelectedTask(task); setModalMode('edit'); setShowModal(true); };
  const handleDeleteTask = async (task: TaskType) => {
    // Optimistically remove from UI
    setTasks(prev => prev.filter(t => t._id !== task._id));
    try {
      await deleteTask(task._id).unwrap();
    } catch (err) {
      // Optionally, revert UI and show error
      setTasks(normalizedTasks);
      alert("Failed to delete task.");
    }
  };
  const handleAddTask = () => {
    setModalMode("create");
    setShowModal(true);
  };

  const handleUpdateTask = (update: { id: string; data: Partial<any> }) => {
    const { id, data } = update;

    // Convert Date object to ISO string if it exists
    const apiData = {
      ...data,
      dueDate: data.dueDate instanceof Date ? data.dueDate.toISOString() : data.dueDate,
    };

    // Call the original mutation with the corrected data
    return updateTask({ id, data: apiData });
  };

  return (
    <div className="p-6 bg-white min-h-screen relative">
      <Header projectData={projectData} onAddTask={handleAddTask} />
      <Toolbar
        taskCount={filteredAndSortedTasks.length}
        onAddTask={handleAddTask}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        filters={filters}
        onFiltersChange={setFilters}
        view={view}
        onViewChange={setView}
      />
      {view === 'kanban' && (
        <KanbanBoard
          tasks={filteredAndSortedTasks}
          users={users}
          onStatusChange={handleStatusChange}
          onUpdateTask={handleUpdateTask}
          onViewTask={(task) => handleView(task as TaskType)}
          onEditTask={(task) => handleEdit(task as TaskType)}
          onDeleteTask={handleDeleteTask}
        />
      )}
      {view === 'list' && <TaskList tasks={filteredAndSortedTasks} users={users} onView={handleView} onEdit={handleEdit} onDelete={handleDeleteTask} />}

      {modalMode === 'create' ? (
        <CreateTaskModal
          isOpen={showModal}
          onSubmit={() => {
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      ) : (
        <TaskDetailsModal
          key={selectedTask?._id}
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          assignees={users}
          onUpdate={async (data) => updateTask({ id: data._id, data })}
        />
      )}
    </div>
  );
}
