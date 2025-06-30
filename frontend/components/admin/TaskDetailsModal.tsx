'use client';
import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import {
  HiX,
  HiOutlineFlag,
  HiOutlineUserCircle,
  HiOutlineCalendar,
  HiOutlineTag,
} from 'react-icons/hi';
import { useRef } from 'react';
import useClickOutside from '@/utils/hooks/clickOutsideHook';
import Select from 'react-select';


const statusOptions = [ 'todo', 'inprogress',  'done'];
const priorityOptions = ['low', 'medium', 'high', 'critical'];

const TaskSchema = Yup.object().shape({
  title: Yup.string().required('Required'),
  description: Yup.string().required('Required'),
  status: Yup.string().required('Required'),
  priority: Yup.string().required('Required'),
});

interface Assignee {
  _id: string;
  personalDetails: {
    firstName: string;
    lastName: string;
  };
  // add other fields if needed
}




const TaskDetailsModal = ({
  open,
  onClose,
  task,
  assignees = [],
  onUpdate,
}: {
  open: boolean;
  onClose: () => void;
  task: any;
  assignees?: Assignee[];
  onUpdate: (task: any) => void;
}) => {
  if (!task) return null;

  const modalRef = useRef<HTMLDivElement>(null);
useClickOutside(modalRef,onClose)

  const assigneeOptions = assignees.map((user) => ({
    value: user._id,
    label: `${user.personalDetails.firstName} ${user.personalDetails.lastName}`,
  }));

  return (
    <div
 
      className={`
        fixed inset-0 z-50 flex items-center w-screen justify-end
        bg-black/40 backdrop-blur-sm
        transition-opacity duration-500
        ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}
    >
      <div
         ref={modalRef} 
        className={`
          bg-white rounded-xl shadow-xl h-screen  md:w-2/3 lg:w-1/2  w-1/2 flex flex-col
          transform transition-transform duration-500 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">Edit Task</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <HiX className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <Formik
          initialValues={{
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assignedTo: task.assignedTo || [],
            dueDate: task.dueDate?.slice(0, 10) || '',
            tags: task.tags || [],
          }}
          enableReinitialize
          validationSchema={TaskSchema}
          onSubmit={async (values, actions) => {
            await onUpdate({
              ...task,
              ...values,
              tags: typeof values.tags === 'string'
                ? values.tags.split(',').map((t) => t.trim())
                : values.tags,
              _id: task._id,
            });
            actions.setSubmitting(false);
            onClose();
          }}
        >
          {({ values, setFieldValue, errors, touched }) => (
            <Form className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-600">Title</label>
                <Field
                  name="title"
                  className="w-full p-2 mt-1 border rounded-md"
                />
                {errors.title && touched.title && (
                  <div className="text-red-500 text-xs mt-1">{errors.title}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600">Description</label>
                <Field
                  as="textarea"
                  name="description"
                  rows={5}
                  className="w-full p-2 mt-1 border rounded-md resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600">Status</label>
                  <Field as="select" name="status" className="w-full p-2 mt-1 border rounded-md">
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Field>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600">Priority</label>
                  <Field as="select" name="priority" className="w-full p-2 mt-1 border rounded-md">
                    {priorityOptions.map((priority) => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </Field>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600">Assignees</label>
                <Select
                  isMulti
                  name="assignedTo"
                  options={assigneeOptions}
                  className="mt-1"
                  classNamePrefix="select"
                  value={assigneeOptions.filter(option => values.assignedTo.includes(option.value))}
                  onChange={(selectedOptions) => {
                    const selectedIds = selectedOptions ? selectedOptions.map(option => option.value) : [];
                    setFieldValue('assignedTo', selectedIds);
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: '#d1d5db',
                      ':hover': {
                        borderColor: '#a5b4fc',
                      }
                    }),
                    multiValue: (base) => ({
                      ...base,
                      backgroundColor: '#e0e7ff',
                    }),
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600">Due Date</label>
                <Field
                  type="date"
                  name="dueDate"
                  className="w-full p-2 mt-1 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600">Tags (comma separated)</label>
                <Field
                  name="tagsInput"
                  value={values.tags.join(', ')}
                  onChange={(e) => setFieldValue('tags', e.target.value.split(',').map((tag: string) => tag.trim()))}
                  className="w-full p-2 mt-1 border rounded-md"
                />
              </div>

              <div className="border-t pt-4 flex justify-end gap-2 bg-white">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 rounded text-white hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
