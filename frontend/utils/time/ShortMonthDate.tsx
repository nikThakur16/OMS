// components/ShortMonthDate.tsx
"use client";

import React from "react";
import { format } from "date-fns";

interface ShortMonthDateProps {
  /** The date to display, can be Date, string, or null/undefined */
  date?: Date | string | null;
  /** Optional fallback text when date is null/undefined */
  fallback?: string;
  /** Optional className for styling */
  className?: string;
}

export default function ShortMonthDate({ 
  date, 
  fallback = 'N/A',
  className 
}: ShortMonthDateProps) {
  if (!date) return <span className={className}>{fallback}</span>;

  try {
    // Normalize to a Date instance
    const parsed = typeof date === "string" ? new Date(date) : date;
    
    return (
      <time 
        dateTime={parsed.toISOString()} 
        className={className}
      >
        {format(parsed, "dd MMM yyyy")}
      </time>
    );
  } catch (error) {
    // Handle invalid dates gracefully
    return <span className={className}>{fallback}</span>;
  }
}

