/** Formats a YYYY-MM-DD date for display, e.g. "Sun, Oct 11, 2026". */
export function formatMeetingDate(date: string): string {
  // Build the date from its parts so it isn't shifted by the UTC parsing of "YYYY-MM-DD".
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
