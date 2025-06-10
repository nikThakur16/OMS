"use client";
import React, { useEffect, useState } from 'react'
import AdminDashboard from '@/pages/dashboard/AdminDashboard'
import EmployeeDashboard from '@/pages/dashboard/EmployeeDashboard'

const index = () => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('role')?.toLocaleLowerCase();
    setUserRole(role || null);
  }, []);

  return (
    <div>
     { userRole === 'admin' && <AdminDashboard />  }
     { userRole === 'employee' && <EmployeeDashboard /> }
     { userRole === null && <div>Loading dashboard...</div> }
    </div>
  )
}

export default index