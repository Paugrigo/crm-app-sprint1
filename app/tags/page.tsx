import type { Metadata } from "next";
import { Suspense } from "react";
import { TagsManager } from "@/components/tags-manager";

export const metadata: Metadata = {
  title: "Tags · Meeting log",
};

export default function TagsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Tags
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Use tags to group meetings, e.g. by client, project, or type of meeting.
        </p>
      </header>
      <Suspense
        fallback={<p className="text-sm text-zinc-500 dark:text-zinc-400">Loading tags…</p>}
      >
        <TagsManager />
      </Suspense>
    </main>
  );
}
