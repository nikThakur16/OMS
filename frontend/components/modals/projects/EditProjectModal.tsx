'use client';
import React, { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import { useGetUsersQuery, useGetTeamsQuery, useGetDepartmentsQuery, useCreateDepartmentMutation, useCreateTeamMutation } from '@/store/api';
import { User } from '@/types/users/user';
import CreateDepartmentModal from '../department/CreateDepartmentModal';
import CreateTeamModal from '../team/CreateTeamModal';
import dynamic from "next/dynamic";
const Select = dynamic(() => import("react-select"), { ssr: false });

interface EditProjectModalProps {
  open: boolean;
  onClose: () => void;
  project: any; // Pass the full project object to edit
  onUpdate: (data: any) => void;
}

export default function EditProjectModal({ open, onClose, project, onUpdate }: EditProjectModalProps) {
  const { data: users } = useGetUsersQuery() as { data?: User[] };
  const { data: teams, refetch: refetchTeams } = useGetTeamsQuery();
  const { data: departments, refetch: refetchDepartments } = useGetDepartmentsQuery();
  const [createDepartment] = useCreateDepartmentMutation();
  const [createTeam] = useCreateTeamMutation();

  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  // Custom fields and values
  const [customFields, setCustomFields] = useState<{ name: string; type: string; options?: string[] }[]>([]);
  const [newField, setNewField] = useState({ name: "", type: "text", options: [] });
  const [customFieldValues, setCustomFieldValues] = useState<{ [key: string]: any }>({});

  // Budget and currency
  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD');

  // Pre-fill form on open
  useEffect(() => {
    if (open && project) {
      setCustomFields(project.customFields || []);
      setCustomFieldValues(project.customFieldValues || {});
      setBudget(project.budget || '');
      setCurrency(project.currency || 'USD');
    }
  }, [open, project]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
            onClick={onClose}
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-6">Edit Project</h2>
          <Formik
            initialValues={{
              name: project.name || "",
              description: project.description || "",
              startDate: project.startDate ? project.startDate.slice(0, 10) : "",
              endDate: project.endDate ? project.endDate.slice(0, 10) : "",
              status: project.status || "active",
              manager: project.manager?._id || "",
              team: project.team?.map((t: any) => t._id) || [],
              departments: project.departments?.map((d: any) => d._id) || [],
              assignedTo: project.assignedTo || [],
              customFields: [],
              customFieldValues: {},
            }}
            enableReinitialize
            onSubmit={(values, { resetForm }) => {
              const payload = { ...values } as any;
              if (!payload.manager) delete payload.manager;
              payload.customFields = customFields;
              payload.customFieldValues = customFieldValues;
              payload.budget = budget;
              payload.currency = currency;
              onUpdate(payload);
              resetForm();
            }}
          >
            {({ values, setFieldValue }) => {
              const filteredTeams = selectedDepartment
                ? teams?.filter(team => team.departmentId === selectedDepartment) || []
                : teams || [];

              const filteredUsers = users?.filter(user => {
                if (selectedDepartment && user.personalDetails.department !== selectedDepartment) {
                  return false;
                }
                if (selectedTeam && (!user.teams || !user.teams.includes(selectedTeam))) {
                  return false;
                }
                return true;
              }) || [];

              return (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                    <Field
                      name="name"
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <Field
                      as="textarea"
                      name="description"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      rows={3}
                      placeholder="Enter project description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                      <Field
                        name="startDate"
                        type="date"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                      <Field
                        name="endDate"
                        type="date"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <Field
                      as="select"
                      name="status"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      <option value="active">Active</option>
                      <option value="on-hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </Field>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Manager</label>
                    <Field
                      as="select"
                      name="manager"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      <option value="">Select Manager</option>
                      {users && users.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.personalDetails.firstName} {user.personalDetails.lastName}
                        </option>
                      ))}
                    </Field>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <select
                      className="p-2 border rounded"
                      value={selectedDepartment}
                      onChange={e => {
                        setSelectedDepartment(e.target.value);
                        setSelectedTeam(""); // reset team filter if department changes
                      }}
                    >
                      <option value="">All Departments</option>
                      {departments && departments.map(dept => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                      ))}
                    </select>
                    <select
                      className="p-2 border rounded"
                      value={selectedTeam}
                      onChange={e => setSelectedTeam(e.target.value)}
                      disabled={filteredTeams.length === 0}
                    >
                      <option value="">All Teams</option>
                      {filteredTeams.map(team => (
                        <option key={team._id} value={team._id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assigned People</label>
                    <div className="max-h-48 overflow-y-auto border rounded p-2 bg-gray-50">
                      <div className="mb-2">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={filteredUsers.length > 0 && values.assignedTo.length === filteredUsers.length}
                            onChange={e => {
                              if (e.target.checked) {
                                setFieldValue("assignedTo", filteredUsers.map(u => u._id));
                              } else {
                                setFieldValue("assignedTo", []);
                              }
                            }}
                          />
                          <span className="ml-2 font-semibold">Select All</span>
                        </label>
                      </div>
                      {filteredUsers.map(user => (
                        <label key={user._id} className="flex items-center mb-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={values.assignedTo.includes(user._id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setFieldValue("assignedTo", [...values.assignedTo, user._id]);
                              } else {
                                setFieldValue("assignedTo", values.assignedTo.filter(id => id !== user._id));
                              }
                            }}
                          />
                          <span className="ml-2">{user.personalDetails.firstName} {user.personalDetails.lastName} ({user._id})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Custom Fields</h3>
                    {customFields.map((field, idx) => (
                      <div key={idx} className="flex gap-2 items-center mb-2">
                        <span>{field.name} ({field.type})</span>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded"
                          onClick={() => {
                            setCustomFields(customFields.filter((_, i) => i !== idx));
                            setCustomFieldValues(prev => {
                              const updated = { ...prev };
                              delete updated[field.name];
                              return updated;
                            });
                          }}
                          title="Delete field"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Field Name"
                        value={newField.name}
                        onChange={e => setNewField({ ...newField, name: e.target.value })}
                        className="border p-1 rounded"
                      />
                      <select
                        value={newField.type}
                        onChange={e => setNewField({ ...newField, type: e.target.value, options: [] })}
                        className="border p-1 rounded"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="select">Select</option>
                      </select>
                      {newField.type === "select" && (
                        <input
                          type="text"
                          placeholder="Comma separated options"
                          value={newField.options?.join(",") || ""}
                          onChange={e =>
                            setNewField({
                              ...newField,
                              options: e.target.value.split(",").map(opt => opt.trim()),
                            })
                          }
                          className="border p-1 rounded"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (!newField.name) return;
                          setCustomFields([...customFields, newField]);
                          setNewField({ name: "", type: "text", options: [] });
                        }}
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                  {customFields.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2">Custom Field Values</h3>
                      {customFields.map((field, idx) => (
                        <div key={idx} className="flex gap-2 items-center mb-2">
                          <label className="w-32">{field.name}:</label>
                          {field.type === "text" && (
                            <input
                              type="text"
                              value={customFieldValues[field.name] || ""}
                              onChange={e =>
                                setCustomFieldValues({ ...customFieldValues, [field.name]: e.target.value })
                              }
                              className="border p-1 rounded"
                            />
                          )}
                          {field.type === "number" && (
                            <input
                              type="number"
                              value={customFieldValues[field.name] || ""}
                              onChange={e =>
                                setCustomFieldValues({ ...customFieldValues, [field.name]: e.target.value })
                              }
                              className="border p-1 rounded"
                            />
                          )}
                          {field.type === "date" && (
                            <input
                              type="date"
                              value={customFieldValues[field.name] || ""}
                              onChange={e =>
                                setCustomFieldValues({ ...customFieldValues, [field.name]: e.target.value })
                              }
                              className="border p-1 rounded"
                            />
                          )}
                          {field.type === "select" && (
                            <select
                              value={customFieldValues[field.name] || ""}
                              onChange={e =>
                                setCustomFieldValues({ ...customFieldValues, [field.name]: e.target.value })
                              }
                              className="border p-1 rounded"
                            >
                              <option value="">Select...</option>
                              {field.options?.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                    <input
                      type="number"
                      min="0"
                      value={budget}
                      onChange={e => setBudget(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="Enter project budget"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select
                      value={currency}
                      onChange={e => setCurrency(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      {/* Add more currencies as needed */}
                    </select>
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
                      className="flex-1 px-4 py-3 bg-[#175075] text-white rounded-lg font-semibold hover:bg-indigo-600 transition-colors"
                    >
                      Update Project
                    </button>
                  </div> 
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
      <CreateDepartmentModal open={showDepartmentModal} onClose={() => setShowDepartmentModal(false)} onCreate={async (data) => {
        await createDepartment(data).unwrap();
        refetchDepartments();
        setShowDepartmentModal(false);
      }} />
      <CreateTeamModal open={showTeamModal} onClose={() => setShowTeamModal(false)} onCreate={async (data) => {
        await createTeam(data).unwrap();
        refetchTeams();
        setShowTeamModal(false);
      }} />
    </>
  );
}
