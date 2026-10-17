import { Suspense } from "react";
import { MeetingLog } from "@/components/meeting-log";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Meeting log
        </h1>
      </header>
      <Suspense
        fallback={<p className="text-sm text-zinc-500 dark:text-zinc-400">Loading meetings…</p>}
      >
        <MeetingLog />
      </Suspense>
    </main>
  );
}
