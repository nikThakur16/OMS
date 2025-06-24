// MasterpieceKanban.tsx
// The ultimate, memorable Kanban board component
import React from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  MeasuringStrategy,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { Task } from '@/types/admin/task';
import ShortMonthDate from '@/utils/time/ShortMonthDate';
// Card interface based on Task
interface KanbanBoardProps {
  tasks: Task[];
  statuses: { _id: string; name: string; color?: string }[];
  onDragEnd: (result: any) => void;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusDelete?: (statusId: string) => void;
}

function SortableCard({ id, card, onView, onEdit, onDelete }: { id: string; card: Task; onView: () => void; onEdit: () => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    boxShadow: isDragging ? '0 8px 32px 0 rgba(31,38,135,0.37)' : undefined,
    opacity: isDragging ? 0.7 : 1,
  };
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="glass bg-white/60 rounded-xl shadow-lg p-4 mb-3 cursor-grab hover:shadow-2xl border border-white/30 backdrop-blur-md transition-all duration-200 hover:bg-white/80 hover:scale-[1.025]"
      layout
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-sm text-gray-800 truncate max-w-[70%]">{card.title}</h4>
        <div className="flex gap-1">
          <button onClick={onView} className="text-gray-400 hover:text-blue-600 transition"><HiOutlineEye /></button>
          <button onClick={onEdit} className="text-gray-400 hover:text-green-600 transition"><HiOutlinePencil /></button>
          <button onClick={onDelete} className="text-gray-400 hover:text-red-600 transition"><HiOutlineTrash /></button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {card.tags?.map((tag) => (
          <span key={tag} className="bg-gradient-to-r from-blue-200 to-purple-200 text-xs px-2 py-1 rounded-full shadow-sm">{tag}</span>
        ))}
      </div>
      <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
        <div className="flex -space-x-2">
          {card.assignedTo?.map((userId, idx) => (
            <span key={userId} className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 border-2 border-white flex items-center justify-center text-xs font-bold shadow">
              {userId[0]?.toUpperCase()}
            </span>
          ))}
        </div>
        <span>{card.dueDate ? <ShortMonthDate date={card.dueDate} /> : ''}</span>
      </div>
    </motion.div>
  );
}

export default function KanbanBoard({ tasks, statuses, onDragEnd, onView, onEdit, onDelete, onStatusDelete }: KanbanBoardProps) {
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  // Group tasks by dynamic statuses
  const columns = statuses.map(status => ({
    ...status,
    tasks: tasks.filter(t => t.status === status.name),
  }));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
    >
      <div className="flex gap-6 h-full overflow-x-auto p-6 bg-gradient-to-br from-[#e0e7ff] to-[#f4fafd] min-h-[60vh]">
        {columns.map((col) => (
          <div key={col._id} className="flex-shrink-0 w-80 glass bg-white/40 rounded-2xl p-4 border border-white/30 backdrop-blur-md shadow-xl transition-all duration-300 hover:shadow-2xl hover:bg-white/60">
            <div className="flex items-center mb-4">
              <h3 className="font-bold text-lg text-gray-800 flex-grow tracking-wide uppercase drop-shadow-sm letter-spacing-[0.05em]" style={{ color: col.color || undefined }}>{col.name}</h3>
              {onStatusDelete && (
                <button className="ml-2 text-red-500 hover:text-red-700" onClick={() => onStatusDelete(col._id)} title="Delete status">✕</button>
              )}
            </div>
            <SortableContext items={col.tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
              {col.tasks.map((task) => (
                <SortableCard
                  key={task._id}
                  id={task._id}
                  card={task}
                  onView={() => onView(task)}
                  onEdit={() => onEdit(task)}
                  onDelete={() => onDelete(task)}
                />
              ))}
            </SortableContext>
          </div>
        ))}
      </div>
      {/* DragOverlay and modals can be added here in next steps */}
    </DndContext>
  );
}
