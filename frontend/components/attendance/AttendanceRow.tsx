import {useLiveWorkingTime} from "@/utils/hooks/LiveWorkingHours";
import {useLiveBreakTime} from "@/utils/hooks/LiveBreakingHours";
import {formatTime, formatDuration} from "@/utils/Time&Date";



 const AttendanceRow = ({ user }: { user: any }) => {
    const liveWorkTime = useLiveWorkingTime(user.checkInTime, user.breakTime, user.status);
    const liveBreakTime = useLiveBreakTime(user.currentBreakStartTime);
  
    return (
      <tr className="border-b border-zinc-100 text-sm font-medium tracking-wider">
        <td className="text-center py-4">
          <img
            height={40}
            width={40}
            className="rounded-full w-8 h-8 object-cover mx-auto"
            src="/images/cat.jpg"
            alt=""
          />
        </td>
        <td className="text-left py-4">
          <div className="flex flex-col gap-1">
            <h2 className="font-bold text-[14px]">{user?.employeeName}</h2>
            <p className="text-[12px]">{user.role}</p>
          </div>
        </td>
        <td className="text-center py-4">
          {user?.checkInTime ? formatTime(user.checkInTime) : "----"}
        </td>
        <td className="text-center py-4">
          {user?.checkOutTime ? formatTime(user.checkOutTime) : "---"}
        </td>
        <td className="text-center py-4">
          {user.status === "Checked In"
            ? liveWorkTime
            : formatDuration(user.workingHours || 0)}
        </td>
        <td className="text-center py-4">
          {user.status === "onBreak"
            ? liveBreakTime
            : formatDuration(user.breakTime || 0)}
        </td>
        <td className="text-center py-4">{formatDuration(user.overtime || 0)}</td>
        <td className="text-center py-4">{user.status}</td>
      </tr>
    );
  };
  
  export default AttendanceRow;