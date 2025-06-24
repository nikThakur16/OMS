import React, { useState } from "react";
import { Task } from "@/types/admin/task";
import ShortMonthDate from "@/utils/time/ShortMonthDate";

interface StatusType { _id: string; name: string; color?: string }

interface TaskDetailsModalProps {
  task: Task | null;
  mode?: 'view' | 'edit' | 'create';
  onClose: () => void;
  onSubmit?: (data: Partial<Task>) => void;
  statuses?: StatusType[];
}

export default function TaskDetailsModal({ task, mode = 'view', onClose, onSubmit, statuses = [] }: TaskDetailsModalProps) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || (statuses[0]?.name || ''),
    priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
  });

  const isEdit = mode === 'edit' || mode === 'create';

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (onSubmit) onSubmit({ ...form, dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined });
    onClose();
  }

  if (!task && mode !== 'create') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          ✕
        </button>
        {isEdit ? (
          <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold mb-2">{mode === 'create' ? 'Add Task' : 'Edit Task'}</h2>
            <input
              className="border rounded px-2 py-1 w-full mb-2"
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              required
            />
            <textarea
              className="border rounded px-2 py-1 w-full mb-2"
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />
            <select
              className="border rounded px-2 py-1 w-full mb-2"
              name="status"
              value={form.status}
              onChange={handleChange}
              required
            >
              {statuses.map(s => (
                <option key={s._id} value={s.name}>{s.name}</option>
              ))}
            </select>
            <select
              className="border rounded px-2 py-1 w-full mb-2"
              name="priority"
              value={form.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <input
              className="border rounded px-2 py-1 w-full mb-2"
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleChange}
            />
            <div className="flex gap-2 mt-2">
              <button className="bg-indigo-500 text-white px-3 py-1 rounded" type="submit">{mode === 'create' ? 'Create' : 'Save'}</button>
              <button className="bg-gray-200 px-3 py-1 rounded" type="button" onClick={onClose}>Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <h2 className="text-xl font-bold mb-2">{task.title}</h2>
            <p className="mb-2 text-gray-700">{task.description}</p>
            <div className="mb-2">
              <span className="font-semibold">Status:</span> {task.status}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Priority:</span> {task.priority}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Due Date:</span>{' '}
              {task.dueDate ? <ShortMonthDate date={task.dueDate} /> : ''}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Assignees:</span> {task.assignedTo?.length || 0}
            </div>
            <div className="text-xs text-gray-400 mt-4">
              Created: {new Date(task.createdAt).toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">
              Updated: {new Date(task.updatedAt).toLocaleString()}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 