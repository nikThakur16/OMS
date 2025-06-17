import { useEffect, useState } from "react";

export function useLiveBreakTime(currentBreakStartTime?: number) {
  const [breakDuration, setBreakDuration] = useState("");

  useEffect(() => {
    if (!currentBreakStartTime) return;

    const updateDuration = () => {
      const now = Date.now();
      const secondsOnBreak = Math.floor((now - currentBreakStartTime) / 1000);
      const hrs = Math.floor(secondsOnBreak / 3600);
      const mins = Math.floor((secondsOnBreak % 3600) / 60);
      setBreakDuration(`${hrs}h ${mins}m`);
    };

    updateDuration();
    const interval = setInterval(updateDuration, 60 * 1000); // update every minute

    return () => clearInterval(interval);
  }, [currentBreakStartTime]);

  return breakDuration;
}
