import type { Meeting } from "@/lib/meetings";

function formatMeetingDate(date: string): string {
  // Build the date from its parts so it isn't shifted by the UTC parsing of "YYYY-MM-DD".
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function MeetingList({ meetings }: { meetings: Meeting[] }) {
  if (meetings.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        No meetings logged yet.
      </p>
    );
  }

  // Newest first; ISO dates sort correctly as strings.
  const sorted = [...meetings].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <ul className="space-y-3">
      {sorted.map((meeting) => (
        <li
          key={meeting.id}
          className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{meeting.name}</h3>
            <time dateTime={meeting.date} className="text-sm text-zinc-500 dark:text-zinc-400">
              {formatMeetingDate(meeting.date)}
            </time>
          </div>
          {meeting.participants.length > 0 && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              With {meeting.participants.join(", ")}
            </p>
          )}
          {meeting.notes && (
            <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
              {meeting.notes}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
