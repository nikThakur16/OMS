import React, { useState, useEffect,useRef, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import moment from 'moment';
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import AssigneesModal from './AssigneesModal';
import { useUpdateTaskMutation } from '@/store/api';
import { motion, AnimatePresence } from 'framer-motion';
import useClickOutside from '@/utils/hooks/clickOutsideHook';
import DeleteConfirm from '../modals/confirmation/DeleteConfirm';
const columnsOrder = ['todo', 'inprogress', 'done'];
const statusTitles = {
  todo: 'To Do',
  inprogress: 'In Progress',
  done: 'Done',
};

interface User {
  _id: string;
  personalDetails: {
    firstName: string;
    lastName: string;
    department?: string;
  };
  team?: string[];
  email?: string;
  
  // add other fields as needed
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  dueDate: string;
  tags?: string[];
  assignedTo?: User[]; // This can hold populated user objects
}

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: string) => void;
  onUpdateTask: (update: { id: string; data: Partial<Task> | { assignedTo: string[] } }) => Promise<any>;
  onViewTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  assignees: User[];
}

const priorityClasses = {
  low: {
    badge: 'bg-green-500/30 text-green-700',
    border: 'border-green-500',
  },
  medium: {
    badge: 'bg-yellow-500/30 text-yellow-700',
    border: 'border-yellow-500',
  },
  high: {
    badge: 'bg-orange-500/30 text-orange-700',
    border: 'border-orange-500',
  },
  critical: {
    badge: 'bg-red-500/30 text-red-700',
    border: 'border-red-500',
  },
};

