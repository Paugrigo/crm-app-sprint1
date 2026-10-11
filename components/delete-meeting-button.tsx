"use client";

import type { Meeting } from "@/lib/meetings";

/** Trash-icon button that asks for confirmation before calling onDelete. */
export function DeleteMeetingButton({
  meeting,
  onDelete,
}: {
  meeting: Meeting;
  onDelete: (id: string) => void;
}) {
  function confirmDelete() {
    if (window.confirm(`Delete "${meeting.name}"? This can't be undone.`)) {
      onDelete(meeting.id);
    }
  }

  return (
    <button
      type="button"
      onClick={confirmDelete}
      aria-label={`Delete ${meeting.name}`}
      title="Delete meeting"
      className="relative z-10 flex items-center rounded-md border border-red-300 bg-red-50 p-1.5 text-sm font-medium text-red-700 hover:border-red-600 hover:bg-red-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-300 dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:hover:border-red-600 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
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
  );
}
