import type { Metadata } from "next";
import { Suspense } from "react";
import { NewMeeting } from "@/components/new-meeting";

export const metadata: Metadata = {
  title: "Log a meeting · Meeting log",
};

export default function NewMeetingPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Log a meeting
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Record who you met, when, and what was discussed.
        </p>
      </header>
      <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <Suspense
          fallback={<p className="text-sm text-zinc-500 dark:text-zinc-400">Loading form…</p>}
        >
          <NewMeeting />
        </Suspense>
      </section>
    </main>
  );
}
