export const getTodayDateParam = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
    const day = today.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  export const formatDuration = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "0h 0m";
    }
  
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
  
    return `${hrs}h ${mins}m`;
  };
  
  export const formatTime = (timestampMs: number) => {
    return new Date(timestampMs).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true, // or false for 24-hour format
    });
  };
  