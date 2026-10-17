import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found · Meeting log",
};

// Shown for any address the app doesn't have (e.g. /foo or /meetings).
export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">404</p>
        <h1 className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          There&apos;s nothing at this address. Check the link, or head back to your meetings.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Go to meeting log
        </Link>
      </div>
    </main>
  );
}
