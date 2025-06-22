// frontend/components/admin/StatCard.tsx
import React from "react";
import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

const StatCard = ({ label, value, icon }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.04, boxShadow: "0 8px 32px 0 rgba(31,38,135,0.18)" }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="glass rounded-2xl p-5 flex items-center gap-4 border border-white/30 backdrop-blur-md shadow-xl transition-all duration-200"
      style={{
        background: "rgba(255,255,255,0.25)",
        borderImage: "linear-gradient(135deg, #a5b4fc 0%, #f0abfc 100%) 1",
      }}
    >
      {icon && <div className="text-3xl drop-shadow-sm text-blue-500">{icon}</div>}
      <div>
        <motion.div
          className="text-2xl font-extrabold tracking-wide text-gray-800 futuristic-font"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {value}
        </motion.div>
        <div className="text-xs font-semibold uppercase tracking-widest text-gray-600 mt-1 futuristic-font">
          {label}
        </div>
      </div>
    </motion.div>
  );
};

// Add a placeholder for a futuristic font
// You can add this to your global CSS:
// .futuristic-font { font-family: 'Orbitron', 'Montserrat', 'Segoe UI', Arial, sans-serif; letter-spacing: 0.08em; }

export default StatCard;