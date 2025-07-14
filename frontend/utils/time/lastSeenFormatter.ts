export function formatLastSeen(lastSeen: string | Date | undefined): string {
  if (!lastSeen) return "Offline";
  const now = new Date();
  const seen = new Date(lastSeen);
  const diffMs = now.getTime() - seen.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Online";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;

  // Check if today
  if (
    now.getDate() === seen.getDate() &&
    now.getMonth() === seen.getMonth() &&
    now.getFullYear() === seen.getFullYear()
  ) {
    return `Last seen at ${seen.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  // Check if yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    yesterday.getDate() === seen.getDate() &&
    yesterday.getMonth() === seen.getMonth() &&
    yesterday.getFullYear() === seen.getFullYear()
  ) {
    return `Yesterday at ${seen.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  // Else, show date
  return `Last seen on ${seen.toLocaleDateString()}`;
}
