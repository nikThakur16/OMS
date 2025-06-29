import React from 'react';

interface LeaveToastProps {
  type: 'success' | 'error';
  message: string;
  details?: string;
}

const iconMap = {
  success: <img width="32" height="32" src="https://img.icons8.com/color/48/ok--v1.png" alt="success" />,
  error: <img width="32" height="32" src="https://img.icons8.com/color/48/cancel--v1.png" alt="error" />,
};

const bgMap = {
  success: 'bg-green-600 border-green-400',
  error: 'bg-red-600 border-red-400',
};

const LeaveToast: React.FC<LeaveToastProps> = ({ type, message, details }) => (
  <div className={`flex items-center gap-4 p-4 w-[320px] text-white rounded-xl shadow-lg border-l-4 ${bgMap[type]}`}> 
    {iconMap[type]}
    <div>
      <div className="font-semibold text-base">{message}</div>
      {details && <div className="text-xs text-white/80 mt-1">{details}</div>}
    </div>
  </div>
);

export default LeaveToast; 