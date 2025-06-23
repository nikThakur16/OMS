"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useGetProjectByIdQuery } from "@/store/api";
import ShortMonthDate from "@/utils/time/ShortMonthDate";
import Tasks from "@/components/tasks/Task";
const statusColumns = [
  { id: "backlog", title: "Backlog" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
  { id: "archived", title: "Archived" },
];

interface TaskType {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: string;
  tags?: string[];
  assignedTo?: string[];
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

export default function ProjectDetailsPage() {
  const params = useParams();
  const projectId = Array.isArray(params?.projectId)
    ? params.projectId[0]
    : params?.projectId;
  const { data: project, isLoading, error } = useGetProjectByIdQuery(projectId);
  console.log(project);
  console.log(JSON.stringify(project));

  const [view, setView] = useState<"kanban" | "list" | "whiteboard">("kanban");
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">(
    "view"
  );
  const [tasks, setTasks] = useState<TaskType[]>(project?.tasks || []);
  const [newTask, setNewTask] = useState({ title: "", description: "" });

  useEffect(() => {
    setTasks(project?.tasks || []);
  }, [project]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xl text-gray-500">Loading...</div>
    );
  }
  if (error || !project) {
    return (
      <div className="p-8 text-center text-xl text-gray-500">
        Project not found.
      </div>
    );
  }

  // Kanban drag logic (dummy, no real drag for now)
  function handleCardClick(
    task: TaskType,
    mode: "view" | "edit" | "create" = "view"
  ) {
    setSelectedTask(task);
    setModalMode(mode);
    setShowModal(true);
  }

  // ... (reuse the KanbanBoard, TaskList, Whiteboard, TaskModal, FloatingActionButton, etc. from tasks/page.tsx, but use project/tasks)

  // Header
  const Header = () => (
    <div className="relative rounded-3xl p-6 bg-[#175075]  shadow-xl mb-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="">
          <div className="flex items-center justify-between">
            {" "}
            <h2 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg mb-2">
              {project.name}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 items-center mb-2">
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
              Status: {project.status}
            </span>
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
              Start:{" "}
              {project.startDate ? (
                <ShortMonthDate date={project.startDate} />
              ) : (
                "N/A"
              )}
            </span>
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full">
              Due:{" "}
              {project.endDate ? (
                <ShortMonthDate date={project.endDate} />
              ) : (
                "N/A"
              )}
            </span>
          </div>
          {project.description && (
            <div className="text-white/80 text-sm mb-2">
              {project.description}
            </div>
          )}
          {project.manager && (
            <div className="text-white/80 text-sm">
              Manager:{" "}
              <span className="font-bold text-white">
                {project?.manager?.personalDetails.firstName}{" "}
                {project?.manager?.personalDetails.lastName}
              </span>
            </div>
          )}
          {project.team && project.team.length > 0 && (
            <div className="text-white/80 text-sm">
              Teams: {project.team.map((team: any) => team.name).join(", ")}
            </div>
          )}
          {project.departments && project.departments.length > 0 && (
            <div className="text-white/80 text-sm">
              Departments:{" "}
              {project.departments
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

  // ... (reuse Toolbar, KanbanBoard, TaskList, Whiteboard, TaskModal, FloatingActionButton from tasks/page.tsx, but use tasks state)

  // Toolbar
  const Toolbar = () => (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-gray-700">
          {tasks.length} tasks
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

  // Kanban Board with DnD
  const KanbanBoard = () => (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return;
        // Find the task and its column
        const fromCol = statusColumns.find((col) =>
          tasks.some((t) => t.id === active.id && t.status === col.id)
        );
        const toCol = statusColumns.find(
          (col) =>
            col.id === over.id ||
            tasks.some((t) => t.id === over.id && t.status === col.id)
        );
        if (!fromCol || !toCol) return;
        if (fromCol.id === toCol.id) return;
        setTasks((tasks) =>
          tasks.map((t) =>
            t.id === active.id ? { ...t, status: toCol.id } : t
          )
        );
      }}
    >
      <div className="flex gap-6 h-full overflow-x-auto p-2 bg-transparent">
        {statusColumns.map((col) => (
          <div
            key={col.id}
            className="flex-shrink-0 w-80 glass bg-white/40 rounded-2xl p-4 border border-white/30 backdrop-blur-md shadow-xl transition-all duration-300 hover:shadow-2xl hover:bg-white/60"
          >
            <div className="flex items-center mb-4">
              <h3 className="font-bold text-lg text-gray-800 flex-grow tracking-wide uppercase drop-shadow-sm letter-spacing-[0.05em]">
                {col.title}
              </h3>
              <button className="text-indigo-500 hover:text-indigo-700 ml-2">
                <HiPlus />
              </button>
            </div>
            <SortableContext
              items={tasks.filter((t) => t.status === col.id).map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {tasks
                .filter((t) => t.status === col.id)
                .map((task) => (
                  <SortableTask
                    key={task.id}
                    task={task}
                    onView={() => handleCardClick(task, "view")}
                    onEdit={() => handleCardClick(task, "edit")}
                    onDelete={() =>
                      setTasks(tasks.filter((t) => t.id !== task.id))
                    }
                  />
                ))}
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
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
                  onClick={() => handleCardClick(task, "view")}
                  className="text-gray-400 hover:text-blue-600 mx-1"
                >
                  <HiOutlineEye />
                </button>
                <button
                  onClick={() => handleCardClick(task, "edit")}
                  className="text-gray-400 hover:text-green-600 mx-1"
                >
                  <HiOutlinePencil />
                </button>
                <button
                  onClick={() =>
                    setTasks(tasks.filter((t) => t.id !== task.id))
                  }
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

  // Task Modal
  const TaskModal = () => (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative"
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>
            {modalMode === "view" && selectedTask && (
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {selectedTask.title}
                </h2>
                <div className="text-gray-600 mb-2">
                  {selectedTask.description}
                </div>
                <div className="flex gap-2 mb-2">
                  {selectedTask.tags?.map((tag: string) => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  Due: {selectedTask.dueDate}
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    onClick={() => setModalMode("edit")}
                  >
                    Edit
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => {
                      setTasks(tasks.filter((t) => t.id !== selectedTask.id));
                      setShowModal(false);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
            {modalMode === "edit" && selectedTask && (
              <div>
                <h2 className="text-2xl font-bold mb-2">Edit Task</h2>
                {/* Dummy edit form */}
                <input
                  className="w-full mb-2 p-2 border rounded"
                  defaultValue={selectedTask.title}
                />
                <textarea
                  className="w-full mb-2 p-2 border rounded"
                  defaultValue={selectedTask.description}
                />
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                  onClick={() => setShowModal(false)}
                >
                  Save
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => setModalMode("view")}
                >
                  Cancel
                </button>
              </div>
            )}
            {modalMode === "create" && (
              <div>
                <h2 className="text-2xl font-bold mb-2">Create Task</h2>
                <input
                  className="w-full mb-2 p-2 border rounded"
                  placeholder="Title"
                  value={newTask.title}
                  onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))}
                />
                <textarea
                  className="w-full mb-2 p-2 border rounded"
                  placeholder="Description"
                  value={newTask.description}
                  onChange={e => setNewTask(t => ({ ...t, description: e.target.value }))}
                />
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
                  onClick={() => {
                    setTasks(ts => [
                      ...ts,
                      {
                        id: Date.now().toString(),
                        title: newTask.title,
                        description: newTask.description,
                        status: "backlog",
                        priority: "low",
                        dueDate: "",
                        tags: [],
                        assignedTo: [],
                      },
                    ]);
                    setShowModal(false);
                    setNewTask({ title: "", description: "" });
                  }}
                >
                  Create
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 rounded"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Floating Action Button
  const FloatingActionButton = () => (
    <div className="fixed bottom-8 right-8 z-50">
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl shadow-xl hover:from-indigo-600 hover:to-fuchsia-600 transition"
      >
        <HiPlus />
      </motion.button>
    </div>
  );

  return (
    <div className="p-6 bg-white min-h-screen relative rounded-md shadow-lg">
      <Header />
    
        <>
   
          <div className="mb-8">
          <Tasks/>
          
          </div>
   
          <FloatingActionButton />
        </>
      ) 
    </div>
  );
}
