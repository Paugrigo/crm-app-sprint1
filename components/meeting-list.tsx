import Link from "next/link";
import { formatMeetingDate } from "@/lib/format-date";
import type { Meeting } from "@/lib/meetings";
import { DeleteMeetingButton } from "./delete-meeting-button";

export function MeetingList({
  meetings,
  onDelete,
}: {
  meetings: Meeting[];
  onDelete: (id: string) => void;
}) {
  if (meetings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">No meetings logged yet</p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Log your first meeting and it will show up here.
        </p>
        <Link
          href="/meetings/new"
          className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Log a meeting
        </Link>
      </div>
    );
  }

  // Newest first; ISO dates sort correctly as strings.
  const sorted = [...meetings].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <ul className="space-y-3">
      {sorted.map((meeting) => (
        // The title link stretches over the whole card (after:inset-0); the delete
        // button sits above it with z-10 so it stays clickable.
        <li
          key={meeting.id}
          className="relative rounded-lg border border-zinc-200 bg-white p-4 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              <Link
                href={`/meetings/${meeting.id}`}
                className="after:absolute after:inset-0 after:rounded-lg focus:outline-none focus-visible:after:ring-2 focus-visible:after:ring-zinc-400"
              >
                {meeting.name}
              </Link>
            </h3>
            <div className="flex items-center gap-3">
              <time dateTime={meeting.date} className="text-sm text-zinc-500 dark:text-zinc-400">
                {formatMeetingDate(meeting.date)}
              </time>
              <DeleteMeetingButton meeting={meeting} onDelete={onDelete} />
            </div>
          </div>
          {meeting.participants.length > 0 && (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              With {meeting.participants.join(", ")}
            </p>
          )}
          {meeting.notes && (
            <p className="mt-3 line-clamp-2 whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
              {meeting.notes}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
