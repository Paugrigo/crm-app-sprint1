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

export function MeetingList({
  meetings,
  onDelete,
}: {
  meetings: Meeting[];
  onDelete: (id: string) => void;
}) {
  function confirmDelete(meeting: Meeting) {
    if (window.confirm(`Delete "${meeting.name}"? This can't be undone.`)) {
      onDelete(meeting.id);
    }
  }

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
            <div className="flex items-center gap-3">
              <time dateTime={meeting.date} className="text-sm text-zinc-500 dark:text-zinc-400">
                {formatMeetingDate(meeting.date)}
              </time>
              <button
                type="button"
                onClick={() => confirmDelete(meeting)}
                aria-label={`Delete ${meeting.name}`}
                title="Delete meeting"
                className="flex items-center rounded-md border border-red-300 bg-red-50 p-1.5 text-sm font-medium text-red-700 hover:border-red-600 hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300 dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:hover:border-red-600 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                >
                  <path d="M3.5 5.5h13M8 5.5V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1.5M5.5 5.5l.7 10.1a1.5 1.5 0 0 0 1.5 1.4h4.6a1.5 1.5 0 0 0 1.5-1.4l.7-10.1M8.5 9v4.5M11.5 9v4.5" />
                </svg>
              </button>
            </div>
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
