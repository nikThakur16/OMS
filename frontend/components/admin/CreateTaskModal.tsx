"use client";
import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  useCreateTaskMutation,
  useGetProjectByIdQuery,
} from "@/store/api";
import { useParams } from "next/navigation";
import { formatISO } from "date-fns";

const initialTaskState = {
  title: "",
  description: "",
  assignedTo: [] as string[],
  startDate: formatISO(new Date()).slice(0, 10),
  dueDate: formatISO(new Date()).slice(0, 10),
  status: "todo",
  priority: "medium",
  visibility: "team",
  // Add other necessary fields with default values
  tags: [],
  customFields: {}, // Add customFields to the initial state
};

export default function CreateTaskModal({ isOpen, onClose, onSubmit, assignableUsers }) {
  const [taskData, setTaskData] = useState(initialTaskState);
  const [userSearch, setUserSearch] = useState("");
  const users = assignableUsers || [];
  const [createTask] = useCreateTaskMutation();
  const params = useParams();
  const projectId = params?.projectId as string;

  console.log("==========", users)

  const { data: project } = useGetProjectByIdQuery(projectId, {
    skip: !projectId,
  });

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setTaskData(initialTaskState);
    }
  }, [isOpen]);

  const filteredUsers = userSearch
    ? users.filter(
        (user) =>
          user.personalDetails?.firstName
            ?.toLowerCase()
            .includes(userSearch.toLowerCase()) ||
          user.personalDetails?.lastName
            ?.toLowerCase()
            .includes(userSearch.toLowerCase())
      )
    : users;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomFieldChange = (name: string, value: any) => {
    setTaskData((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [name]: value,
      },
    }));
  };

  const handleAssigneeChange = (userId: string) => {
    setTaskData((prev) => {
      const newAssignedTo = prev.assignedTo.includes(userId)
        ? prev.assignedTo.filter((id) => id !== userId)
        : [...prev.assignedTo, userId];
      return { ...prev, assignedTo: newAssignedTo };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTask({ data: taskData, projectId }).unwrap();
      onSubmit(taskData);
      onClose();
    } catch (err) {
      console.error("Task creation failed:", err);
      alert(`Failed to create task. Please check the form and try again.`);
    }
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-40 flex items-center justify-center"
        onClose={onClose}
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <Transition.Child
          as={React.Fragment}
          enter="transition duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Dialog.Panel className="relative z-50 bg-white  text-[#04567B] rounded-lg p-6 w-full max-w-2xl">
            <Dialog.Title className="text-xl font-bold mb-4">
              Create Task
            </Dialog.Title>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[16px] font-semibold mb-2">Title</label>
                <input
                  name="title"
                  value={taskData.title}
                  onChange={handleInputChange}
                  placeholder="Enter task title"
                 className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none '
                />
              </div>

              {/* Description */}
              <div>
                <label className="block  text-[16px] font-semibold mb-2">Description</label>
                <textarea
                  name="description"
                  value={taskData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  className='w-full h-24 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider p-4 text-sm focus:outline-none'
                />
              </div>

              {/* Custom Fields */}
              {Array.isArray(project?.customFields) && project.customFields.length > 0 && (
                <div>
                  <label className="block text-[16px] font-semibold mb-1">
                    Custom Fields
                  </label>
                  <div className="space-y-2">
                    {project.customFields.map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-semibold">{field.name}</label>
                        {field.type === "text" && (
                          <input
                            type="text"
                            onChange={(e) =>
                              handleCustomFieldChange(field.name, e.target.value)
                            }
                           className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm focus:outline-none '
                          />
                        )}
                        {field.type === "number" && (
                          <input
                            type="number"
                            onChange={(e) =>
                              handleCustomFieldChange(field.name, e.target.value)
                            }
                            className="w-full border rounded p-2"
                          />
                        )}
                        {field.type === "date" && (
                          <input
                            type="date"
                            onChange={(e) =>
                              handleCustomFieldChange(field.name, e.target.value)
                            }
                            className="w-full border rounded p-2"
                          />
                        )}
                        {field.type === "select" && (
                          <select
                            onChange={(e) =>
                              handleCustomFieldChange(field.name, e.target.value)
                            }
                            className="w-full border rounded p-2"
                          >
                            <option value="">Select...</option>
                            {field.options.map((option) => (
                              <option key={option} className="text-gray-600" value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assign People */}
              <div>
                <label className="block  text-[16px] font-semibold mb-1">
                  Assign People
                </label>
                <input
                  type="text"
                  placeholder="Search people..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                 className='w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold  mb-2 tracking-wider px-4 text-sm focus:outline-none '
                />
                <div className="max-h-40 overflow-y-auto border rounded p-2 bg-[#D3E7F0]">
                  {filteredUsers.map((user) => (
                    <div key={user._id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`user-${user._id}`}
                        checked={taskData.assignedTo.includes(user._id)}
                        onChange={() => handleAssigneeChange(user._id)}
                        className="h-4 w-4 text-[#04567B] border-gray-300  rounded-full "

                      />
                      <label
                        htmlFor={`user-${user._id}`}
                        className="ml-2 text-sm font-semibold text-gray-700 cursor-pointer"
                      >
                        {user.personalDetails?.firstName}{" "}
                        {user.personalDetails?.lastName}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[16px] font-bold ">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={taskData.startDate}
                    onChange={handleInputChange}
                         className="w-full bg-[#D3E7F0] font-semibold border border-none rounded focus:outline-none p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[16px] font-bold">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={taskData.dueDate}
                    onChange={handleInputChange}
                    className="w-full bg-[#D3E7F0] font-semibold border border-none rounded focus:outline-none p-2"
                    required
                  />
                </div>
              </div>

              {/* Status, Priority, Visibility */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[16px] font-bold">Status</label>
                  <select
                    name="status"
                    value={taskData.status}
                    onChange={handleInputChange}
                    className="w-full border border-none bg-[#D3E7F0]  focus:outline-none font-semibold rounded p-2"
                  >
                    <option className="font-semibold" value="todo">To Do</option>
                    <option className="font-semibold" value="inprogress">In Progress</option>
                    <option className="font-semibold" value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[16px] font-bold">Priority</label>
                  <select
                    name="priority"
                    value={taskData.priority}
                    onChange={handleInputChange}
                    className="w-full border border-none bg-[#D3E7F0]  focus:outline-none font-semibold rounded p-2"
                  >
                    <option className="font-semibold" value="low">Low</option>
                    <option className="font-semibold" value="medium">Medium</option>
                    <option className="font-semibold" value="high">High</option>
                    <option className="font-semibold" value="critical">Critical</option>
                  </select>
                </div>
                {/* <div>
                  <label className="block text-[16px] font-bold">Visibility</label>
                  <select
                    name="visibility"
                    value={taskData.visibility}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                  >
                    <option value="team">Team</option>
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                  </select>
                </div> */}
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-[#04567B] font-semibold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#04567B] text-white font-semibold rounded"
                >
                  Create Task
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