function KanbanCard({ task, onShowAssignees, onViewDetails, onEditTask, onDeleteTask, isOverlay = false }: {
    task: Task;
    onShowAssignees: (task: Task) => void;
    onViewDetails: (task: Task) => void;
    onEditTask: (task: Task) => void;
    onDeleteTask: (task: Task) => void;
    isOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    data: { task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    boxShadow: isOverlay ? '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)' : undefined,
  };
  
  const priorityConfig = priorityClasses[task.priority] || priorityClasses.medium;

  const handleAssigneeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShowAssignees(task);
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(true);
    setShowMenu(false);
  };

  const handleCardClick = () => {
    onViewDetails(task);
  };

  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleMenuClick = (e:React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu((prev) => !prev);
    
    setShowConfirm(false);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirm(false);
    onDeleteTask(task);
  };
  const onClose=()=>{
    setShowMenu(false);
    setShowConfirm(false);
  }
  const menuRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  useClickOutside(menuRef, () => setShowMenu(false));
  useClickOutside(modalRef, onClose);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleCardClick}
      className={`group flex flex-col  justify-between relative w-full bg-white h-[150px] text-black rounded-lg shadow-md p-3.5 border-l-4 transition-all duration-200 hover:shadow-xl cursor-grab ${priorityConfig.border} ${isDragging && !isOverlay ? "opacity-30" : "opacity-100"}`}
    >
      <div  className="absolute top-2 right-2 ">
        <button onClick={handleMenuClick}>
          <img width="18" height="18" src="https://img.icons8.com/color/48/menu-2.png" alt="menu-2"/>
        </button>
        {showMenu && (
          <div ref={menuRef} className="absolute border-[#175075] right-0 mt-8 w-26 bg-zinc-100 border rounded shadow-lg z-50">
            <button
              className="block w-full font-semibold  px-2 py-1 text-[#175075]   shadow-lg  rounded cursor-pointer"
              onClick={handleDeleteClick}
            >
              Delete Task
            </button>
          </div>
        )}
        {showConfirm && (
          <div className='absolute right-0 mt-2 w-48 bg-black-900/40 border rounded shadow z-50'>
            <DeleteConfirm
              handleDelete={handleConfirmDelete}
              onClose={onClose}
              Data={task}
              open={showConfirm}
              modalRef={modalRef}
            />
          </div>
        )}
      </div>
      <div className="flex justify-between items-start ">
        <h3 className="text-base font-semibold  pr-10">{task.title}</h3>
        <span className={`text-xs px-2 py-1 text-black mr-4 rounded-full font-bold flex-shrink-0 ${priorityConfig.badge}`}>
          {task.priority}
        </span>
      </div>
     
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {task.tags.map((tag) => (
            <span key={tag} className="bg-zinc-200 text-black tracking-widest text-xs px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}
      
      <div className="flex justify-between items-center text-xs ">
        <span>{task.dueDate ? `Due: ${moment(task.dueDate).format('MMM D')}` : ''}</span>
        <div onClick={handleAssigneeClick} className="flex -space-x-2 cursor-pointer">
          {task.assignedTo?.slice(0, 5).map((user) => {
            if (!user?.personalDetails?.firstName) {
              return (
                <span key={user?._id || Math.random()} className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white" />
              );
            }
            return (
              <span
                key={user._id}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 border-2 border-white flex items-center justify-center text-xs font-bold shadow"
              >
                {user.personalDetails.firstName[0]?.toUpperCase() || 'U'}
              </span>
            );
          })}
          {task.assignedTo && task.assignedTo.length > 5 && (
            <span className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-bold shadow">
              +{task.assignedTo.length - 5}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function DroppableColumn({ id, title, count, children }: { id: string; title: string; count: number; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className="flex flex-col flex-shrink-0 w-[450px] bg-zinc-100 rounded-xl max-h-[calc(100vh-20rem)]"
    >
      <div className="flex items-center justify-between p-4 sticky top-0 bg-[#235C7F] mb-4 backdrop-blur-sm rounded-t-xl ">
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <span className="text-xs font-semibold text-[#235C7F] bg-white px-2.5 py-1 rounded-full">{count} </span>
      </div>
      <div className="flex flex-col gap-3 overflow-y-auto px-3 pb-3 hide-scrollbar">
        <SortableContext items={React.Children.map(children, c => (c as React.ReactElement).key) as string[]} strategy={verticalListSortingStrategy}>
          <AnimatePresence>
            {children}
          </AnimatePresence>
        </SortableContext>
      </div>
    </div>
  );
}

const KanbanBoard = ({ tasks, onStatusChange, onUpdateTask, onViewTask, onEditTask, onDeleteTask,assignees }: KanbanBoardProps) => {
  const [localTasks, setLocalTasks] = useState(tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [modalAssignees, setModalAssignees] = useState<User[]>([]);
  const [currentTaskForModal, setCurrentTaskForModal] = useState<Task | null>(null);
  

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const groupedTasks = useMemo(() => {
    return columnsOrder.reduce((acc, colId) => {
      acc[colId] = localTasks.filter((t) => t.status === colId);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [localTasks]);

  function handleDragStart(event: any) {
    setActiveTask(event.active.data.current?.task);
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;
    setActiveTask(null);

    if (over && active.id !== over.id) {
      const newStatus = over.id;
      onStatusChange(active.id, newStatus);
    }
  }

  const handleShowAssignees = (task: Task) => {
    setModalAssignees(task.assignedTo || []);
    setCurrentTaskForModal(task);
    setShowModal(true);
  };

  const handleRemoveAssignee = async (userId: string) => {
    if (!currentTaskForModal?.assignedTo) return;
  
    const updatedAssignees = currentTaskForModal.assignedTo.filter(user => user._id !== userId);
    
    const updatedAssigneeIds = updatedAssignees.map(user => user._id);
    
    try {
      await onUpdateTask({ 
        id: currentTaskForModal._id, 
        data: { assignedTo: updatedAssigneeIds } 
      });
  
      setModalAssignees(updatedAssignees);
      setCurrentTaskForModal(prev => prev ? { ...prev, assignedTo: updatedAssignees } : null);
    } catch (err) {
      console.error("Failed to remove assignee:", err);
    }
  };

  return (
    <>
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-5 p-2 -mx-2 overflow-x-auto">
          {columnsOrder.map((statusId) => (
            <DroppableColumn
              id={statusId}
              key={statusId}
              title={statusTitles[statusId as keyof typeof statusTitles]}
              count={groupedTasks[statusId]?.length || 0}
            >
              {groupedTasks[statusId]?.map((task) => (
                 <motion.div
                    key={task._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                 >
                    <KanbanCard
                        key={task._id}
                        task={task}
                        onShowAssignees={handleShowAssignees}
                        onViewDetails={onViewTask}
                        onEditTask={onEditTask}
                        onDeleteTask={onDeleteTask}
                    />
                </motion.div>
              ))}
            </DroppableColumn>
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <KanbanCard 
                task={activeTask} 
                isOverlay={true}
                onShowAssignees={() => {}} 
                onViewDetails={() => {}}
                onEditTask={() => {}}
                onDeleteTask={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
      <AssigneesModal
        open={showModal}
        onClose={() => setShowModal(false)}
        assignees={modalAssignees}
        task={activeTask} 
        onRemoveAssignee={handleRemoveAssignee}
      />
    </>
  );
};

export default KanbanBoard;