import type { Metadata } from "next";
import Link from "next/link";
import { buttonPrimary, emptyState, pageMain } from "@/components/ui";

export const metadata: Metadata = {
  title: "Page not found · Meeting log",
};

// Shown for any address the app doesn't have (e.g. /foo or /meetings).
export default function NotFound() {
  return (
    <main className={pageMain}>
      <div className={`${emptyState} mx-auto max-w-2xl py-12`}>
        <p className="font-mono text-xs uppercase tracking-widest text-accent-fg">Error 404</p>
        <h1 className="mt-2 text-xl font-semibold text-fg">Page not found</h1>
        <p className="mt-2 text-sm text-muted">
          There&apos;s nothing at this address. Check the link, or head back to your meetings.
        </p>
        <Link href="/" className={`${buttonPrimary} mt-5`}>
          Go to meeting log
        </Link>
      </div>
    </main>
  );
}
