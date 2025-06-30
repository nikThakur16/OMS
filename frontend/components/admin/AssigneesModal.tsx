interface AssigneesModalProps {
  open: boolean;
  onClose: () => void;
  assignees: any[]; // Ideally, type this as User[]
  onRemoveAssignee: (userId: string) => void;
  task?: any; // Optional, if needed for context
}

const AssigneesModal = ({
  open,
  onClose,
  assignees,
  task,
  onRemoveAssignee,
}: AssigneesModalProps) => {
  console.log("assignees", assignees);  
  if (!open) return null;
  console.log("AssigneesModal rendered with assignees:", assignees,task);
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg"
      >
        <h2 className="text-lg font-bold mb-4">Assigned People</h2>
        <ul>
          {assignees.map(user => {
            if (typeof user !== 'object' || !user?.personalDetails) {
              return null;
            }

            return (
              <li key={user._id} className="mb-2 flex justify-between items-center">
                <div>

                  <div className="font-semibold">{user?.personalDetails.firstName} {user?.personalDetails.lastName}</div>
                  <div className="text-xs text-gray-600">
                    Department: {user?.personalDetails.department || "—"}<br />
                   
                    Email: {user?.contactDetails.email || "—"}
                  </div>
                </div>
                <button
                  className="ml-4 px-2 py-1 bg-red-500 text-white rounded"
                  onClick={() => onRemoveAssignee(user._id)}
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
        <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AssigneesModal;
  