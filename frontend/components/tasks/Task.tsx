"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineUserAdd, HiOutlineSearch, HiOutlineFilter, HiOutlineSortAscending, HiPlus, HiViewBoards, HiViewList, HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi';
import { Task } from '@/types/admin/task';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ShortMonthDate from '@/utils/time/ShortMonthDate';   

type ModalMode = 'view' | 'edit' | 'create';

export default function TaskManagementPage() {
  const [view, setView] = useState<'kanban' | 'list' | 'whiteboard'>('kanban');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('view');

  // Kanban drag logic (dummy, no real drag for now)
  function handleCardClick(task: Task, mode: ModalMode = 'view') {
    setSelectedTask(task);
    setModalMode(mode);
    setShowModal(true);
  }

  // Header

  // Toolbar
  const Toolbar = () => (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-gray-700">{tasks.length} tasks</span>
        <button className="flex items-center gap-2 bg-[#245D80] text-white px-4 py-2 rounded-xl font-semibold shadow hover:from-indigo-600 hover:to-fuchsia-600 transition" onClick={() => { setModalMode('create'); setShowModal(true); }}>
          <HiPlus /> Add New
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 rounded-xl bg-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 placeholder-gray-400 shadow" />
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
        </div>
        <button className="flex items-center gap-1 bg-white/60 border border-white/30 px-3 py-2 rounded-xl text-gray-700 hover:bg-white/80 transition"><HiOutlineFilter /> Filters</button>
        <button className="flex items-center gap-1 bg-white/60 border border-white/30 px-3 py-2 rounded-xl text-gray-700 hover:bg-white/80 transition"><HiOutlineSortAscending /> Sort</button>
        <div className="flex gap-1 ml-2">
          <button className={`p-2 rounded-lg ${view === 'kanban' ? 'bg-indigo-500 text-white' : 'bg-white/60 text-gray-700'}`} onClick={() => setView('kanban')}><HiViewBoards /></button>
          <button className={`p-2 rounded-lg ${view === 'list' ? 'bg-indigo-500 text-white' : 'bg-white/60 text-gray-700'}`} onClick={() => setView('list')}><HiViewList /></button>
          <button className={`p-2 rounded-lg ${view === 'whiteboard' ? 'bg-indigo-500 text-white' : 'bg-white/60 text-gray-700'}`} onClick={() => setView('whiteboard')}>📝</button>
        </div>
      </div>
    </div>
  );

  // Kanban Board with dnd-kit
  const KanbanBoard = () => {
    // Track the active dragged task (removed unused activeId)
    const [, setActiveId] = useState<string | null>(null);

    // Group tasks by status
    const tasksByStatus: Record<string, Task[]> = statusColumns.reduce((acc, col) => {
      acc[col.id] = tasks.filter(t => t.status === col.id);
      return acc;
    }, {} as Record<string, Task[]>);

    // Handle drag start
    function handleDragStart(event: DragStartEvent) {
      setActiveId(event.active.id as string);
    }

    // Handle drag end
    function handleDragEnd(event: DragEndEvent) {
      const { active, over } = event;
      setActiveId(null);
      if (!over) return;
      if (active.id === over.id) return;

      // Find the source and destination columns
      let sourceCol = '';
      let destCol = '';
      for (const col of statusColumns) {
        if (tasksByStatus[col.id].find(t => t._id === active.id)) sourceCol = col.id;
        if (tasksByStatus[col.id].find(t => t._id === over.id)) destCol = col.id;
      }
      if (!sourceCol || !destCol) return;

      // If moving within the same column
      if (sourceCol === destCol) {
        const oldIndex = tasksByStatus[sourceCol].findIndex(t => t._id === active.id);
        const newIndex = tasksByStatus[destCol].findIndex(t => t._id === over.id);
        const newTasksInCol = arrayMove(tasksByStatus[sourceCol], oldIndex, newIndex);
        const newTasks = tasks.filter(t => t.status !== sourceCol).concat(newTasksInCol);
        setTasks(newTasks);
      } else {
        // Moving to a different column
        setTasks(prev =>
          prev.map(t =>
            t._id === active.id ? { ...t, status: destCol as import('@/types/admin/task').TaskStatus } : t
          )
        );
      }
    }

    // Sortable Task Card
    function SortableTaskCard({ task, onCardClick }: { task: Task; onCardClick: (task: Task, mode?: ModalMode) => void }) {
      const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
      const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.7 : 1,
      };
      return (
        <motion.div
          ref={setNodeRef}
          style={style}
          layout
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={`mb-3 p-4 rounded-xl shadow bg-gradient-to-br from-white/80 to-${task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'yellow' : 'blue'}-100 border-l-4 ${task.priority === 'high' ? 'border-red-400' : task.priority === 'medium' ? 'border-yellow-400' : 'border-blue-400'} cursor-pointer transition`}
          onClick={() => onCardClick(task, 'view')}
          {...attributes}
          {...listeners}
        >
          <div className="flex justify-between items-start">
            <h4 className="font-semibold text-sm text-gray-800 truncate max-w-[70%]">{task.title}</h4>
            <div className="flex gap-1">
              <button onClick={e => { e.stopPropagation(); onCardClick(task, 'view'); }} className="text-gray-400 hover:text-blue-600 transition"><HiOutlineEye /></button>
              <button onClick={e => { e.stopPropagation(); onCardClick(task, 'edit'); }} className="text-gray-400 hover:text-green-600 transition"><HiOutlinePencil /></button>
              <button onClick={e => { e.stopPropagation(); setTasks(tasks.filter(t => t._id !== task._id)); }} className="text-gray-400 hover:text-red-600 transition"><HiOutlineTrash /></button>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags?.map(tag => (
              <span key={tag} className="bg-gradient-to-r from-blue-200 to-fuchsia-200 text-xs px-2 py-1 rounded-full shadow-sm">{tag}</span>
            ))}
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
            <div className="flex -space-x-2">
              {task.assignedTo?.map(userId => (
                <span key={userId} className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 border-2 border-white flex items-center justify-center text-xs font-bold shadow">
                  {userId[0]?.toUpperCase()}
                </span>
              ))}
            </div>
            <span>{task.dueDate ? <ShortMonthDate date={task.dueDate} /> : ''}</span>
          </div>
        </motion.div>
      );
    }

    return (
      <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-6 h-full overflow-x-auto p-2 bg-transparent">
          {statusColumns.map(col => (
            <div key={col.id} className="flex-shrink-0 w-80 glass bg-white/40 rounded-2xl p-4 border border-white/30 backdrop-blur-md shadow-xl transition-all duration-300 hover:shadow-2xl hover:bg-white/60">
              <div className="flex items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800 flex-grow tracking-wide uppercase drop-shadow-sm letter-spacing-[0.05em]">{col.title}</h3>
                <button className="text-indigo-500 hover:text-indigo-700 ml-2"><HiPlus /></button>
              </div>
              <SortableContext items={tasksByStatus[col.id].map(t => t._id)} strategy={verticalListSortingStrategy}>
                {tasksByStatus[col.id].map(task => (
                  <SortableTaskCard key={task._id} task={task} onCardClick={handleCardClick} />
                ))}
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>
    );
  };

  // Task List View
  const TaskList = () => (
    <div className="rounded-2xl bg-white/60 border border-white/30 backdrop-blur-md shadow-xl p-4">
      <table className="w-full text-left">
        <thead>
          <tr className="text-xs text-gray-500 uppercase">
            <th className="py-2">Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Due</th>
            <th>Tags</th>
            <th>Assignees</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task._id} className="border-b border-gray-200 hover:bg-white/80 transition">
              <td className="py-2 font-semibold">{task.title}</td>
              <td>{task.description}</td>
              <td>{task.status}</td>
              <td>{task.priority}</td>
              <td>{task.dueDate}</td>
              <td>{task.tags?.join(', ')}</td>
              <td>
                <div className="flex -space-x-2">
                  {task.assignedTo?.map(userId => (
                    <span key={userId} className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 border-2 border-white flex items-center justify-center text-xs font-bold shadow">
                      {userId[0]?.toUpperCase()}
                    </span>
                  ))}
                </div>
              </td>
              <td>
                <button onClick={() => handleCardClick(task, 'view')} className="text-gray-400 hover:text-blue-600 mx-1"><HiOutlineEye /></button>
                <button onClick={() => handleCardClick(task, 'edit')} className="text-gray-400 hover:text-green-600 mx-1"><HiOutlinePencil /></button>
                <button onClick={() => setTasks(tasks.filter(t => t._id !== task._id))} className="text-gray-400 hover:text-red-600 mx-1"><HiOutlineTrash /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Whiteboard View (dummy)
  const Whiteboard = () => (
    <div className="relative min-h-[400px] bg-gradient-to-br from-white/60 to-blue-100 rounded-2xl border border-white/30 shadow-xl p-8 flex flex-wrap gap-8">
      {[1,2,3].map(i => (
        <motion.div key={i} drag dragConstraints={{ left: 0, top: 0, right: 400, bottom: 200 }} className="w-60 h-40 bg-white/90 rounded-xl shadow-lg p-4 cursor-move flex flex-col gap-2">
          <div className="font-bold text-lg text-indigo-600">Sticky Note {i}</div>
          <div className="text-gray-500 text-sm">This is a draggable sticky note. (Whiteboard demo)</div>
        </motion.div>
      ))}
    </div>
  );

  // Task Modal
  const TaskModal = () => (
    <AnimatePresence>
      {showModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl" onClick={() => setShowModal(false)}>&times;</button>
            {modalMode === 'view' && selectedTask && (
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedTask.title}</h2>
                <div className="text-gray-600 mb-2">{selectedTask.description}</div>
                <div className="flex gap-2 mb-2">
                  {selectedTask.tags?.map(tag => <span key={tag} className="bg-blue-100 text-xs px-2 py-1 rounded-full">{tag}</span>)}
                </div>
                <div className="text-sm text-gray-500 mb-2">Due: {selectedTask.dueDate}</div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick={() => setModalMode('edit')}>Edit</button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={() => { setTasks(tasks.filter(t => t._id !== selectedTask._id)); setShowModal(false); }}>Delete</button>
                </div>
              </div>
            )}
            {modalMode === 'edit' && selectedTask && (
              <div>
                <h2 className="text-2xl font-bold mb-2">Edit Task</h2>
                {/* Dummy edit form */}
                <input className="w-full mb-2 p-2 border rounded" defaultValue={selectedTask.title} />
                <textarea className="w-full mb-2 p-2 border rounded" defaultValue={selectedTask.description} />
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2" onClick={() => setShowModal(false)}>Save</button>
                <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setModalMode('view')}>Cancel</button>
              </div>
            )}
            {modalMode === 'create' && (
              <div>
                <h2 className="text-2xl font-bold mb-2">Create Task</h2>
                {/* Dummy create form */}
                <input className="w-full mb-2 p-2 border rounded" placeholder="Title" />
                <textarea className="w-full mb-2 p-2 border rounded" placeholder="Description" />
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2" onClick={() => setShowModal(false)}>Create</button>
                <button className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Floating Action Button
  const FloatingActionButton = () => (
    <div className="fixed bottom-8 right-8 z-50">
      <motion.button whileTap={{ scale: 0.95 }} className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl shadow-xl hover:from-indigo-600 hover:to-fuchsia-600 transition">
        <HiPlus />
      </motion.button>
    </div>
  );

  return (
    <div className="p-6 bg-white min-h-screen relative">
  
      <Toolbar />
      <div className="mb-8">
        {view === 'kanban' && <KanbanBoard />}
        {view === 'list' && <TaskList />}
        {view === 'whiteboard' && <Whiteboard />}
      </div>
      <TaskModal />
      <FloatingActionButton />
    </div>
  );
}
