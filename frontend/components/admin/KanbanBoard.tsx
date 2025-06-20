// MasterpieceKanban.tsx
// The ultimate, memorable Kanban board component
import React, { useState } from 'react';
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
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiOutlineX, HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi';

// Dummy data interfaces
type Card = {
  id: string;
  title: string;
  description: string;
  assignees: { id: string; avatarUrl: string }[];
  labels: { text: string; color: string }[];
  dueDate: string;
};
type Column = { id: string; title: string; cardOrder: string[] };
type BoardData = { columns: Column[]; cards: Record<string, Card> };

// Dummy initial board
const initialBoard: BoardData = {
  columns: [
    { id: 'backlog', title: 'Backlog', cardOrder: ['c1', 'c2'] },
    { id: 'in-progress', title: 'In Progress', cardOrder: ['c3'] },
    { id: 'done', title: 'Done', cardOrder: ['c4'] },
  ],
  cards: {
    c1: {
      id: 'c1', title: 'Research design patterns',
      description: 'Investigate best UI patterns for dashboard.',
      assignees: [{ id: 'u1', avatarUrl: 'https://i.pravatar.cc/40?u=1' }],
      labels: [{ text: 'Research', color: 'bg-purple-200' }],
      dueDate: '2025-07-05',
    },
    c2: {
      id: 'c2', title: 'Wireframe main page',
      description: 'Sketch initial wireframes in Figma.',
      assignees: [{ id: 'u2', avatarUrl: 'https://i.pravatar.cc/40?u=2' }],
      labels: [{ text: 'Design', color: 'bg-blue-200' }],
      dueDate: '2025-07-07',
    },
    c3: {
      id: 'c3', title: 'Implement Auth',
      description: 'Setup OAuth2 login and JWT.',
      assignees: [{ id: 'u3', avatarUrl: 'https://i.pravatar.cc/40?u=3' }],
      labels: [{ text: 'Dev', color: 'bg-green-200' }],
      dueDate: '2025-07-02',
    },
    c4: {
      id: 'c4', title: 'Deploy to staging',
      description: 'Configure CI/CD and push to staging.',
      assignees: [{ id: 'u1', avatarUrl: 'https://i.pravatar.cc/40?u=1' }],
      labels: [{ text: 'Ops', color: 'bg-yellow-200' }],
      dueDate: '2025-06-30',
    },
  },
};

// Sortable Card Component
function SortableCard({ id, card, onClick }: { id: string; card: Card; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg shadow p-4 mb-3 cursor-grab hover:shadow-lg"
      layout
    >
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-sm text-gray-800">{card.title}</h4>
        <button onClick={onClick} className="text-gray-400 hover:text-gray-600">
          <HiOutlineEye />
        </button>
      </div>
      <div className="flex flex-wrap gap-1 mt-2">
        {card.labels.map((l) => (
          <span key={l.text} className={`${l.color} text-xs px-2 py-1 rounded-full`}>{l.text}</span>
        ))}
      </div>
      <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
        <div className="flex -space-x-2">
          {card.assignees.map((u) => (
            <img key={u.id} src={u.avatarUrl} alt="avatar" className="w-6 h-6 rounded-full border-2 border-white" />
          ))}
        </div>
        <span>{new Date(card.dueDate).toLocaleDateString()}</span>
      </div>
    </motion.div>
  );
}

// Masterpiece Kanban Component
export default function MasterpieceKanban() {
  const [board, setBoard] = useState<BoardData>(initialBoard);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openCard, setOpenCard] = useState<Card | null>(null);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  const handleDragEnd = ({ active, over }: any) => {
    if (over && active.id !== over.id) {
      // find source & dest
      const sourceCol = board.columns.find((c) => c.cardOrder.includes(active.id));
      const destCol = board.columns.find((c) => c.id === over.id) || board.columns.find((c) => c.cardOrder.includes(over.id));
      if (!sourceCol || !destCol) return;
      const newColumns = board.columns.map((col) => ({ ...col, cardOrder: [...col.cardOrder] }));
      // remove
      newColumns.forEach((col) => {
        col.cardOrder = col.cardOrder.filter((cid) => cid !== active.id);
      });
      // insert
      const idx = destCol.cardOrder.indexOf(over.id as string);
      destCol.cardOrder.splice(idx >= 0 ? idx : destCol.cardOrder.length, 0, active.id as string);
      setBoard({ ...board, columns: newColumns });
    }
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
    >
      <div className="flex gap-6 h-full overflow-x-auto p-6 bg-gray-50">
        {board.columns.map((col) => (
          <div key={col.id} className="flex-shrink-0 w-72 bg-blue-100 rounded-xl p-4">
            <div className="flex items-center mb-4">
              <h3 className="font-bold text-gray-800 flex-grow">{col.title}</h3>
              <button onClick={() => {
                const title = prompt('New card title');
                if (title) {
                  const id = `c${Date.now()}`;
                  setBoard((b) => ({
                    ...b,
                    cards: { ...b.cards, [id]: { id, title, description: '', assignees: [], labels: [], dueDate: new Date().toISOString() } },
                    columns: b.columns.map(cc => cc.id === col.id ? { ...cc, cardOrder: [...cc.cardOrder, id] } : cc)
                  }));
                }
              }} className="text-blue-600 hover:text-blue-800"><HiPlus /></button>
            </div>
            <SortableContext items={col.cardOrder} strategy={verticalListSortingStrategy}>
              {col.cardOrder.map((cid) => (
                <SortableCard key={cid} id={cid} card={board.cards[cid]} onClick={() => setOpenCard(board.cards[cid])} />
              ))}
            </SortableContext>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeId && board.cards[activeId] ? (
          <div className="bg-white p-4 rounded-lg shadow-lg w-60">
            <h4 className="font-semibold">{board.cards[activeId].title}</h4>
          </div>
        ) : null}
      </DragOverlay>

      <AnimatePresence>
        {openCard && (
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            className="fixed top-0 right-0 w-1/3 h-full bg-white shadow-2xl p-6 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{openCard.title}</h2>
              <HiOutlineX className="cursor-pointer text-gray-500 hover:text-gray-700" onClick={() => setOpenCard(null)} />
            </div>
            <p className="text-gray-600 mb-4">{openCard.description}</p>
            <div className="flex gap-2 mb-4">
              {openCard.labels.map(l => <span key={l.text} className={`${l.color} px-2 py-1 rounded-full text-xs`}>{l.text}</span>)}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input type="date" defaultValue={openCard.dueDate.split('T')[0]} className="mt-1 block w-full border-gray-300 rounded" />
            </div>
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DndContext>
  );
}
