import {useLiveWorkingTime} from "@/utils/hooks/LiveWorkingHours";
import {useLiveBreakTime} from "@/utils/hooks/LiveBreakingHours";
import {formatTime, formatDuration} from "@/utils/Time&Date";
import { useLiveWorkingTimeFromSessions } from "@/utils/hooks/LiveWorkingHours";



 const AttendanceRow = ({ user }: { user: any }) => {
    // Calculate total working hours from all sessions
    const totalWorkingSeconds = user.sessions?.reduce((acc: number, session: any) => {
      if (session.checkIn && session.checkOut) {
        return acc + (new Date(session.checkOut).getTime() - new Date(session.checkIn).getTime()) / 1000;
      }
      return acc;
    }, 0) || 0;
  
    const netWorkingSeconds = totalWorkingSeconds - (user.totalBreakTime || 0);
  
    const liveWorkingTime = useLiveWorkingTimeFromSessions(
      user.sessions,
      user.totalBreakTime,
      user.status
    );
  
    const liveBreakTime = useLiveBreakTime(user.status === "onBreak" ? user.currentBreakStartTime : undefined);
  
    // First check-in (earliest checkIn)
    const firstCheckIn =
      user.sessions && user.sessions.length
        ? user.sessions.reduce((earliest: any, session: any) => {
            if (
              !earliest ||
              (session.checkIn &&
                new Date(session.checkIn) < new Date(earliest.checkIn))
            ) {
              return session;
            }
            return earliest;
          }, null)
        : null;
  
    // Last session (for current state)
    const lastSession =
      user.sessions && user.sessions.length
        ? user.sessions[user.sessions.length - 1]
        : null;
  
    // Last check-out (latest among completed sessions)
    const lastCheckOutSession =
      user.sessions && user.sessions.length
        ? user.sessions
            .filter((s: any) => s.checkOut)
            .reduce((latest: any, session: any) => {
              if (
                !latest ||
                new Date(session.checkOut) > new Date(latest.checkOut)
              ) {
                return session;
              }
              return latest;
            }, null)
        : null;
  
    // Display logic for last check-out
    const lastCheckOutDisplay =
      lastSession && !lastSession.checkOut
        ? "---"
        : lastCheckOutSession && lastCheckOutSession.checkOut
        ? formatTime(lastCheckOutSession.checkOut)
        : "---";
  
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
          {firstCheckIn && firstCheckIn.checkIn
            ? formatTime(firstCheckIn.checkIn)
            : "---"}
        </td>
        <td className="text-center py-4">
          {lastCheckOutDisplay}
        </td>
        <td className="text-center py-4">
          {user.status === "Checked In"
            ? liveWorkingTime
            : formatDuration(netWorkingSeconds > 0 ? netWorkingSeconds : 0)}
        </td>
        <td className="text-center py-4">
          {user.status === "onBreak"
            ? liveBreakTime
            : formatDuration(user.totalBreakTime || 0)}
        </td>
        <td className="text-center py-4">{formatDuration(user.overtime || 0)}</td>
        <td className="text-center py-4">{user.status}</td>
      </tr>
    );
  };
  
  export default AttendanceRow;