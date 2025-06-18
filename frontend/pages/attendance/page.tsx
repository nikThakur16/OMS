"use client";

import { useEffect, useState } from "react";

import { useGetAllAttendanceQuery } from "@/store/api";
import {
  getTodayDateParam,
  formatDuration,
  formatTime,
} from "@/utils/Time&Date";
import AttendanceRow from "@/components/attendance/AttendanceRow";


interface PageProps {
  height?: string;
}

const Page = ({ height }: PageProps) => {
  const {
    data: attendanceData,
    isLoading,
    error,
  } = useGetAllAttendanceQuery(getTodayDateParam(), {
    pollingInterval: 60 * 1000, // Poll every 60 seconds
  });



  return (
    <div className="bg-white text-[#034F75] max-h-[50vh] rounded-md shadow-md p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-[16px]">Attendance</h1>
        <p className="font-bold text-[12px]">
          <span className="font-bold text-[16px]">Date:</span>{" "}
          {getTodayDateParam()}
        </p>
      </div>

      <div
        className={`relative overflow-y-auto ${
          height ? height : "max-h-[37vh]"
        } mt-6 scrollbar-hide`}
      >
        <table className="w-full">
          <thead className="sticky top-0 bg-white border-b border-zinc-100 z-10">
            <tr className="w-full text-[14px] tracking-wider">
              <th className="px-4 py-2 font-bold text-center tracking-wider">
                Profile
              </th>
              <th className="px-4 py-2 font-bold text-left tracking-wider">
                Name
              </th>
              <th className="px-4 py-2 font-bold text-center tracking-wider">
                Check In
              </th>
              <th className="px-4 py-2 font-bold text-center tracking-wider">
                Check Out
              </th>
              <th className="px-4 py-2 font-bold text-center tracking-wider">
                Working HR's
              </th>
              <th className="px-4 py-2 font-bold text-center tracking-wider">
                Break Time
              </th>
              <th className="px-4 py-2 font-bold text-center tracking-wider">
                Extra Hr's
              </th>
              <th className="px-4 py-2 font-bold text-center tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {attendanceData?.map((user, index) => (
              <AttendanceRow key={index} user={user} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Page;
