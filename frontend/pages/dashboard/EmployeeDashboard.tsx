'use client';
import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import{  useCheckInMutation, useCheckOutMutation,useGetEmployeeAttendanceByIdQuery } from '@/store/api';

const EmployeeDashboard = () => {
    
    // --- Mock User Data & Attendance State ---
    const [triggerCheckIn ,{isLoading:isCheckedIn }] = useCheckInMutation();
    const [triggerCheckOut ,{isLoading:isCheckedOut }] = useCheckOutMutation();
    const [userAttendance, setUserAttendance] = useState({
        name: "Vidushi Sharma",
        role: "React js Developer",
        avatar: "/images/cat.jpg",
        employeeId: "EMP-007",
        department: "Software Engineering",
        team: "Frontend Team A",
        performanceScore: 85,
        isCheckedIn: false,
        checkInTime: null as string | null,
        checkOutTime: null as string | null,
        todayWorkingHours: "00hr 00min",
        todayBreakTime: "00min",
        todayOvertime: "00hr 00min",
        todayStatus: "Not Checked In",
        weeklyHours: "35hr 00min",
        monthlyAttendanceRate: "95%",
        leaveBalance: {
            annual: 12,
            sick: 5,
            casual: 3,
            pendingRequests: 1
        }
    });

const user=localStorage.getItem('user');
const loggedInEmployeeId= user ? JSON.parse(user)?.id : null;
const loggedInEmployee= user ? JSON.parse(user) : null;
const getTodayDateParam = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
const { 
    data: employeeAttendanceRecords, // This is where it's defined and gets its value
    isLoading: isFetchingAttendance, 
    error: fetchAttendanceError,
    refetch: refetchEmployeeAttendance 
  } = useGetEmployeeAttendanceByIdQuery({ employeeId: loggedInEmployeeId, date: getTodayDateParam() });


 


    const [isLoading, setIsLoading] = useState(false);

    // --- Handlers for Check In/Out Actions ---
    const handleCheckIn = async () => {
      try{

        setIsLoading(true);

        const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        await triggerCheckIn({checkInTime: currentTime}).unwrap();
        
        setUserAttendance(prev => ({
            ...prev,
            isCheckedIn: true,
            checkInTime: currentTime,
            todayStatus: "Checked In",
            todayWorkingHours: "00hr 00min",
            todayBreakTime: "00min",
            todayOvertime: "00hr 00min",
            checkOutTime: null,
        }));
        setIsLoading(false);
        console.log(`User checked in at ${currentTime}`);
      } catch (error) {
        console.error("Failed to check in:", error);
        // TODO: Display an error message to the user here
    }

       
    };

    const handleCheckOut = async () => {
        try{
            setIsLoading(true);
       
            const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        
         await triggerCheckOut({
                checkOutTime: currentTime,
                workingHours: userAttendance.todayWorkingHours,
                breakTime: userAttendance.todayBreakTime,
                overtime: userAttendance.todayOvertime
            }).unwrap();
     
            setUserAttendance(prev => ({
                ...prev,
                isCheckedIn: false,
                checkOutTime: currentTime,
                todayWorkingHours: "08hr 30min",
                todayBreakTime: "45min",
                todayOvertime: "00hr 30min",
                todayStatus: "Checked Out"
            }));
            setIsLoading(false);
            console.log(`User checked out at ${currentTime}`);
        } catch{
            console.error("Failed to check out:", Error);
        }
     
    };

    const getTodayDate = () => {
        const today = new Date();
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return today.toLocaleDateString('en-GB', options);
    };

    // --- Mock data for Sections ---
    const announcements = [
      { id: 1, title: 'Important: All hands meeting on Friday, 10 AM', date: '2025-06-15' },
      { id: 2, title: 'New HR policy updates available on portal', date: '2025-06-10' },
      { id: 3, title: 'Holiday schedule for December published', date: '2025-06-01' },
      { id: 4, title: 'Q2 Performance Reviews starting soon', date: '2025-05-28' },
    ];

    const monthlyHoursData = [
        { name: 'Week 1', hours: 40 },
        { name: 'Week 2', hours: 38 },
        { name: 'Week 3', hours: 42 },
        { name: 'Week 4', hours: 39 },
    ];

    const upcomingTasks = [
      { id: 1, title: 'Submit Expense Report', date: '2025-06-20', priority: 'High', color: 'text-red-500' },
      { id: 2, title: 'Complete Project X Module', date: '2025-06-22', priority: 'Medium', color: 'text-orange-500' },
      { id: 3, title: 'Review Annual Goals', date: '2025-06-25', priority: 'Low', color: 'text-blue-500' },
    ];

    // NEW MOCK DATA for "My Quick Stats"
    const quickStats = {
        unreadMessages: 3,
        tasksDueSoon: 2,
        feedbackReceived: 1
    };

    // NEW MOCK DATA for "Team Connectivity"
    const teamMembers = [
        { id: 1, name: "Kamrul Hasan", avatar: "/images/cat.jpg", status: "online" },
        { id: 2, name: "Arfan Roky", avatar: "/images/cat.jpg", status: "offline" },
        { id: 3, name: "Afsan R.", avatar: "/images/cat.jpg", status: "online" },
        { id: 4, name: "Wasif Omee", avatar: "/images/cat.jpg", status: "away" },
    ];

    
 
    console.log("=============",employeeAttendanceRecords)

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme('spacing.6'))] p-6 bg-gray-50">
      <h1 className='text-3xl font-extrabold mb-8 text-[#034F75]'>Your Dashboard</h1>

      {/* Top Row: Hero Profile Card & Smaller Status Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 items-stretch'>
        
        {/* Main Hero Profile Card - Wider and more prominent */}
        <div className='bg-white rounded-xl shadow-xl col-span-1 md:col-span-2 lg:col-span-2 overflow-hidden flex flex-col transform hover:scale-[1.005] transition-transform duration-300'>
            {/* Top section with gradient, avatar, and core info */}
            <div className='relative p-8 flex items-center justify-between  bg-[#034F75] text-white'> 
                <div className='flex items-center'>
                    <div className='relative mr-4 transform transition-transform hover:scale-105 duration-300 ease-out'>
                        <img 
                            src={userAttendance.avatar} 
                            alt="User Avatar" 
                            className="rounded-full w-28 h-28 object-cover border-4 border-white shadow-lg" 
                        />
                        {/* Online Status Indicator */}
                        <span className='absolute bottom-1 right-1 w-6 h-6 bg-cyan-400 rounded-full border-3 border-white animate-pulse-slow origin-center'></span>
                    </div>
                    <div>
                        <h2 className='font-bold text-3xl mb-1'>{userAttendance.name}</h2>
                        <p className='text-lg opacity-90'>{userAttendance.role}</p>
                    </div>
                </div>
                <div className='text-right'>
                    <p className='text-base text-gray-200 italic'>Today is</p>
                    <p className='font-semibold text-2xl'>{getTodayDate()}</p>
                </div>
            </div>

            {/* Bottom section with additional info and button */}
            <div className='flex flex-col flex-grow p-6 bg-white z-10 relative'>
                <p className='text-base text-gray-600 mb-6 text-center italic'>
                    "Innovating solutions and driving success. Continuously learning and growing to achieve excellence."
                </p>

                {/* Additional Info Grid for employee details */}
                <div className='grid grid-cols-2 gap-4 w-full mx-auto mb-6'>
                    <div className='text-center p-4 bg-blue-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200'>
                        <p className='text-xs text-gray-600'>Employee ID</p>
                        <p className='font-semibold text-lg text-[#034F75]'>{userAttendance.employeeId}</p>
                    </div>
                    <div className='text-center p-4 bg-blue-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200'>
                        <p className='text-xs text-gray-600'>Department</p>
                        <p className='font-semibold text-lg text-[#034F75]'>{userAttendance.department}</p>
                    </div>
                    <div className='text-center p-4 bg-blue-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 col-span-2'>
                        <p className='text-xs text-gray-600'>Team Assignment</p>
                        <p className='font-semibold text-lg text-[#034F75]'>{userAttendance.team}</p>
                    </div>
                </div>

                {/* Performance Meter */}
                <div className='w-full mx-auto mb-8'>
                    <div className='flex justify-between items-center mb-2'>
                        <span className='text-sm font-medium text-gray-700'>Overall Performance</span>
                        <span className='text-lg font-bold text-cyan-600'>{userAttendance.performanceScore}%</span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-3'>
                        <div 
                            className='bg-cyan-500 h-3 rounded-full transition-all duration-700 ease-out' 
                            style={{ width: `${userAttendance.performanceScore}%` }}
                        ></div>
                    </div>
                </div>

                <button className='w-full bg-[#034F75] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg active:scale-95'>
                    Access Full Profile
                </button>
            </div>
        </div>

        {/* Right Column for Check-in/Out & Today's Hours - shorter, side-by-side on smaller screens, stacked on larger */}
        <div className='col-span-1 md:col-span-1 lg:col-span-1 flex flex-col gap-6'>
            {/* Check In/Check Out Action Card */}
            <div className={`rounded-xl shadow-md p-6 flex flex-col justify-center items-center text-center flex-grow transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]
                            ${userAttendance.isCheckedIn ? 'bg-[#034F75]' : ' bg-[#034F75]'} text-white`}>
                <div className='w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 transform transition-transform hover:rotate-12 duration-300'>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#034F75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h8m-8 4h8m-6 4h4m-4 0v-2m4 0v2m0 0a2 2 0 01-2 2H8a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v14a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className='text-sm opacity-90 mb-2'>Current Status</p>
                <h3 className='font-bold text-2xl mb-4'>
                    {userAttendance.todayStatus}
                </h3>
                {userAttendance.isCheckedIn ? (
                    <button 
                        onClick={handleCheckOut}
                        disabled={isLoading}
                        className='bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full text-md transition duration-300 ease-in-out w-full disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-md'
                    >
                        {isLoading ? 'Checking Out...' : 'Check Out Now'}
                    </button>
                ) : (
                    <button 
                        onClick={handleCheckIn}
                        disabled={isLoading}
                        className='bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-full text-md transition duration-300 ease-in-out w-full disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-md'
                    >
                        {isLoading ? 'Checking In...' : 'Check In Now'}
                    </button>
                )}
            </div>

            {/* Today's Working Hours Card */}
            <div className='bg-white rounded-xl shadow-md p-6 flex flex-col justify-center items-center text-center flex-grow transform hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300'>
                <div className='w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 transform transition-transform hover:rotate-12 duration-300'>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-[#034F75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className='text-sm text-gray-600 mb-2'>Total Today's Hours</p>
                <h3 className='font-bold text-2xl text-[#034F75]'>{userAttendance.todayWorkingHours}</h3>
                <p className='text-xs text-gray-500 mt-3'>In: {userAttendance.checkInTime || 'N/A'} | Out: {userAttendance.checkOutTime || 'N/A'}</p>
            </div>
        </div>

      </div>

      {/* Mid-Row: My Quick Stats & Team Connectivity */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          {/* My Quick Stats Card - Refined and concise, similar to "My Courses" */}
          <div className='bg-white rounded-xl shadow-md p-6 transform hover:scale-[1.005] transition-transform duration-300'>
              <h3 className='font-bold text-xl mb-4 text-gray-800'>My Quick Stats</h3>
              <div className='space-y-4'> 
                  {/* Unread Messages */}
                  <div className='flex items-center space-x-4 p-3 bg-blue-50 rounded-lg transform transition-transform hover:scale-105 duration-200'>
                      <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0'> 
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" /><path d="M14 8H4a2 2 0 00-2 2v1a2 2 0 002 2h12a2 2 0 002-2v-1a2 2 0 00-2-2h-2zM2 13a2 2 0 002 2h12a2 2 0 002-2v1a2 2 0 01-2 2H4a2 2 0 01-2-2v-1z" /></svg>
                      </div>
                      <div>
                        <p className='font-semibold text-lg text-gray-800'>{quickStats.unreadMessages} New Messages</p> 
                        <p className='text-sm text-gray-500'>Check your inbox for updates.</p> 
                      </div>
                  </div>
                  {/* Tasks Due Soon */}
                  <div className='flex items-center space-x-4 p-3 bg-amber-50 rounded-lg transform transition-transform hover:scale-105 duration-200'>
                      <div className='w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0'>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                      </div>
                      <div>
                        <p className='font-semibold text-lg text-gray-800'>{quickStats.tasksDueSoon} Tasks Due Soon</p>
                        <p className='text-sm text-gray-500'>Prioritize your upcoming assignments.</p>
                      </div>
                  </div>
                  {/* Feedback Received */}
                  <div className='flex items-center space-x-4 p-3 bg-indigo-50 rounded-lg transform transition-transform hover:scale-105 duration-200'>
                      <div className='w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0'>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-700" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 13.5V10A8 8 0 002 10v3.5a1.5 1.5 0 003 0V12h.5a.5.5 0 01.5.5V13a.5.5 0 00.5.5h.5a.5.5 0 00.5-.5v-.5h.5a.5.5 0 01.5.5V13.5a1.5 1.5 0 003 0zM12 2.25A1.75 1.75 0 0010.25 4h-4.5A1.75 1.75 0 004 2.25v-.25a.75.75 0 011.5 0v.25h9v-.25a.75.75 0 011.5 0v.25z" clipRule="evenodd" /></svg>
                      </div>
                      <div>
                        <p className='font-semibold text-lg text-gray-800'>{quickStats.feedbackReceived} New Feedback</p>
                        <p className='text-sm text-gray-500'>Review your recent performance feedback.</p>
                      </div>
                  </div>
              </div>
          </div>

          {/* Team Connectivity Card */}
          <div className='bg-white rounded-xl shadow-md p-6 transform hover:scale-[1.005] transition-transform duration-300'>
              <h3 className='font-bold text-xl mb-4 text-gray-800'>Team Connectivity</h3>
              <div className='space-y-4 max-h-64 overflow-y-auto scrollbar-hide'>
                  {teamMembers.map(member => (
                      <div key={member.id} className='flex items-center space-x-4 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0'>
                          <div className='relative flex-shrink-0'>
                              <img 
                                  src={member.avatar} 
                                  alt={member.name} 
                                  className='w-12 h-12 rounded-full object-cover transform transition-transform hover:scale-110 duration-200'
                              />
                              {member.status === 'online' && (
                                  <span className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse'></span>
                              )}
                              {member.status === 'away' && (
                                  <span className='absolute bottom-0 right-0 w-3 h-3 bg-amber-500 rounded-full border-2 border-white'></span>
                              )}
                              {member.status === 'offline' && (
                                  <span className='absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-white'></span>
                              )}
                          </div>
                          <div>
                              <p className='font-semibold text-gray-800'>{member.name}</p>
                              <p className='text-sm text-gray-500 capitalize'>{member.status}</p>
                          </div>
                          <button className='ml-auto bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-md hover:bg-blue-200 transition-colors duration-200'>
                              Message
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      </div>

      {/* Bottom Row: Monthly Working Hours Trend (Graph) & Leave Status Overview */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
        {/* Monthly Working Hours Trend (Graph) */}
        <div className='bg-white rounded-xl shadow-md p-6 lg:col-span-2 transform hover:scale-[1.005] transition-transform duration-300'>
            <h3 className='font-bold text-xl mb-4 text-[#034F75]'>Monthly Working Hours Trend</h3>
            <div className='h-64'> {/* Fixed height for the chart */}
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={monthlyHoursData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <Tooltip 
                            cursor={{ stroke: '#034F75', strokeWidth: 1 }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0px 4px 8px rgba(0,0,0,0.1)' }}
                            labelStyle={{ color: '#034F75', fontWeight: 'bold' }}
                            itemStyle={{ color: '#555' }}
                        />
                        <Line type="monotone" dataKey="hours" stroke="#034F75" strokeWidth={2} dot={{ r: 4, fill: '#034F75' }} activeDot={{ r: 6, fill: '#034F75', stroke: '#034F75', strokeWidth: 2 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <p className='text-xs text-gray-500 mt-4 text-center'>Average weekly hours over the last month.</p>
        </div>

        {/* Leave Status Overview - Graphic cards */}
        <div className='bg-white rounded-xl shadow-md p-6 transform hover:scale-[1.005] transition-transform duration-300'>
            <h3 className='font-bold text-xl mb-4 text-[#034F75]'>Leave Status</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {/* Annual Leave */}
                <div className='bg-blue-50 rounded-lg p-4 text-center transform transition-transform hover:scale-105 duration-200'>
                    <p className='text-sm text-[#034F75]'>Annual</p>
                    <h4 className='font-bold text-3xl text-[#034F75]'>{userAttendance.leaveBalance.annual}</h4>
                    <p className='text-xs text-gray-500'>Days Left</p>
                </div>
                {/* Sick Leave */}
                <div className='bg-red-50 rounded-lg p-4 text-center transform transition-transform hover:scale-105 duration-200'>
                    <p className='text-sm text-red-700'>Sick</p>
                    <h4 className='font-bold text-3xl text-red-700'>{userAttendance.leaveBalance.sick}</h4>
                    <p className='text-xs text-gray-500'>Days Left</p>
                </div>
                {/* Casual Leave */}
                <div className='bg-cyan-50 rounded-lg p-4 text-center transform transition-transform hover:scale-105 duration-200'>
                    <p className='text-sm text-cyan-700'>Casual</p>
                    <h4 className='font-bold text-3xl text-cyan-700'>{userAttendance.leaveBalance.casual}</h4>
                    <p className='text-xs text-gray-500'>Days Left</p>
                </div>
                {/* Pending Requests */}
                <div className='bg-yellow-50 rounded-lg p-4 text-center transform transition-transform hover:scale-105 duration-200 flex flex-col justify-center'>
                    <p className='text-sm text-yellow-700'>Pending</p>
                    <h4 className='font-bold text-3xl text-yellow-700'>{userAttendance.leaveBalance.pendingRequests}</h4>
                    <p className='text-xs text-gray-500'>Requests</p>
                </div>
            </div>
            <button className='mt-5 w-full bg-[#034F75] hover:bg-blue-700 text-white font-bold py-2 rounded-md text-sm transition-colors duration-200'>
                View All Requests
            </button>
        </div>
      </div>

      {/* Final Row: Upcoming Deadlines/Tasks & Company Announcements */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Upcoming Deadlines/Tasks (List with Priority) */}
        <div className='bg-white rounded-xl shadow-md p-6 transform hover:scale-[1.005] transition-transform duration-300'>
            <h3 className='font-bold text-xl mb-4 text-[#034F75]'>Upcoming Deadlines & Tasks</h3>
            <div className='space-y-4 max-h-64 overflow-y-auto scrollbar-hide'>
                {upcomingTasks.map(task => (
                    <div key={task.id} className='flex items-start space-x-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0'>
                        <div className={`w-2 h-10 flex-shrink-0 rounded-full ${task.color.replace('text-', 'bg-')}`}></div> {/* Priority bar */}
                        <div>
                            <h4 className='font-semibold text-gray-800'>{task.title}</h4>
                            <p className='text-sm text-gray-500'>Due: {task.date}</p>
                            <span className={`text-xs font-medium ${task.color}`}>{task.priority} Priority</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Company Announcements (Retained & Enhanced) */}
        <div className='bg-white rounded-xl shadow-md p-6 transform hover:scale-[1.005] transition-transform duration-300'>
            <h3 className='font-bold text-xl mb-4 text-[#034F75]'>Company Announcements</h3>
            <div className='space-y-4 max-h-64 overflow-y-auto scrollbar-hide'>
                {announcements.map(announcement => (
                    <div key={announcement.id} className='flex items-start space-x-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0'>
                        <div className='w-10 h-10 flex-shrink-0 bg-blue-100 rounded-md flex items-center justify-center transform transition-transform hover:rotate-3 duration-200'>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#034F75]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className='font-semibold text-gray-800'>{announcement.title}</h4>
                            <p className='text-sm text-gray-500'>{announcement.date}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>

    </div>
  );
};

export default EmployeeDashboard;
