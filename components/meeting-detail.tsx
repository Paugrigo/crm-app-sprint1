"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useLayoutEffect, useState } from "react";
import { browser } from "react-dom";
import { formatMeetingDate } from "@/lib/format-date";
import { saveMeetings, type Meeting } from "@/lib/meetings";
import { useMeetings } from "@/lib/use-meetings";
import { DeleteMeetingButton } from "./delete-meeting-button";
import { MeetingForm } from "./meeting-form";

// Browser-only: meetings come from localStorage, which doesn't exist during prerendering.
// Render inside a <Suspense> boundary.
export function MeetingDetail({ id }: { id: string }) {
  use(browser("Meetings are stored in localStorage."));

  const router = useRouter();
  const meetings = useMeetings();
  const meeting = meetings.find((m) => m.id === id);
  const [failedAction, setFailedAction] = useState<"save" | "delete" | null>(null);
  const [deleted, setDeleted] = useState(false);
  const [editing, setEditing] = useState(false);

  // Next.js keeps this page alive (hidden) after navigating away. Reset when it's hidden so
  // returning with the browser's back button shows "not found" rather than a blank page,
  // and doesn't reopen an abandoned edit with values that may since have changed.
  useLayoutEffect(
    () => () => {
      setDeleted(false);
      setEditing(false);
      setFailedAction(null);
    },
    [],
  );

  function updateMeeting(draft: Omit<Meeting, "id">) {
    if (saveMeetings(meetings.map((m) => (m.id === id ? { id, ...draft } : m)))) {
      setEditing(false);
      setFailedAction(null);
    } else {
      setFailedAction("save");
    }
  }

  function deleteMeeting(meetingId: string) {
    if (saveMeetings(meetings.filter((m) => m.id !== meetingId))) {
      setDeleted(true);
      router.push("/");
    } else {
      setFailedAction("delete");
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
        <Link
          href="/"
          className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Go to meeting log
        </Link>
      </div>
    );
  }

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      {/* React hoists <title> into <head>, so bookmarks get the meeting's name. */}
      <title>{`${meeting.name} · Meeting log`}</title>

      {failedAction && (
        <p
          role="alert"
          className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {failedAction === "save"
            ? "Couldn't save your changes: browser storage is unavailable or full."
            : "Couldn't delete: browser storage is unavailable."}
        </p>
      )}

      {editing ? (
        <>
          <h1 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Edit meeting
          </h1>
          <MeetingForm
            initial={meeting}
            submitLabel="Save changes"
            onSubmit={updateMeeting}
            onCancel={() => {
              setEditing(false);
              setFailedAction(null);
            }}
          />
        </>
      ) : (
        <>
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
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setFailedAction(null);
                }}
                aria-label={`Edit ${meeting.name}`}
                title="Edit meeting"
                className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-2.5 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800"
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
                  <path d="M13.5 3.5l3 3L7 16H4v-3l9.5-9.5ZM11.5 5.5l3 3" />
                </svg>
                Edit
              </button>
              <DeleteMeetingButton meeting={meeting} onDelete={deleteMeeting} />
            </div>
          </div>

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
        </>
      )}
    </article>
  );
}
