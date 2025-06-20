import React, { useState } from "react";
import { Task, TaskStatus, TaskPriority } from "@/types/admin/task";

interface TaskFormProps {
  initial?: Partial<Task>;
  onSubmit: (data: Partial<Task>) => void;
  onClose: () => void;
}

const statusOptions: TaskStatus[] = [
  "backlog",
  "todo",
  "in-progress",
  "in-review",
  "blocked",
  "done",
  "cancelled",
];

const priorityOptions: TaskPriority[] = [
  "low",
  "medium",
  "high",
  "critical",
];

export default function TaskForm({ initial = {}, onSubmit, onClose }: TaskFormProps) {
  const [title, setTitle] = useState(initial.title || "");
  const [description, setDescription] = useState(initial.description || "");
  const [status, setStatus] = useState<TaskStatus>(initial.status || "todo");
  const [priority, setPriority] = useState<TaskPriority>(initial.priority || "medium");
  const [dueDate, setDueDate] = useState(
    initial.dueDate ? initial.dueDate.slice(0, 10) : ""
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      ...initial,
      title,
      description,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"
        onSubmit={handleSubmit}
      >
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          type="button"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-lg font-bold mb-4">
          {initial._id ? "Edit Task" : "Create Task"}
        </h2>
        <div className="mb-3">
          <label className="block mb-1 font-medium">Title</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="mb-3 flex gap-2">
          <div className="flex-1">
            <label className="block mb-1 font-medium">Status</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-medium">Priority</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              {priorityOptions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mb-3">
          <label className="block mb-1 font-medium">Due Date</label>
          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        <button
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          type="submit"
        >
          {initial._id ? "Update Task" : "Create Task"}
        </button>
      </form>
    </div>
  );
} 