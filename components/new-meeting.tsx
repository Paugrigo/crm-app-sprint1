"use client";

import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { browser } from "react-dom";
import { saveMeetings, type Meeting } from "@/lib/meetings";
import { useMeetings } from "@/lib/use-meetings";
import { MeetingForm } from "./meeting-form";
import { errorBox } from "./ui";

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
        <p role="alert" className={`${errorBox} mb-4`}>
          Couldn&apos;t save your meeting: browser storage is unavailable or full.
        </p>
      )}
      <MeetingForm onSubmit={addMeeting} />
    </>
  );
}
