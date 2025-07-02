'use client'

import React, { useState, useEffect } from 'react'
import { Admin, Employee, Hr, Manager } from '@/config/sidenav/page'
import { useRouter, usePathname } from 'next/navigation'
import {  HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { useAppSelector } from '@/store/hooks'

import { useGetProjectsQuery } from '@/store/api'

const getColor = (index: number) => {
  const colors = [
    'bg-indigo-500',
    'bg-fuchsia-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-cyan-500',
  ];
  return colors[index % colors.length];
};

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <img width="30" height="30" src="https://img.icons8.com/external-inkubators-glyph-inkubators/30/FFFFFF/external-home-ecommerce-user-interface-inkubators-glyph-inkubators.png" alt="dashboard" />,
  employees: <img width="30" height="30" src="https://img.icons8.com/ios-filled/50/FFFFFF/conference-foreground-selected.png" alt="employees" />,
  attendance: <img width="30" height="30" src="https://img.icons8.com/glyph-neue/64/FFFFFF/attendance-mark.png" alt="attendance" />,
  departments: <img width="30" height="30" src="https://img.icons8.com/sf-black/64/FFFFFF/collaborating-in-circle.png" alt="departments" />,
  roles: <img width="30" height="30" src="https://img.icons8.com/external-glyph-geotatah/64/FFFFFF/external-duty-just-in-time-glyph-glyph-geotatah.png" alt="roles" />,
  permissions: <img width="30" height="30" src="https://img.icons8.com/ios-filled/50/FFFFFF/restriction-shield.png" alt="permissions" />,
  projects: <img width="30" height="30" src="https://img.icons8.com/ios-filled/50/FFFFFF/task.png" alt="projects" />,
  teams: <img width="30" height="30" src="https://img.icons8.com/ios-filled/50/FFFFFF/conference-call.png" alt="teams" />,
  employeesManagement: <img width="30" height="30" src="https://img.icons8.com/sf-regular-filled/48/FFFFFF/add-user-male--v2.png" alt="employeesManagement" />,
};

const Sidebar = () => {
  const [showProjects, setShowProjects] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector(state => state.login.user);
  const allowedRoles = ['Admin', 'Manager', 'HR'];

  // Use user?.role as the source of truth
  const role = user?.role || 'Employee';

  const data: { [key: string]: typeof Admin } = {
    Admin: Admin,
    Employee: Employee,
    HR: Hr,
    Manager: Manager, // If you have a Manager config, use it; otherwise, fallback to Admin
  };

  // Helper to check if a path is active
  const isActive = (path: string) => pathname?.startsWith(path);

  // Helper to check if a project is active
  const isProjectActive = (project: string) => pathname?.includes(`/projects/${project}`);

  const { data: projects } = useGetProjectsQuery();

  if (!mounted) return null;

  return (
    <div className={`flex flex-col bg-[#034F75] ${collapsed ? 'w-[70px]' : 'w-[17%]'} h-[100vh] rounded-[22px] pl-[10px] px-2 py-6 transition-all duration-300`}>
      <div className='flex items-center justify-between mb-4'>
        <img className={`h-14 ${collapsed ? 'hidden' : 'w-[70%]'}`} src="https://softradix.com/wp-content/uploads/2022/07/main-logo.png" alt="" />
        <button
          className='text-white bg-white/10 hover:bg-white/20 rounded-full p-2 ml-2 transition'
          onClick={() => setCollapsed((prev) => !prev)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <HiChevronRight /> : <HiChevronLeft />}
        </button>
      </div>
      <div className={`flex flex-col gap-8 pt-4 pl-2 text-white ${collapsed ? 'items-center' : ''}`}>
        {data[role]?.map((item, index) => {
          if (item.title === 'Projects') {
            return (
              <div key={index}>
                <div
                  className={`flex gap-6 items-center mb-2 ${isActive(`/${role.toLowerCase()}/projects`) && !pathname?.includes('/projects/') ? 'bg-white/20 rounded-lg px-2 py-1' : ''}`}
                >
                  {iconMap[item.icon]}
                  {!collapsed && (
                    <h4
                      className='font-semibold cursor-pointer'
                      onClick={e => {
                        e.stopPropagation();
                        router.push(`/${role.toLowerCase()}/projects`);
                      }}
                    >
                      {item.title}
                    </h4>
                  )}
                  <span
                    className={`ml-auto text-lg transition-transform  cursor-pointer`}
                    onClick={e => {
                      e.stopPropagation();
                      setShowProjects((prev) => !prev);
                    }}
                  >
                    {showProjects ? 
                        <img style={{ filter: 'brightness(0) invert(1)' }} width="24" height="24" src="https://img.icons8.com/material-outlined/24/drag-list-down.png" alt="drag-list-down"/> : 
                        <img style={{ filter: 'brightness(0) invert(1)' }} width="24" height="24" src="https://img.icons8.com/material/24/drag-list-up--v1.png" alt="drag-list-up--v1"/>
                    }
                  </span>
                </div>
                {/* Sub-navigation for projects */}
                {showProjects && !collapsed && (
                  <div className='ml-8 flex flex-col gap-2'>
                    {projects && projects.length > 0 ? projects
                      .filter(proj => !proj.deletedAt)
                      .map((proj, i) => (
                        proj && proj._id && proj.name ? (
                          <div
                            key={proj._id}
                            className={`flex items-center  gap-2 cursor-pointer px-2 py-1 rounded-lg transition ${isProjectActive(proj._id) ? 'bg-white/30 text-white font-bold' : 'hover:bg-white/10 text-white/90'}`}
                            onClick={() => router.push(`/${role.toLowerCase()}/projects/${proj._id}`)}
                          >
                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${getColor(i)}`}>{proj.name[0]}</span>
                            <span>{proj.name}</span>
                          </div>
                        ) : null
                      )) : <span className='text-gray-400 px-2'>No projects</span>}
                  </div>
                )}
              </div>
            );
          }
          return (
            <div
              key={index}
              className={`flex gap-6 items-center cursor-pointer ${isActive(item.path) ? 'bg-white/20 rounded-lg px-2 py-1' : ''} ${collapsed ? 'justify-center' : ''}`}
              onClick={() => {
                if (item.path) {
                  router.push(item.path);
                }
              }}
            >
              {iconMap[item.icon]}
              {!collapsed && <h4 className='font-semibold'>{item.title}</h4>}
            </div>
          );
        })}
       
      </div>
    </div>
  )
}

export default Sidebar