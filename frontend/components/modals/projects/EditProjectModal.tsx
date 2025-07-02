"use client";
import React, { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import {
  useGetUsersQuery,
  useGetTeamsQuery,
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useCreateTeamMutation,
  useGetAssignableUsersByProjectQuery,
} from "@/store/api";
import { User } from "@/types/users/user";
import CreateDepartmentModal from "../department/CreateDepartmentModal";
import CreateTeamModal from "../team/CreateTeamModal";
import dynamic from "next/dynamic";
import { useSelector } from "react-redux";
import { useAppSelector } from "@/store/hooks";
import { HiOutlineTrash } from "react-icons/hi2";
const Select = dynamic(() => import("react-select"), { ssr: false });

interface EditProjectModalProps {
  open: boolean;
  onClose: () => void;
  project: any; // Pass the full project object to edit
  onUpdate: (data: any) => void;
}

export default function EditProjectModal({
  open,
  onClose,
  project,
  onUpdate,
}: EditProjectModalProps) {
  const { data: allUsers, isLoading: usersLoading } = useGetUsersQuery();
  const { data: teams, refetch: refetchTeams } = useGetTeamsQuery();
  const { data: departments, refetch: refetchDepartments } =
    useGetDepartmentsQuery();
  const [createDepartment] = useCreateDepartmentMutation();
  const [createTeam] = useCreateTeamMutation();

  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");

  // Custom fields and values
  const [customFields, setCustomFields] = useState<
    { name: string; type: string; options?: string[] }[]
  >([]);
  const [newField, setNewField] = useState({
    name: "",
    type: "text",
    options: [],
  });
  const [customFieldValues, setCustomFieldValues] = useState<{
    [key: string]: any;
  }>({});

  // Budget and currency
  const [budget, setBudget] = useState("");
  const [currency, setCurrency] = useState("USD");

  // Pre-fill form on open
  useEffect(() => {
    if (open && project) {
      setCustomFields(project.customFields || []);
      setCustomFieldValues(project.customFieldValues || {});
      setBudget(project.budget || "");
      setCurrency(project.currency || "USD");
    }
  }, [open, project]);

  const user = useAppSelector((state) => state.login.user);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 text-black font-medium flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl"
            onClick={onClose}
          >
            &times;
          </button>
          <h2 className="text-2xl text-[#04567B]  font-bold mb-6">
            Edit Project
          </h2>
          <Formik
            initialValues={{
              name: project.name || "",
              description: project.description || "",
              startDate: project.startDate
                ? project.startDate.slice(0, 10)
                : "",
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
                ? teams?.filter(
                    (team) => team.departmentId === selectedDepartment
                  ) || []
                : teams || [];

              const filteredUsers =
                allUsers?.filter((user) => {
                  if (
                    selectedDepartment &&
                    user.personalDetails.department !== selectedDepartment
                  ) {
                    return false;
                  }
                  if (
                    selectedTeam &&
                    (!user.teams || !user.teams.includes(selectedTeam))
                  ) {
                    return false;
                  }
                  return true;
                }) || [];
              // Add at the top of your component
              const [showUserList, setShowUserList] = useState(false);
              const allSelected =
                filteredUsers.length > 0 &&
                values.assignedTo.length === filteredUsers.length;

              return (
                <Form className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#04567B] mb-2">
                      Project Name
                    </label>
                    <Field
                      name="name"
                      type="text"
                      className="w-full p-3 border bg-[#D3E7F0] border-gray-300 rounded-lg focus:outline-none "
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#04567B] mb-2">
                      Description
                    </label>
                    <Field
                      as="textarea"
                      name="description"
                      className="w-full p-3 border bg-[#D3E7F0] text-black font-small border-gray-300 rounded-lg focus:outline-none "
                      rows={3}
                      placeholder="Enter project description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#04567B] mb-2">
                        Start Date
                      </label>
                      <Field
                        name="startDate"
                        type="date"
                        className="w-full p-3 border bg-[#D3E7F0] border-gray-300 rounded-lg focus:outline-none "
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#04567B]  mb-2">
                        End Date
                      </label>
                      <Field
                        name="endDate"
                        type="date"
                        className="w-full p-3 border bg-[#D3E7F0] border-gray-300 rounded-lg focus:outline-none "
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#04567B] mb-2">
                      Status
                    </label>
                    <Field
                      as="select"
                      name="status"
                      className="w-full p-3 border bg-[#D3E7F0] border-gray-300 rounded-lg focus:outline-none "
                    >
                      <option value="active">Active</option>
                      <option value="on-hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </Field>
                  </div>
                  {user?.role === "Admin" && (
                    <div>
                      <label className="block text-sm font-bold text-[#04567B] mb-2">
                        Manager
                      </label>
                      <Field
                        as="select"
                        name="manager"
                        className="w-full p-3 border bg-[#D3E7F0] border-gray-300 rounded-lg focus:outline-none "
                      >
                        <option value="">Select Manager</option>
                        {allUsers?.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.personalDetails.firstName}{" "}
                            {user.personalDetails.lastName}
                          </option>
                        ))}
                      </Field>
                    </div>
                  )}
                  <div className="flex gap-2 mb-2">
                    <select
                      className="p-2 border rounded bg-[#D3E7F0]"
                      value={selectedDepartment}
                      onChange={(e) => {
                        setSelectedDepartment(e.target.value);
                        setSelectedTeam(""); // reset team filter if department changes
                      }}
                    >
                      <option value="">All Departments</option>
                      {departments &&
                        departments.map((dept) => (
                          <option key={dept._id} value={dept._id}>
                            {dept.name}
                          </option>
                        ))}
                    </select>
                    <select
                      className="p-2 border rounded bg-[#D3E7F0]"
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      disabled={filteredTeams.length === 0}
                    >
                      <option value="">All Teams</option>
                      {filteredTeams.map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#04567B] mb-2">
                      Assigned People
                    </label>

                    {/* Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setShowUserList(!showUserList)}
                      className="w-full flex justify-between items-center px-4 py-2 border border-[#04567B] rounded bg-gray-50  font-medium shadow-sm hover:bg-gray-100 transition"
                    >
                      Select Users
                      <svg
                        className="w-5 h-5 ml-2"
                        fill="none"
                        stroke="#04567B"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Dropdown List */}
                    {showUserList && (
                      <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-lg p-4 space-y-2">
                        {/* Select All */}
                        <div className="border-b pb-2 mb-2">
                          <label className="inline-flex items-center text-sm font-medium ">
                            <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFieldValue(
                                    "assignedTo",
                                    filteredUsers.map((u) => u._id)
                                  );
                                } else {
                                  setFieldValue("assignedTo", []);
                                }
                              }}
                              className="mr-2"
                            />
                            Select All
                          </label>
                        </div>

                        {/* Individual Users */}
                        {filteredUsers.map((user) => (
                          <label
                            key={user._id}
                            className="flex items-center text-sm text-gray-700 hover:bg-gray-50 px-2 py-1 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={values.assignedTo.includes(user._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFieldValue("assignedTo", [
                                    ...values.assignedTo,
                                    user._id,
                                  ]);
                                } else {
                                  setFieldValue(
                                    "assignedTo",
                                    values.assignedTo.filter(
                                      (id) => id !== user._id
                                    )
                                  );
                                }
                              }}
                              className="mr-2"
                            />
                            {user.personalDetails.firstName}{" "}
                            {user.personalDetails.lastName}
                            <span className="text-xs text-gray-400 ml-1">
                              ({user._id})
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  
                  <div>
                    <label className="block text-sm font-bold text-[#04567B] mb-2">
                      Budget
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full p-3 border bg-[#D3E7F0] border-gray-300 rounded-lg focus:outline-none "
                      placeholder="Enter project budget"
                    />
                  </div>
                  <div>
                    <label className="block text-sm  text-[#04567B] font-bold mb-2 ">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full p-3 border bg-[#D3E7F0] border-gray-300 rounded-lg focus:outline-none "
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
                      Update Project
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
      <CreateDepartmentModal
        open={showDepartmentModal}
        onClose={() => setShowDepartmentModal(false)}
        onCreate={async (data) => {
          await createDepartment(data).unwrap();
          refetchDepartments();
          setShowDepartmentModal(false);
        }}
      />
      <CreateTeamModal
        open={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        onCreate={async (data) => {
          await createTeam(data).unwrap();
          refetchTeams();
          setShowTeamModal(false);
        }}
      />
    </>
  );
}
