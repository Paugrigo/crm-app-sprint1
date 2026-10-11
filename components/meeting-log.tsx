"use client";

import { use, useEffect, useState } from "react";
import { browser } from "react-dom";
import { requestPersistentStorage, saveMeetings, type Meeting } from "@/lib/meetings";
import { useMeetings } from "@/lib/use-meetings";
import { MeetingForm } from "./meeting-form";
import { MeetingList } from "./meeting-list";

// Browser-only: meetings come from localStorage, which doesn't exist during prerendering.
// Render inside a <Suspense> boundary.
export function MeetingLog() {
  use(browser("Meetings are stored in localStorage."));

  const meetings = useMeetings();
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    requestPersistentStorage();
  }, []);

  function addMeeting(draft: Omit<Meeting, "id">) {
    setSaveFailed(!saveMeetings([{ id: crypto.randomUUID(), ...draft }, ...meetings]));
  }

  function deleteMeeting(id: string) {
    setSaveFailed(!saveMeetings(meetings.filter((meeting) => meeting.id !== id)));
  }

  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Log a meeting
        </h2>
        <MeetingForm onSubmit={addMeeting} />
      </section>

      {saveFailed && (
        <p
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          Couldn&apos;t save your change: browser storage is unavailable or full.
        </p>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Meetings <span className="font-normal text-zinc-500">({meetings.length})</span>
        </h2>
        <MeetingList meetings={meetings} onDelete={deleteMeeting} />
      </section>
    </div>
  );
}
