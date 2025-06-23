import React from "react";
import { Task } from "@/types/admin/task";
import ShortMonthDate from "@/utils/time/ShortMonthDate"; 
interface TasksTableProps {
  tasks: Task[];
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TasksTable({ tasks, onView, onEdit, onDelete }: TasksTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3">Title</th>
            <th className="p-3">Status</th>
            <th className="p-3">Priority</th>
            <th className="p-3">Assignees</th>
            <th className="p-3">Due Date</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 && (
            <tr>
              <td colSpan={6} className="p-4 text-center text-gray-500">
                No tasks found.
              </td>
            </tr>
          )}
          {tasks.map((task) => (
            <tr key={task._id} className="border-t">
              <td className="p-3">{task.title}</td>
              <td className="p-3 capitalize">{task.status}</td>
              <td className="p-3 capitalize">{task.priority}</td>
              <td className="p-3">{task.assignedTo?.length || 0}</td>
              <td className="p-3">{task.dueDate ? <ShortMonthDate date={task.dueDate} /> : ''}</td>
              <td className="p-3 space-x-2">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => onView(task)}
                >
                  View
                </button>
                <button
                  className="text-green-600 hover:underline"
                  onClick={() => onEdit(task)}
                >
                  Edit
                </button>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => onDelete(task)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 