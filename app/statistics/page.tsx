import type { Metadata } from "next";
import { Suspense } from "react";
import { Statistics } from "@/components/statistics";

export const metadata: Metadata = {
  title: "Statistics · Meeting log",
};

export default function StatisticsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Statistics
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          An overview of the meetings you&apos;ve logged, up to today.
        </p>
      </header>
      <Suspense
        fallback={<p className="text-sm text-zinc-500 dark:text-zinc-400">Loading statistics…</p>}
      >
        <Statistics />
      </Suspense>
    </main>
  );
}
