import React from "react";
import { Task } from "@/types/admin/task";
import { HiOutlineUser, HiOutlineChatBubbleLeftRight, HiOutlineCalendar, HiOutlineFlag, HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";
import ShortMonthDate from "@/utils/time/ShortMonthDate";
interface TaskCardProps {
  task: Task;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export default function TaskCard({ task, onView, onEdit, onDelete }: TaskCardProps) {
  // Color by priority
  const priorityColor = {
    low: "border-l-4 border-green-400",
    medium: "border-l-4 border-yellow-400",
    high: "border-l-4 border-orange-400",
    critical: "border-l-4 border-red-500",
  }[task.priority] || "border-l-4 border-gray-200";

  return (
    <div className={`bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col gap-2 ${priorityColor}`}>
      <div className="flex justify-between items-center">
        <span className="font-bold">{task.title}</span>
        <div className="flex gap-2">
          <button onClick={() => onView(task)} title="View" className="hover:text-blue-600"><HiOutlineEye /></button>
          <button onClick={() => onEdit(task)} title="Edit" className="hover:text-green-600"><HiOutlinePencil /></button>
          <button onClick={() => onDelete(task)} title="Delete" className="hover:text-red-600"><HiOutlineTrash /></button>
        </div>
      </div>
      <div className="text-sm text-gray-500">{task.description}</div>
      <div className="flex items-center gap-2">
        <HiOutlineFlag className="text-xs" />
        <span className="text-xs">{task.priority}</span>
        <HiOutlineCalendar className="text-xs ml-2" />
        <span className="text-xs">{task.dueDate ? <ShortMonthDate date={task.dueDate} /> : ''}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <HiOutlineUser /> {task.assignedTo?.length || 0}
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <HiOutlineChatBubbleLeftRight /> {task.commentsCount || 0}
        </span>
      </div>
      <div className="flex gap-2 text-xs text-gray-400 mt-1">
        {task.projectName && <span>Project: {task.projectName}</span>}
        {task.teamName && <span>Team: {task.teamName}</span>}
        {task.departmentName && <span>Dept: {task.departmentName}</span>}
      </div>
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded h-2 mt-2">
        <div
          className="bg-blue-500 h-2 rounded transition-all"
          style={{ width: `${task.percentComplete || 0}%` }}
        />
      </div>
    </div>
  );
}
