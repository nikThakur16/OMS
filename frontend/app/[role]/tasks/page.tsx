"use client";
import React, { useState, useMemo } from "react";
import { Task } from "@/types/admin/task";
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "@/store/api";
import StatCard from "@/components/admin/StatCard";
import TasksTable from "@/components/admin/TasksTable";
import TaskDetailsModal from "@/components/admin/TaskDetailsModal";
import TaskForm from "@/components/admin/TaskForm";
import TaskFilters from "@/components/admin/TaskFilters";
import { HiOutlineClipboard, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineClock } from "react-icons/hi2";
import KanbanBoard from "@/components/admin/KanbanBoard";

type TaskFiltersType = {
  status?: string;
  priority?: string;
  search?: string;
};

export default function AdminTasksPage() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formInitial, setFormInitial] = useState<Partial<Task> | undefined>(undefined);
  const [filters, setFilters] = useState<TaskFiltersType>({});

  // RTK Query hooks
  const { data: tasks = [], isLoading, refetch } = useGetTasksQuery();

  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  // Stat calculations
  const totalTasks = tasks.length;
  const dueSoon = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) && t.status !== "done").length;
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length;
  const completed = tasks.filter(t => t.status === "done").length;

  // Client-side filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filters.status && t.status !== filters.status) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      if (
        filters.search &&
        !(
          t.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          t.description.toLowerCase().includes(filters.search.toLowerCase())
        )
      )
        return false;
      return true;
    });
  }, [tasks, filters]);

  function handleView(task: Task) {
    setSelectedTask(task);
  }

  function handleEdit(task: Task) {
    setFormInitial(task);
    setShowForm(true);
  }

  async function handleDelete(task: Task) {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    await deleteTask(task._id);
    refetch();
  }

  async function handleFormSubmit(data: Partial<Task>) {
    if (formInitial && formInitial._id) {
      await updateTask({ id: formInitial._id, data });
    } else {
      await createTask(data);
    }
    setShowForm(false);
    setFormInitial(undefined);
    refetch();
  }

  function handleDragEnd(result) {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const task = tasks.find((t) => t._id === draggableId);
    if (task && task.status !== destination.droppableId) {
      updateTask({ id: task._id, data: { status: destination.droppableId } });
      refetch();
    }
  }

  return (
    <div className="p-6 bg-[#f4fafd] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#0B3C5D]">Tasks</h1>
        <button
          className="bg-[#0B3C5D] text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-[#14507a] transition"
          onClick={() => {
            setFormInitial(undefined);
            setShowForm(true);
          }}
        >
          + Create Task
        </button>
      </div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Tasks" value={totalTasks} icon={<HiOutlineClipboard />} color="bg-blue-100 text-blue-800" />
        <StatCard label="Due Soon" value={dueSoon} icon={<HiOutlineClock />} color="bg-yellow-100 text-yellow-800" />
        <StatCard label="Overdue" value={overdue} icon={<HiOutlineExclamationCircle />} color="bg-red-100 text-red-800" />
        <StatCard label="Completed" value={completed} icon={<HiOutlineCheckCircle />} color="bg-green-100 text-green-800" />
      </div>
      {/* Filters */}
      <TaskFilters onFilter={setFilters} />
      {/* Table */}
      <div className="bg-white rounded-xl shadow p-4">
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : (
          <KanbanBoard
            tasks={filteredTasks}
            onDragEnd={handleDragEnd}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
      {/* Modals */}
      {selectedTask && (
        <TaskDetailsModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
      {showForm && (
        <TaskForm
          initial={formInitial}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}