// frontend/components/admin/StatCard.tsx
import React from "react";
import { HiOutlineClipboard } from "react-icons/hi2";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string; // e.g. "bg-blue-100 text-blue-800"
}

const StatCard=({ label, value, icon, color = "bg-blue-100 text-blue-800" }: StatCardProps)=> {
  return (
    <div className={`rounded-xl shadow-sm p-4 flex items-center gap-3 ${color}`}>
      {icon && <div className="text-2xl">{icon}</div>}
      <div>
        <div className="text-lg font-bold">{value}</div>
        <div className="text-xs font-medium">{label}</div>
      </div>
    </div>
  );
}

export default StatCard;