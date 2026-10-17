"use client";

import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { browser } from "react-dom";
import { saveMeetings, type Meeting } from "@/lib/meetings";
import { useMeetings } from "@/lib/use-meetings";
import { MeetingForm } from "./meeting-form";

// Browser-only: saving needs localStorage, and the form's default date must be the visitor's
// today, not the day the page was prerendered. Render inside a <Suspense> boundary.
export function NewMeeting() {
  use(browser("Meetings are stored in localStorage."));

  const router = useRouter();
  const meetings = useMeetings();
  const [saveFailed, setSaveFailed] = useState(false);

  function addMeeting(draft: Omit<Meeting, "id">) {
    const id = crypto.randomUUID();
    if (saveMeetings([{ id, ...draft }, ...meetings])) {
      setSaveFailed(false);
      router.push(`/meetings/${id}`);
    } else {
      setSaveFailed(true);
    }
  }

  return (
    <>
      {saveFailed && (
        <p
          role="alert"
          className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          Couldn&apos;t save your meeting: browser storage is unavailable or full.
        </p>
      )}
      <MeetingForm onSubmit={addMeeting} />
    </>
  );
}
