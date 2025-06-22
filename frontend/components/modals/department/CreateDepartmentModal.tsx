import React, { useState } from "react";
import { useAppSelector } from '@/store/hooks';

interface CreateDepartmentModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; description?: string; organizationId: string }) => void;
}

export default function CreateDepartmentModal({ open, onClose, onCreate }: CreateDepartmentModalProps) {
  const [form, setForm] = useState({ name: "", description: "" });
  const user = useAppSelector(state => state.login.user);
  const orgId = user?.organizationId || '684131f3c7a84ecf95f105b7';

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({ ...form, organizationId: orgId });
    setForm({ name: "", description: "" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-6">Create New Department</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department Name</label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Enter department name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              rows={2}
              placeholder="Enter description (optional)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors"
            >
              Create Department
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 