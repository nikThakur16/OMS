import { useEffect, useState } from "react";

// ✅ status: "Checked In" | "onBreak" | "Checked Out"
export function useLiveWorkingTime(
  checkInTime: string,
  totalBreakTime: number = 0,
  status: "Checked In" | "onBreak" | "Checked Out"
) {
  const [liveDuration, setLiveDuration] = useState("");

  useEffect(() => {
    if (status !== "Checked In") return; // ⛔ Skip if not checked in

    const updateDuration = () => {
      const now = Date.now();
      const checkIn = new Date(checkInTime).getTime();
      const secondsWorked = Math.floor((now - checkIn) / 1000 - totalBreakTime);

      const hrs = Math.floor(secondsWorked / 3600);
      const mins = Math.floor((secondsWorked % 3600) / 60);

      const formatted = `${hrs}h ${mins.toString().padStart(2, "0")}m`;
      setLiveDuration(formatted);
    };

    updateDuration(); // Initial call

    const interval = setInterval(updateDuration, 60 * 1000); // every minute

    return () => clearInterval(interval); // Cleanup
  }, [checkInTime, totalBreakTime, status]);

  return liveDuration;
}

// Accepts the sessions array and totalBreakTime for the day
export function useLiveWorkingTimeFromSessions(
  sessions: { checkIn: string; checkOut: string | null }[] = [],
  totalBreakTime: number = 0,
  status: "Checked In" | "onBreak" | "Checked Out"
) {
  const [liveDuration, setLiveDuration] = useState("0h 00m");

  useEffect(() => {
    // Helper to calculate total worked seconds from completed sessions
    const getTotalWorkedSeconds = () => {
      let total = 0;
      for (const session of sessions) {
        if (session.checkIn && session.checkOut) {
          total += (new Date(session.checkOut).getTime() - new Date(session.checkIn).getTime()) / 1000;
        }
      }
      return total;
    };

    // Find the current open session
    const currentSession = sessions.find((s) => s.checkIn && !s.checkOut);

    const updateDuration = () => {
      let totalSeconds = getTotalWorkedSeconds();

      if (status === "Checked In" && currentSession) {
        // Add live seconds for the current session
        const now = Date.now();
        const checkIn = new Date(currentSession.checkIn).getTime();
        totalSeconds += Math.floor((now - checkIn) / 1000);
      }

      // Subtract total break time
      totalSeconds -= totalBreakTime;
      if (totalSeconds < 0) totalSeconds = 0;

      const hrs = Math.floor(totalSeconds / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);

      const formatted = `${hrs}h ${mins.toString().padStart(2, "0")}m`;
      setLiveDuration(formatted);
    };

    updateDuration(); // Initial call

    // Only update live if checked in or on break
    if (status === "Checked In" || status === "onBreak") {
      const interval = setInterval(updateDuration, 60 * 1000); // every minute
      return () => clearInterval(interval); // Cleanup
    }
  }, [sessions, totalBreakTime, status]);

  return liveDuration;
}
