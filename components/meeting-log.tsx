"use client";

import { use, useState } from "react";
import { browser } from "react-dom";
import { saveMeetings } from "@/lib/meetings";
import { useMeetings } from "@/lib/use-meetings";
import { MeetingList } from "./meeting-list";
import { errorBox } from "./ui";

// Browser-only: meetings come from localStorage, which doesn't exist during prerendering.
// Render inside a <Suspense> boundary.
export function MeetingLog() {
  use(browser("Meetings are stored in localStorage."));

  const meetings = useMeetings();
  const [saveFailed, setSaveFailed] = useState(false);

  function deleteMeeting(id: string) {
    setSaveFailed(!saveMeetings(meetings.filter((meeting) => meeting.id !== id)));
  }

  return (
    <section>
      {saveFailed && (
        <p role="alert" className={`${errorBox} mb-4`}>
          Couldn&apos;t save your change: browser storage is unavailable or full.
        </p>
      )}
      <MeetingList meetings={meetings} onDelete={deleteMeeting} />
    </section>
  );
}
