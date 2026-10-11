"use client";

import { useRouter } from "next/navigation";
import { use, useLayoutEffect, useState } from "react";
import { browser } from "react-dom";
import { formatMeetingDate } from "@/lib/format-date";
import { saveMeetings } from "@/lib/meetings";
import { useMeetings } from "@/lib/use-meetings";
import { DeleteMeetingButton } from "./delete-meeting-button";

// Browser-only: meetings come from localStorage, which doesn't exist during prerendering.
// Render inside a <Suspense> boundary.
export function MeetingDetail({ id }: { id: string }) {
  use(browser("Meetings are stored in localStorage."));

  const router = useRouter();
  const meetings = useMeetings();
  const meeting = meetings.find((m) => m.id === id);
  const [saveFailed, setSaveFailed] = useState(false);
  const [deleted, setDeleted] = useState(false);

  // Next.js keeps this page alive (hidden) after navigating away. Reset when it's hidden so
  // returning with the browser's back button shows "not found" rather than a blank page.
  useLayoutEffect(() => () => setDeleted(false), []);

  function deleteMeeting(meetingId: string) {
    if (saveMeetings(meetings.filter((m) => m.id !== meetingId))) {
      setDeleted(true);
      router.push("/");
    } else {
      setSaveFailed(true);
    }
  }

  // Render nothing while navigating home after a delete, instead of flashing "not found".
  if (!meeting && deleted) return null;

  if (!meeting) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
        <title>Meeting not found · Meeting log</title>
        <p className="font-medium text-zinc-900 dark:text-zinc-100">Meeting not found</p>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          It may have been deleted, or it was saved in a different browser.
        </p>
      </div>
    );
  }

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      {/* React hoists <title> into <head>, so bookmarks get the meeting's name. */}
      <title>{`${meeting.name} · Meeting log`}</title>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {meeting.name}
          </h1>
          <time
            dateTime={meeting.date}
            className="mt-1 block text-sm text-zinc-500 dark:text-zinc-400"
          >
            {formatMeetingDate(meeting.date)}
          </time>
        </div>
        <DeleteMeetingButton meeting={meeting} onDelete={deleteMeeting} />
      </div>

      {saveFailed && (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          Couldn&apos;t delete: browser storage is unavailable.
        </p>
      )}

      <section className="mt-6">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Participants</h2>
        {meeting.participants.length > 0 ? (
          <ul className="mt-2 flex flex-wrap gap-2">
            {meeting.participants.map((participant) => (
              <li
                key={participant}
                className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
              >
                {participant}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">No participants added.</p>
        )}
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Notes</h2>
        {meeting.notes ? (
          <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-800 dark:text-zinc-200">
            {meeting.notes}
          </p>
        ) : (
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">No notes.</p>
        )}
      </section>
    </article>
  );
}
