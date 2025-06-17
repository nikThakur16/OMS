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
