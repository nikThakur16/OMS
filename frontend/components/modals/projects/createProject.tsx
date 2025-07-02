import React, { useState } from "react";
import { useGetUsersQuery, useGetTeamsQuery, useGetDepartmentsQuery, useCreateDepartmentMutation, useCreateTeamMutation } from '@/store/api';
import { User } from '@/types/users/user';
import { Team } from '@/types/admin/team';
import { Department } from '@/types/admin/department';
import CreateDepartmentModal from '../department/CreateDepartmentModal';
import CreateTeamModal from '../team/CreateTeamModal';
import { Formik, Form, Field } from "formik";
import dynamic from "next/dynamic";
import { HiOutlineTrash } from "react-icons/hi";
const Select = dynamic(() => import("react-select"), { ssr: false });

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status: string;
    manager?: string;
    team?: string[];
    departments?: string[];
    assignedTo: string[];
    customFields: { name: string; type: string; options?: string[] }[];
    customFieldValues: { [key: string]: any };
    budget: number;
    currency: string;
  }) => void;
}

export default function CreateProjectModal({ open, onClose, onCreate }: CreateProjectModalProps) {
  const { data: users } = useGetUsersQuery() as { data?: User[] };
  const { data: teams, refetch: refetchTeams } = useGetTeamsQuery();
  const { data: departments, refetch: refetchDepartments } = useGetDepartmentsQuery();
  const [createDepartment] = useCreateDepartmentMutation();
  const [createTeam] = useCreateTeamMutation();

  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  const [customFields, setCustomFields] = useState<
    { name: string; type: string; options?: string[] }[]
  >([]);
  const [newField, setNewField] = useState({ name: "", type: "text", options: [] });
  const [customFieldValues, setCustomFieldValues] = useState<{ [key: string]: any }>({});

  const [budget, setBudget] = useState('');
  const [currency, setCurrency] = useState('USD'); // Default currency

  const [showAssignees, setShowAssignees] = useState(false);

  const selectedDeptObj = departments?.find(dept => dept._id === selectedDepartment);
  const selectedDeptName = selectedDeptObj?.name;

  if (!open) return null;

  console.log("Users:", users, "Departments:", departments, "SelectedDept:", selectedDepartment);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center text-[#04567B] bg-black/40">
        <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
            onClick={onClose}
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
          <Formik
            initialValues={{
              name: "",
              description: "",
              startDate: "",
              endDate: "",
              status: "active",
              manager: "",
              team: [] as string[],
              departments: [] as string[],
              assignedTo: [] as string[],
              customFields: [],
              customFieldValues: {},
            }}
            onSubmit={(values, { resetForm }) => {
              const payload = { ...values } as any;
              if (!payload.manager) delete payload.manager;
              payload.customFields = customFields;
              payload.customFieldValues = customFieldValues;
              payload.budget = budget;
              payload.currency = currency;
              onCreate(payload);
              resetForm();
            }}
          >
            {({ values, setFieldValue }) => {
              const filteredTeams = selectedDepartment
                ? teams?.filter(team => team.departmentId === selectedDepartment) || []
                : teams || [];

              const filteredUsers = users?.filter(user => {
                if (selectedDepartment && user.personalDetails.department !== selectedDeptName) {
                  return false;
                }
                if (selectedTeam && (!user.teams || !user.teams.includes(selectedTeam))) {
                  return false;
                }
                console.log('user', user.personalDetails.firstName, 'userDept', user.personalDetails.department, 'selectedDept', selectedDeptName);
                return true;
              }) || [];

              const userOptions = filteredUsers.map(user => ({
                value: user._id,
                label: `${user.personalDetails.firstName} ${user.personalDetails.lastName} (${user._id})`
              }));

              return (
                <Form className="space-y-4 ">
                  <div>
                    <label className="block text-sm font-bold  mb-2">Project Name</label>
                    <Field
                      name="name"
                      type="text"
                      className="w-full p-3 border border-none font-semibold text-gray-700 rounded-lg focus:outline-none bg-[#D3E7F0] focus:none"
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Description</label>
                    <Field
                      as="textarea"
                      name="description"
                     className="w-full p-3 border border-none font-semibold text-gray-700 rounded-lg focus:outline-none bg-[#D3E7F0] focus:none"
                      rows={3}
                      placeholder="Enter project description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">Start Date</label>
                      <Field
                        name="startDate"
                        type="date"
                       className="w-full p-3 border border-none font-bold rounded-lg focus:outline-none bg-[#D3E7F0] focus:none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">End Date</label>
                      <Field
                        name="endDate"
                        type="date"
                        className="w-full p-3 border border-none font-semibold text-gray-700 rounded-lg focus:outline-none bg-[#D3E7F0] focus:none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Status</label>
                    <Field
                      as="select"
                      name="status"
                     className="w-full p-3 border border-none font-semibold text-gray-700 rounded-lg focus:outline-none bg-[#D3E7F0] focus:none"
                    >
                      <option  className="font-bold" value="active">Active</option>
                      <option className="font-bold"  value="on-hold">On Hold</option>
                      <option  className="font-bold"   value="completed">Completed</option>
                      <option  className="font-bold"  value="archived">Archived</option>
                    </Field>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Manager</label>
                    <Field
                      as="select"
                      name="manager"
                       className="w-full p-3 border border-none font-semibold text-gray-700 rounded-lg focus:outline-none bg-[#D3E7F0] focus:none"
                    >
                      <option className="font-bold"  value="">Select Manager</option>
                      {users && users.map(user => (
                        <option className="font-semibold"  key={user._id} value={user._id}>
                          {user.personalDetails.firstName} {user.personalDetails.lastName}
                        </option>
                      ))}
                    </Field>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <select
                      className="p-2 border border-none bg-[#D3E7F0] text-gray-700  font-semibold rounded focus:outline-none focus:none"
                      value={selectedDepartment}
                      onChange={e => {
                        setSelectedDepartment(e.target.value);
                        setSelectedTeam(""); // reset team filter if department changes
                      }}
                    >
                      <option className="font-semibold" value="">All Departments</option>
                      {departments && departments.map(dept => (
                        <option className="font-semibold" key={dept._id} value={dept._id}>{dept.name}</option>
                      ))}
                    </select>
                    <select
                      className="p-2 border border-none  bg-[#D3E7F0] text-gray-700  font-semibold  rounded focus:outline-none focus:none"
                      value={selectedTeam}
                      onChange={e => setSelectedTeam(e.target.value)}
                      disabled={filteredTeams.length === 0}
                    >
                      <option className="font-semibold" value="">All Teams</option>
                      {filteredTeams.map(team => (
                        <option className="font-semibold" key={team._id} value={team._id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-bold text-[#04567B] mb-2">Assigned People</label>
                    <button
                      type="button"
                      className="w-full bg-[#D3E7F0] border rounded p-2 text-left"
                      onClick={() => setShowAssignees(v => !v)}
                    >
                      {values.assignedTo.length > 0
                        ? `${values.assignedTo.length} selected`
                        : "Select people..."}
                    </button>
                    {showAssignees && (
                      <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-48 overflow-y-auto">
                        <div className="p-2">
                          <label className="inline-flex items-center mb-2">
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
                          {filteredUsers.map(user => (
                            <label key={user._id} className="flex items-center mb-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={values.assignedTo.includes(user._id)}
                                className="font-bold" 
                                onChange={e => {
                                  if (e.target.checked) {
                                    setFieldValue("assignedTo", [...values.assignedTo, user._id]);
                                  } else {
                                    setFieldValue("assignedTo", values.assignedTo.filter(id => id !== user._id));
                                  }
                                }}
                              />
                              <span className="ml-2 font-medium">{user.personalDetails.firstName} {user.personalDetails.lastName}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                
                
                  <div>
                    <label className="block text-sm font-bold mb-2">Budget</label>
                    <input
                      type="number"
                      min="0"
                      value={budget}
                      onChange={e => setBudget(e.target.value)}
                      className="w-full p-3 border border-none font-semibold text-gray-700 rounded-lg focus:outline-none bg-[#D3E7F0] focus:none"
                      placeholder="Enter project budget"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Currency</label>
                    <select
                      value={currency}
                      onChange={e => setCurrency(e.target.value)}
                      className="w-full p-3 border border-none font-semibold text-gray-700 rounded-lg focus:outline-none bg-[#D3E7F0] focus:none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      {/* Add more currencies as needed */}
                    </select>
                  </div>
                  {customFields.length > 0 && (
                    <div className="mb-4">
                      
                      {customFields.map((field, idx) => (
                        <div key={idx} className="flex flex-col gap-2  mb-1">
                          <div className="flex items-center justify-between">
                          <label className="w-32 text-[#04567B] text-sm font-bold">{field.name}</label>
                          <button
                          type="button"
                          className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded"
                          onClick={() => {
                            setCustomFields(
                              customFields.filter((_, i) => i !== idx)
                            );
                            setCustomFieldValues((prev) => {
                              const updated = { ...prev };
                              delete updated[field.name];
                              return updated;
                            });
                          }}
                          title="Delete field"
                        >
             <HiOutlineTrash className="text-[16px]" />
                        </button>
                          </div>
                          {field.type === "text" && (
                            <input
                              type="text"
                              value={customFieldValues[field.name] || ""}
                              onChange={(e) =>
                                setCustomFieldValues({
                                  ...customFieldValues,
                                  [field.name]: e.target.value,
                                })
                              }
                              className="border p-1 rounded bg-[#D3E7F0]"
                            />
                          )}
                          {field.type === "number" && (
                            <input
                              type="number"
                              value={customFieldValues[field.name] || ""}
                              onChange={(e) =>
                                setCustomFieldValues({
                                  ...customFieldValues,
                                  [field.name]: e.target.value,
                                })
                              }
                              className="border p-1 rounded bg-[#D3E7F0]"
                            />
                          )}
                          {field.type === "date" && (
                            <input
                              type="date"
                              value={customFieldValues[field.name] || ""}
                              onChange={(e) =>
                                setCustomFieldValues({
                                  ...customFieldValues,
                                  [field.name]: e.target.value,
                                })
                              }
                              className="border p-1 rounded bg-[#D3E7F0]"
                            />
                          )}
                          {field.type === "select" && (
                            <select
                              value={customFieldValues[field.name] || ""}
                              onChange={(e) =>
                                setCustomFieldValues({
                                  ...customFieldValues,
                                  [field.name]: e.target.value,
                                })
                              }
                              className="border p-1 rounded bg-[#D3E7F0]"
                            >
                              <option value="">Select...</option>
                              {field.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mb-4 ">
                    <h3 className="font-bold text-[#04567B] text-sm mb-2">
                    Add Custom Fields
                    </h3>
                    
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Field Name"
                        value={newField.name}
                        onChange={(e) =>
                          setNewField({ ...newField, name: e.target.value })
                        }
                        className="border p-1 rounded bg-[#D3E7F0]"
                      />
                      <select
                        value={newField.type}
                        onChange={(e) =>
                          setNewField({
                            ...newField,
                            type: e.target.value,
                            options: [],
                          })
                        }
                        className="border p-1 rounded bg-[#D3E7F0]"
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
                          onChange={(e) =>
                            setNewField({
                              ...newField,
                              options: e.target.value
                                .split(",")
                                .map((opt) => opt.trim()),
                            })
                          }
                          className="border p-1 rounded bg-[#D3E7F0]"
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
                      Create Project
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
