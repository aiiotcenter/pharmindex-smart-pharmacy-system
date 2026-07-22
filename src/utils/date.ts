export function formatDate(date: string | Date): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return value.toISOString().slice(0, 10);
}

export function formatTime(time: string): string {
  return time.slice(0, 5);
}
 