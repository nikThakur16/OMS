"use client";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  useUpdateAttendanceMutation,
  useGetEmployeeAttendanceByIdQuery,
  useGetUserByIdQuery,
  useGetEmployeeDashboardQuery,
} from "@/store/api";
import { set } from "lodash";

const EmployeeDashboard = () => {
  // const user = localStorage.getItem("user");
  // const loggedInEmployeeId = user ? JSON.parse(user)?.id : null;
  const [breakTime, setBreakTime] = useState<any>(null);
  const loggedUser = useAppSelector((state) => state?.login?.user);
  console.log("=============================", loggedUser);
  const [backTime, setBackTime] = useState<any>(null);
  // --- Mock User Data & Attendance State ---
  const [triggerUpdateAttendance, { isLoading: isUpdatingAttendance }] =
    useUpdateAttendanceMutation();

  const [attendanceStatus, setAttendanceStatus] = useState<
    "notCheckedIn" | "checkedIn" | "onBreak" | "checkedOut"
  >(() => (localStorage.getItem("status") as any) ?? "notCheckedIn");
  const [employeeData, setEmployeeData] = useState<any>(null); // State to hold employee data


  const [userAttendance, setUserAttendance] = useState({
    name: "Loading...", // Default for display
    role: "N/A", // Default for display
    avatar: "/images/cat.jpg", // A default placeholder image
    employeeId: "N/A",
    department: "N/A",
    team: "N/A",
    performanceScore: 0,
    isCheckedIn: false,
    checkInTime: null as string | null,
    checkOutTime: null as string | null,
    todayWorkingHours: "00hr 00min",
    todayBreakTime: "00min",
    todayOvertime: "00hr 00min",
    todayStatus: "Not Checked In",
    weeklyHours: "00hr 00min",
    monthlyAttendanceRate: "0%",
    leaveBalance: {
      annual: 0,
      sick: 0,
      casual: 0,
      pendingRequests: 0,
    },
  });

  const getTodayDateParam = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
    const day = today.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const loggedInEmployeeId = loggedUser?.id || null; // Get the logged-in employee ID from the user state
  const {
    data: employeeAttendanceRecords,
    isLoading: isFetchingAttendance,
    error: fetchAttendanceError,
    refetch: refetchEmployeeAttendance,
  } = useGetEmployeeAttendanceByIdQuery({
    employeeId: loggedUser?.id,
    date: getTodayDateParam(),
  });


  const { data: EmployeeeData, error, isLoading } = useGetEmployeeDashboardQuery();
  const personalDetails = EmployeeeData?.user?.personalDetails || {};
  const AttendanceData=EmployeeeData?.attendance || {};
  

useEffect(() => {
  console.log("EmployeeeData: ", EmployeeeData);
  console.log("Error: ", error);
  console.log("Loading: ", isLoading);
}, [EmployeeeData, error, isLoading]);


  useEffect(() => {
    if (employeeAttendanceRecords && employeeAttendanceRecords.length > 0) {
      const todayRecord = employeeAttendanceRecords[0];
      if (
        typeof todayRecord.employeeId === "object" &&
        todayRecord.employeeId !== null
      ) {
        const personalDetails = todayRecord.employeeId.personalDetails;
        const employmentId = todayRecord.employeeId?._id; // Access employmentDetails from the populated object

        console.log(
          "+++++++++++++++++++++++++++++++++",
          personalDetails,
          employmentId
        );

        setUserAttendance((prev) => ({
          ...prev,
          name:
            `${personalDetails?.firstName || ""} ${
              personalDetails?.lastName || ""
            }`.trim() || prev.name,
          role: personalDetails?.role || prev.role,
          // avatar: personalDetails?.profilePicture || prev.avatar,
          employeeId: employmentId || prev.employeeId, // Use the employeeId from the populated user
          department: personalDetails?.department || prev.department,
          team: prev.team,
          // performanceScore: userData?.performanceScore || prev.performanceScore, // If performanceScore is on User model
          checkInTime: todayRecord.checkInTime,
          checkOutTime: todayRecord.checkOutTime,
          todayWorkingHours: todayRecord.workingHours || "00hr 00min",
          todayBreakTime: todayRecord.breakTime || "00min",
          todayOvertime: todayRecord.overtime || "00hr 00min",
          todayStatus: todayRecord.status || "Not Checked In",
          isCheckedIn:
            todayRecord.status === "Checked In" ||
            todayRecord.status === "onBreak",
        }));
      }
    }
  }, [employeeAttendanceRecords]);
  console.log("============************000==========", employeeData);

// Helper to format duration (for UI only)

// --- Handlers for Check In/Out Actions ---

const handleCheckIn = async () => {
  const currentTime = new Date().toISOString();  // send full ISO date

  try {
    await triggerUpdateAttendance({
      type: "checkIn",
      checkInTime: currentTime,
    }).unwrap();

    setAttendanceStatus("checkedIn");
    localStorage.setItem("status", "checkedIn");
  } catch (error) {
    console.error("Check-in failed:", error);
  }
};

const handleCheckOut = async () => {
  const currentTime = new Date().toISOString(); 
  
 if(AttendanceData.status === "onBreak") {
  // If currently on break, handle back to work first
    await handleBack();
  } else if (AttendanceData.status === "notCheckedIn") {
    // If not checked in, handle check-in first
    await handleCheckIn();
 }

  try {
    await triggerUpdateAttendance({
      type: "checkOut",
     
      checkOutTime: currentTime,
    }).unwrap();

    setAttendanceStatus("checkedOut");
    localStorage.setItem("status", "checkedOut");
  } catch (error) {
    console.error("Check-out failed:", error);
  }
};

const handleBreak = async () => {
  const currentTime = new Date().toISOString();  
 
  setBreakTime(currentTime); // store ISO time for break start

  try {
    await triggerUpdateAttendance({ type: "onBreak" }).unwrap();
    console.log("=========",AttendanceData.status) // send full ISO date

    localStorage.setItem("status", "onBreak");
    setAttendanceStatus("onBreak");
  } catch (error) {
    console.error("Break failed:", error);
  }
};

const handleBack = async () => {
  const currentTime = new Date().toISOString();
  setBackTime(currentTime);

 

  try {
    await triggerUpdateAttendance({ type: "back" ,backTime:currentTime }).unwrap();

    localStorage.setItem("status", "checkedIn");
    setAttendanceStatus("checkedIn");
  } catch (error) {
    console.error("Back to work failed:", error);
  }
};

// Get today's date (for UI display only)
const getTodayDate = () => {
  return dayjs().tz("Asia/Kolkata").format("DD/MM/YYYY");
};
  // --- Mock data for Sections ---
  const announcements = [
    {
      id: 1,
      title: "Important: All hands meeting on Friday, 10 AM",
      date: "2025-06-15",
    },
    {
      id: 2,
      title: "New HR policy updates available on portal",
      date: "2025-06-10",
    },
    {
      id: 3,
      title: "Holiday schedule for December published",
      date: "2025-06-01",
    },
    {
      id: 4,
      title: "Q2 Performance Reviews starting soon",
      date: "2025-05-28",
    },
  ];

  const monthlyHoursData = [
    { name: "Week 1", hours: 40 },
    { name: "Week 2", hours: 38 },
    { name: "Week 3", hours: 42 },
    { name: "Week 4", hours: 39 },
  ];

  const upcomingTasks = [
    {
      id: 1,
      title: "Submit Expense Report",
      date: "2025-06-20",
      priority: "High",
      color: "text-red-500",
    },
    {
      id: 2,
      title: "Complete Project X Module",
      date: "2025-06-22",
      priority: "Medium",
      color: "text-orange-500",
    },
    {
      id: 3,
      title: "Review Annual Goals",
      date: "2025-06-25",
      priority: "Low",
      color: "text-blue-500",
    },
  ];

  // NEW MOCK DATA for "My Quick Stats"
  const quickStats = {
    unreadMessages: 3,
    tasksDueSoon: 2,
    feedbackReceived: 1,
  };

  // NEW MOCK DATA for "Team Connectivity"
  const teamMembers = [
    {
      id: 1,
      name: "Kamrul Hasan",
      avatar: "/images/cat.jpg",
      status: "online",
    },
    { id: 2, name: "Arfan Roky", avatar: "/images/cat.jpg", status: "offline" },
    { id: 3, name: "Afsan R.", avatar: "/images/cat.jpg", status: "online" },
    { id: 4, name: "Wasif Omee", avatar: "/images/cat.jpg", status: "away" },
  ];
  useEffect(() => {
    const stored = localStorage.getItem("status") as any;
    if (stored) {
      setAttendanceStatus(stored);
    }
  }, []);

 
  const formatDuration=(seconds)=> {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
   
    return `${hrs}h ${mins}m `;
  }
  
  const formatTime=(timestampMs)=> {
    return new Date(timestampMs).toLocaleTimeString();
  }
  

  return (
    <div className="flex flex-col min-h-[calc(100vh-theme('spacing.6'))] p-6 bg-gray-50">
      <h1 className="text-3xl font-extrabold mb-8 text-[#034F75]">Dashboard</h1>

      {/* Top Row: Hero Profile Card & Smaller Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 items-stretch">
        {/* Main Hero Profile Card - Wider and more prominent */}
        <div className="bg-white rounded-xl shadow-xl col-span-1 md:col-span-2 lg:col-span-2 overflow-hidden flex flex-col transform hover:scale-[1.005] transition-transform duration-300">
          {/* Top section with gradient, avatar, and core info */}
          <div className="relative p-8 flex items-center justify-between  bg-[#034F75] text-white">
            <div className="flex items-center">
              <div className="relative mr-4 transform transition-transform hover:scale-105 duration-300 ease-out">
                <img
                  src={userAttendance.avatar}
                  alt="User Avatar"
                  className="rounded-full w-28 h-28 object-cover border-4 border-white shadow-lg"
                />
                {/* Online Status Indicator */}
                <span className="absolute bottom-1 right-1 w-6 h-6 bg-cyan-400 rounded-full border-3 border-white animate-pulse-slow origin-center"></span>
              </div>
              <div>
                <h2 className="font-bold text-3xl mb-1">
                  {personalDetails.firstName}{" "}
                  {personalDetails.lastName}
                </h2>
                <p className="text-lg opacity-90">{personalDetails.role}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-base text-gray-200 italic">Today is</p>
              <p className="font-semibold text-2xl">{getTodayDate()}</p>
            </div>
          </div>

          {/* Bottom section with additional info and button */}
          <div className="flex flex-col flex-grow p-6 bg-white z-10 relative">
            <p className="text-base text-gray-600 mb-6 text-center italic">
              "Innovating solutions and driving success. Continuously learning
              and growing to achieve excellence."
            </p>

            {/* Additional Info Grid for employee details */}
            <div className="grid grid-cols-2 gap-4 w-full mx-auto mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <p className="text-xs text-gray-600">Employee ID</p>
                <p className="font-semibold text-lg text-[#034F75]">
                  {AttendanceData.employeeId}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <p className="text-xs text-gray-600">Department</p>
                <p className="font-semibold text-lg text-[#034F75]">
                  {userAttendance.department}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 col-span-2">
                <p className="text-xs text-gray-600">Team Assignment</p>
                <p className="font-semibold text-lg text-[#034F75]">
                  {userAttendance.team}
                </p>
              </div>
            </div>

            {/* Performance Meter */}
            <div className="w-full mx-auto mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Overall Performance
                </span>
                <span className="text-lg font-bold text-cyan-600">
                  {userAttendance.performanceScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-cyan-500 h-3 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${userAttendance.performanceScore}%` }}
                ></div>
              </div>
            </div>

            <button className="w-full bg-[#034F75] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors duration-300 ease-in-out transform hover:-translate-y-1 shadow-lg active:scale-95">
              Access Full Profile
            </button>
          </div>
        </div>

        {/* Right Column for Check-in/Out & Today's Hours - shorter, side-by-side on smaller screens, stacked on larger */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1 flex flex-col gap-6">
          {/* Check In/Check Out Action Card */}
          <div
            className={`rounded-xl shadow-md p-6 flex flex-col justify-center items-center text-center flex-grow transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]
                            ${
                              userAttendance.isCheckedIn
                                ? "bg-[#034F75]"
                                : " bg-[#034F75]"
                            } text-white`}
          >
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 transform transition-transform hover:rotate-12 duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-[#034F75]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h8m-8 4h8m-6 4h4m-4 0v-2m4 0v2m0 0a2 2 0 01-2 2H8a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v14a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-sm opacity-90 mb-2">Current Status</p>
            <h3 className="font-bold text-2xl mb-4">
              {userAttendance.todayStatus}
            </h3>
            <div className="space-y-2 w-full mt-6">
              {(attendanceStatus === "checkedOut" ||
                attendanceStatus === "notCheckedIn") && (
                <button
                  onClick={handleCheckIn}
                  // disabled={isCheckedIn}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-full text-md transition duration-300 ease-in-out w-full disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-md"
                >
                  Check In
                </button>
              )}
              {attendanceStatus == "checkedIn" && (
                <button
                  onClick={handleBreak}
                  // disabled={isCheckedIn}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-full text-md transition duration-300 ease-in-out w-full disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-md"
                >
                  Break
                </button>
              )}
              {attendanceStatus == "onBreak" && (
                <button
                  onClick={handleBack}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-full text-md transition duration-300 ease-in-out w-full transform hover:scale-105 shadow-md"
                >
                  Back
                </button>
              )}
              {/* Check-Out button: show when checked in or on break */}

              <button
                onClick={handleCheckOut}
                //   disabled={isCheckOutLoading}
                className="bg-red-500 text-white px-4 py-2 rounded ml-2"
              >
                {/* {isCheckOutLoading ? "Checking Out..." : "Check Out"} */}
                check out
              </button>
            </div>
          </div>

          {/* Today's Working Hours Card */}
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-center items-center text-center flex-grow transform hover:scale-[1.02] active:scale-[0.98] transition-transform duration-300">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4 transform transition-transform hover:rotate-12 duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-[#034F75]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-2"></p>
            <h3 className="font-bold text-2xl text-[#034F75]">
              {formatDuration(AttendanceData.workingHours)}
            </h3>
            <p className="text-xs text-gray-500 mt-3">
              In: {formatTime(AttendanceData?.checkInTime )|| "N/A"} | Out:{" "}
              {formatTime(AttendanceData?.checkOutTime )|| "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Mid-Row: My Quick Stats & Team Connectivity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* My Quick Stats Card - Refined and concise, similar to "My Courses" */}
        <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-[1.005] transition-transform duration-300">
          <h3 className="font-bold text-xl mb-4 text-gray-800">
            My Quick Stats
          </h3>
          <div className="space-y-4">
            {/* Unread Messages */}
            <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg transform transition-transform hover:scale-105 duration-200">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-700"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                  <path d="M14 8H4a2 2 0 00-2 2v1a2 2 0 002 2h12a2 2 0 002-2v-1a2 2 0 00-2-2h-2zM2 13a2 2 0 002 2h12a2 2 0 002-2v1a2 2 0 01-2 2H4a2 2 0 01-2-2v-1z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-lg text-gray-800">
                  {quickStats.unreadMessages} New Messages
                </p>
                <p className="text-sm text-gray-500">
                  Check your inbox for updates.
                </p>
              </div>
            </div>
            {/* Tasks Due Soon */}
            <div className="flex items-center space-x-4 p-3 bg-amber-50 rounded-lg transform transition-transform hover:scale-105 duration-200">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-amber-700"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-lg text-gray-800">
                  {quickStats.tasksDueSoon} Tasks Due Soon
                </p>
                <p className="text-sm text-gray-500">
                  Prioritize your upcoming assignments.
                </p>
              </div>
            </div>
            {/* Feedback Received */}
            <div className="flex items-center space-x-4 p-3 bg-indigo-50 rounded-lg transform transition-transform hover:scale-105 duration-200">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-indigo-700"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 13.5V10A8 8 0 002 10v3.5a1.5 1.5 0 003 0V12h.5a.5.5 0 01.5.5V13a.5.5 0 00.5.5h.5a.5.5 0 00.5-.5v-.5h.5a.5.5 0 01.5.5V13.5a1.5 1.5 0 003 0zM12 2.25A1.75 1.75 0 0010.25 4h-4.5A1.75 1.75 0 004 2.25v-.25a.75.75 0 011.5 0v.25h9v-.25a.75.75 0 011.5 0v.25z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-lg text-gray-800">
                  {quickStats.feedbackReceived} New Feedback
                </p>
                <p className="text-sm text-gray-500">
                  Review your recent performance feedback.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Connectivity Card */}
        <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-[1.005] transition-transform duration-300">
          <h3 className="font-bold text-xl mb-4 text-gray-800">
            Team Connectivity
          </h3>
          <div className="space-y-4 max-h-64 overflow-y-auto scrollbar-hide">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center space-x-4 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover transform transition-transform hover:scale-110 duration-200"
                  />
                  {member.status === "online" && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
                  )}
                  {member.status === "away" && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-amber-500 rounded-full border-2 border-white"></span>
                  )}
                  {member.status === "offline" && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-gray-400 rounded-full border-2 border-white"></span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{member.name}</p>
                  <p className="text-sm text-gray-500 capitalize">
                    {member.status}
                  </p>
                </div>
                <button className="ml-auto bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-md hover:bg-blue-200 transition-colors duration-200">
                  Message
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Monthly Working Hours Trend (Graph) & Leave Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Monthly Working Hours Trend (Graph) */}
        <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2 transform hover:scale-[1.005] transition-transform duration-300">
          <h3 className="font-bold text-xl mb-4 text-[#034F75]">
            Monthly Working Hours Trend
          </h3>
          <div className="h-64">
            {" "}
            {/* Fixed height for the chart */}
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
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ stroke: "#034F75", strokeWidth: 1 }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
                  }}
                  labelStyle={{ color: "#034F75", fontWeight: "bold" }}
                  itemStyle={{ color: "#555" }}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#034F75"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#034F75" }}
                  activeDot={{
                    r: 6,
                    fill: "#034F75",
                    stroke: "#034F75",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            Average weekly hours over the last month.
          </p>
        </div>

        {/* Leave Status Overview - Graphic cards */}
        <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-[1.005] transition-transform duration-300">
          <h3 className="font-bold text-xl mb-4 text-[#034F75]">
            Leave Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Annual Leave */}
            <div className="bg-blue-50 rounded-lg p-4 text-center transform transition-transform hover:scale-105 duration-200">
              <p className="text-sm text-[#034F75]">Annual</p>
              <h4 className="font-bold text-3xl text-[#034F75]">
                {userAttendance.leaveBalance.annual}
              </h4>
              <p className="text-xs text-gray-500">Days Left</p>
            </div>
            {/* Sick Leave */}
            <div className="bg-red-50 rounded-lg p-4 text-center transform transition-transform hover:scale-105 duration-200">
              <p className="text-sm text-red-700">Sick</p>
              <h4 className="font-bold text-3xl text-red-700">
                {userAttendance.leaveBalance.sick}
              </h4>
              <p className="text-xs text-gray-500">Days Left</p>
            </div>
            {/* Casual Leave */}
            <div className="bg-cyan-50 rounded-lg p-4 text-center transform transition-transform hover:scale-105 duration-200">
              <p className="text-sm text-cyan-700">Casual</p>
              <h4 className="font-bold text-3xl text-cyan-700">
                {userAttendance.leaveBalance.casual}
              </h4>
              <p className="text-xs text-gray-500">Days Left</p>
            </div>
            {/* Pending Requests */}
            <div className="bg-yellow-50 rounded-lg p-4 text-center transform transition-transform hover:scale-105 duration-200 flex flex-col justify-center">
              <p className="text-sm text-yellow-700">Pending</p>
              <h4 className="font-bold text-3xl text-yellow-700">
                {userAttendance.leaveBalance.pendingRequests}
              </h4>
              <p className="text-xs text-gray-500">Requests</p>
            </div>
          </div>
          <button className="mt-5 w-full bg-[#034F75] hover:bg-blue-700 text-white font-bold py-2 rounded-md text-sm transition-colors duration-200">
            View All Requests
          </button>
        </div>
      </div>

      {/* Final Row: Upcoming Deadlines/Tasks & Company Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines/Tasks (List with Priority) */}
        <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-[1.005] transition-transform duration-300">
          <h3 className="font-bold text-xl mb-4 text-[#034F75]">
            Upcoming Deadlines & Tasks
          </h3>
          <div className="space-y-4 max-h-64 overflow-y-auto scrollbar-hide">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start space-x-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
              >
                <div
                  className={`w-2 h-10 flex-shrink-0 rounded-full ${task.color.replace(
                    "text-",
                    "bg-"
                  )}`}
                ></div>{" "}
                {/* Priority bar */}
                <div>
                  <h4 className="font-semibold text-gray-800">{task.title}</h4>
                  <p className="text-sm text-gray-500">Due: {task.date}</p>
                  <span className={`text-xs font-medium ${task.color}`}>
                    {task.priority} Priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Announcements (Retained & Enhanced) */}
        <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-[1.005] transition-transform duration-300">
          <h3 className="font-bold text-xl mb-4 text-[#034F75]">
            Company Announcements
          </h3>
          <div className="space-y-4 max-h-64 overflow-y-auto scrollbar-hide">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="flex items-start space-x-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
              >
                <div className="w-10 h-10 flex-shrink-0 bg-blue-100 rounded-md flex items-center justify-center transform transition-transform hover:rotate-3 duration-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#034F75]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {announcement.title}
                  </h4>
                  <p className="text-sm text-gray-500">{announcement.date}</p>
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
