import Link from "next/link";
import { Suspense } from "react";
import { MeetingDetail } from "@/components/meeting-detail";

export default function MeetingPage({ params }: PageProps<"/meetings/[id]">) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <nav className="mb-6">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← All meetings
        </Link>
      </nav>
      {/* Meeting IDs are only known at runtime, so params are read inside Suspense. */}
      <Suspense
        fallback={<p className="text-sm text-zinc-500 dark:text-zinc-400">Loading meeting…</p>}
      >
        {params.then(({ id }) => (
          <MeetingDetail id={id} />
        ))}
      </Suspense>
    </main>
  );
}
