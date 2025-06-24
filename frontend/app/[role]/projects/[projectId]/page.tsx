"use client";
import React, { useState, useEffect } from "react";
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
import TaskModal from '@/components/admin/TaskDetailsModal';

interface TaskType {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  tags?: string[];
  assignedTo?: string[];
  parentTaskId?: string;
  activityLog?: { userId: string; action: string; details?: any; timestamp: string }[];
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
}) {
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
    status: t.status as TaskStatus,
    dueDate: t.dueDate ? String(t.dueDate) : '',
  }));
}

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

  // Fetch statuses for this project
  const { data: statuses = [], refetch: refetchStatuses } = useGetStatusesQuery({ project });
  const [createStatus] = useCreateStatusMutation();
  const [updateStatus] = useUpdateStatusMutation();
  const [deleteStatus] = useDeleteStatusMutation();

  const [view, setView] = useState<"kanban" | "list" | "whiteboard">("kanban");
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">("view");
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [tasks, setTasks] = useState<TaskType[]>(normalizeTasks(tasksData));

  // Modal state for creating a new status
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusColor, setNewStatusColor] = useState("#cccccc");

  // Add advanced status deletion modal state
  const [showDeleteStatusModal, setShowDeleteStatusModal] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState(null);
  const [moveToStatus, setMoveToStatus] = useState("");
  const [tasksInStatus, setTasksInStatus] = useState([]);

  useEffect(() => {
    setTasks(normalizeTasks(tasksData));
  }, [tasksData]);

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

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const fromTask = tasksData.find((t) => t._id === active.id);
    const toCol = KanbanBoard.COLUMN_ORDER.find(
      (col) => col.id === over.id || tasksData.some((t) => t._id === over.id && t.status === col.id)
    );
    if (!fromTask || !toCol || fromTask.status === toCol.id) return;
    await updateTask({ id: fromTask._id, data: { status: toCol.id } });
  };

  const handleView = (task) => { setSelectedTask(task); setModalMode('view'); setShowModal(true); };
  const handleEdit = (task) => { setSelectedTask(task); setModalMode('edit'); setShowModal(true); };
  const handleDelete = async (task) => { await deleteTask(task._id); };

  // Header
  const Header = () => (
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
        </div>
      </div>
      <button
        onClick={() => {
          setModalMode("create");
          setShowModal(true);
        }}
        className="bg-white/20 absolute right-5 top-5   text-white text-xs px-3 py-2 cursor-pointer rounded-full items-baseline font-semibold uppercase tracking-wider"
      >
        Add task
      </button>
    </div>
  );

  // Toolbar
  const Toolbar = () => (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-gray-700">
          {tasksData.length} tasks
        </span>
        <button
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white px-4 py-2 rounded-xl font-semibold shadow hover:from-indigo-600 hover:to-fuchsia-600 transition"
          onClick={() => {
            setModalMode("create");
            setShowModal(true);
          }}
        >
          <HiPlus /> Add New
        </button>
        <button
          className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-blue-400 text-white px-4 py-2 rounded-xl font-semibold shadow hover:from-green-500 hover:to-blue-500 transition"
          onClick={() => setShowStatusModal(true)}
        >
          <HiPlus /> Add Status
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-xl bg-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 placeholder-gray-400 shadow"
          />
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        </div>
        <button className="flex items-center gap-1 bg-white/60 border border-white/30 px-3 py-2 rounded-xl text-gray-700 hover:bg-white/80 transition">
          <HiOutlineFilter /> Filters
        </button>
        <button className="flex items-center gap-1 bg-white/60 border border-white/30 px-3 py-2 rounded-xl text-gray-700 hover:bg-white/80 transition">
          <HiOutlineSortAscending /> Sort
        </button>
        <div className="flex gap-1 ml-2">
          <button
            className={`p-2 rounded-lg ${
              view === "kanban"
                ? "bg-indigo-500 text-white"
                : "bg-white/60 text-gray-700"
            }`}
            onClick={() => setView("kanban")}
          >
            <HiViewBoards />
          </button>
          <button
            className={`p-2 rounded-lg ${
              view === "list"
                ? "bg-indigo-500 text-white"
                : "bg-white/60 text-gray-700"
            }`}
            onClick={() => setView("list")}
          >
            <HiViewList />
          </button>
          <button
            className={`p-2 rounded-lg ${
              view === "whiteboard"
                ? "bg-indigo-500 text-white"
                : "bg-white/60 text-gray-700"
            }`}
            onClick={() => setView("whiteboard")}
          >
            📝
          </button>
        </div>
      </div>
    </div>
  );

  // Task List View
  const TaskList = () => (
    <div className="rounded-2xl bg-white/60 border border-white/30 backdrop-blur-md shadow-xl p-4">
      <table className="w-full text-left">
        <thead>
          <tr className="text-xs text-gray-500 uppercase">
            <th className="py-2">Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Due</th>
            <th>Tags</th>
            <th>Assignees</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className="border-b border-gray-200 hover:bg-white/80 transition"
            >
              <td className="py-2 font-semibold">{task.title}</td>
              <td>{task.description}</td>
              <td>{task.status}</td>
              <td>{task.priority}</td>
              <td>{task.dueDate}</td>
              <td>{task.tags?.join(", ")}</td>
              <td>
                <div className="flex -space-x-2">
                  {task.assignedTo?.map((userId) => (
                    <span
                      key={userId}
                      className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 border-2 border-white flex items-center justify-center text-xs font-bold shadow"
                    >
                      {userId[0]?.toUpperCase()}
                    </span>
                  ))}
                </div>
              </td>
              <td>
                <button
                  onClick={() => handleView(task)}
                  className="text-gray-400 hover:text-blue-600 mx-1"
                >
                  <HiOutlineEye />
                </button>
                <button
                  onClick={() => handleEdit(task)}
                  className="text-gray-400 hover:text-green-600 mx-1"
                >
                  <HiOutlinePencil />
                </button>
                <button
                  onClick={() => handleDelete(task)}
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
  );

  // Whiteboard View (dummy)
  const Whiteboard = () => (
    <div className="relative min-h-[400px] bg-gradient-to-br from-white/60 to-blue-100 rounded-2xl border border-white/30 shadow-xl p-8 flex flex-wrap gap-8">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          drag
          dragConstraints={{ left: 0, top: 0, right: 400, bottom: 200 }}
          className="w-60 h-40 bg-white/90 rounded-xl shadow-lg p-4 cursor-move flex flex-col gap-2"
        >
          <div className="font-bold text-lg text-indigo-600">
            Sticky Note {i}
          </div>
          <div className="text-gray-500 text-sm">
            This is a draggable sticky note. (Whiteboard demo)
          </div>
        </motion.div>
      ))}
    </div>
  );

  // Add Status Modal
  const AddStatusModal = () => (
    showStatusModal ? (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 shadow-xl w-80">
          <h3 className="font-bold mb-2">Add Status</h3>
          <input
            className="border rounded px-2 py-1 w-full mb-2"
            placeholder="Status name"
            value={newStatusName}
            onChange={e => setNewStatusName(e.target.value)}
          />
          <input
            type="color"
            className="w-8 h-8 mb-2"
            value={newStatusColor}
            onChange={e => setNewStatusColor(e.target.value)}
          />
          <div className="flex gap-2 mt-2">
            <button
              className="bg-indigo-500 text-white px-3 py-1 rounded"
              onClick={async () => {
                if (!newStatusName) return;
                await createStatus({ name: newStatusName, color: newStatusColor, project });
                setShowStatusModal(false);
                setNewStatusName("");
                setNewStatusColor("#cccccc");
                refetchStatuses();
              }}
            >Add</button>
            <button className="bg-gray-200 px-3 py-1 rounded" onClick={() => setShowStatusModal(false)}>Cancel</button>
          </div>
        </div>
      </div>
    ) : null
  );

  // Advanced Delete Status Modal
  const DeleteStatusModal = () => (
    showDeleteStatusModal && statusToDelete ? (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 shadow-xl w-96">
          <h3 className="font-bold mb-2">Delete Status: {statusToDelete.name}</h3>
          <p className="mb-2 text-sm text-gray-700">This status has {tasksInStatus.length} tasks. Please select a status to move them to before deleting.</p>
          <ul className="mb-2 max-h-32 overflow-y-auto text-xs text-gray-600">
            {tasksInStatus.map((t) => <li key={t._id}>• {t.title}</li>)}
          </ul>
          <select
            className="border rounded px-2 py-1 w-full mb-2"
            value={moveToStatus}
            onChange={e => setMoveToStatus(e.target.value)}
          >
            <option value="">Select status to move tasks</option>
            {statuses.filter(s => s._id !== statusToDelete._id).map(s => (
              <option key={s._id} value={s.name}>{s.name}</option>
            ))}
          </select>
          <div className="flex gap-2 mt-2">
            <button
              className="bg-indigo-500 text-white px-3 py-1 rounded"
              disabled={!moveToStatus}
              onClick={async () => {
                // Move all tasks to new status
                for (const t of tasksInStatus) {
                  await updateTask({ id: t._id, data: { status: moveToStatus } });
                }
                await deleteStatus(statusToDelete._id);
                setShowDeleteStatusModal(false);
                setStatusToDelete(null);
                setMoveToStatus("");
                setTasksInStatus([]);
                refetchStatuses();
              }}
            >Move & Delete</button>
            <button className="bg-gray-200 px-3 py-1 rounded" onClick={() => { setShowDeleteStatusModal(false); setStatusToDelete(null); }}>Cancel</button>
          </div>
        </div>
      </div>
    ) : null
  );

  return (
    <div className="p-6 bg-gradient-to-br from-[#e0e7ff] to-[#f4fafd] min-h-screen relative">
      <Header />
      <Toolbar />
      <KanbanBoard
        tasks={tasksData}
        statuses={statuses}
        onDragEnd={handleDragEnd}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusDelete={async (statusId) => {
          const statusObj = statuses.find(s => s._id === statusId);
          if (!statusObj) return;
          const tasksInCol = tasksData.filter(t => t.status === statusObj.name);
          if (tasksInCol.length > 0) {
            setStatusToDelete(statusObj);
            setTasksInStatus(tasksInCol);
            setShowDeleteStatusModal(true);
            return;
          }
          await deleteStatus(statusId);
          refetchStatuses();
        }}
      />
      {showModal && (
        <TaskModal
          task={selectedTask}
          mode={modalMode}
          onClose={() => setShowModal(false)}
          statuses={statuses}
        />
      )}
      <AddStatusModal />
      <DeleteStatusModal />
    </div>
  );
}
