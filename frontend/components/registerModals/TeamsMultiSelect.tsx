import React, { useRef, useState, useEffect } from 'react';

interface Team {
  _id: string;
  name: string;
}

interface TeamsMultiSelectProps {
  teams: Team[];
  value: string[];
  onChange: (selected: string[]) => void;
  label?: string;
}

const TeamsMultiSelect: React.FC<TeamsMultiSelectProps> = ({ teams, value, onChange, label = 'Teams' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => setOpen((prev) => !prev);

  const handleSelect = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const selectedNames = teams.filter(t => value.includes(t._id)).map(t => t.name).join(', ');

  return (
    <div className="relative" ref={ref}>
      <label className='mb-2 text-md font-semibold text-[#175075] pl-1'>{label}</label>
      <div
        className="w-full h-10 bg-[#D3E7F0] rounded-lg font-semibold tracking-wider px-4 text-sm flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#175075]"
        tabIndex={0}
        onClick={handleToggle}
      >
        <span className={selectedNames ? '' : 'text-gray-400'}>
          {selectedNames || 'Select Teams'}
        </span>
        <span className="ml-auto">▼</span>
      </div>
      {open && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {teams.map(team => (
            <label key={team._id} className="flex items-center px-4 py-2 cursor-pointer hover:bg-indigo-50">
              <input
                type="checkbox"
                checked={value.includes(team._id)}
                onChange={() => handleSelect(team._id)}
                className="mr-2"
              />
              {team.name}
            </label>
          ))}
          {teams.length === 0 && <div className="px-4 py-2 text-gray-400">No teams available</div>}
        </div>
      )}
    </div>
  );
};

export default TeamsMultiSelect; 