import React, { useState } from "react";
import { TaskStatus, TaskPriority } from "@/types/admin/task";

interface TaskFiltersProps {
  onFilter: (filters: { status?: TaskStatus; priority?: TaskPriority; search?: string }) => void;
}

export default function TaskFilters({ onFilter }: TaskFiltersProps) {
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [priority, setPriority] = useState<TaskPriority | "">("");
  const [search, setSearch] = useState("");

  function handleFilter() {
    onFilter({
      status: status || undefined,
      priority: priority || undefined,
      search: search || undefined,
    });
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <input
        className="border rounded px-2 py-1"
        placeholder="Search title/desc"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select
        className="border rounded px-2 py-1"
        value={status}
        onChange={(e) => setStatus(e.target.value as TaskStatus | "")}
      >
        <option value="">All Statuses</option>
        <option value="backlog">Backlog</option>
        <option value="todo">Todo</option>
        <option value="in-progress">In Progress</option>
        <option value="in-review">In Review</option>
        <option value="blocked">Blocked</option>
        <option value="done">Done</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <select
        className="border rounded px-2 py-1"
        value={priority}
        onChange={(e) => setPriority(e.target.value as TaskPriority | "")}
      >
        <option value="">All Priorities</option>
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
      <button
        className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
        onClick={handleFilter}
        type="button"
      >
        Filter
      </button>
    </div>
  );
} 