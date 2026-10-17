import type { Metadata } from "next";
import { Suspense } from "react";
import { Settings } from "@/components/settings";

export const metadata: Metadata = {
  title: "Settings · Meeting log",
};

export default function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        Settings
      </h1>
      <Suspense
        fallback={<p className="text-sm text-zinc-500 dark:text-zinc-400">Loading settings…</p>}
      >
        <Settings />
      </Suspense>
    </main>
  );
}
