import React from "react";
import { Task } from "@/types/admin/task";
import ShortMonthDate from "@/utils/time/ShortMonthDate";
interface TaskDetailsModalProps {
  task: Task | null;
  onClose: () => void;
}

export default function TaskDetailsModal({ task, onClose }: TaskDetailsModalProps) {
  if (!task) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-2">{task.title}</h2>
        <p className="mb-2 text-gray-700">{task.description}</p>
        <div className="mb-2">
          <span className="font-semibold">Status:</span> {task.status}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Priority:</span> {task.priority}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Due Date:</span>{" "}
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
      </div>
    </div>
  );
} 