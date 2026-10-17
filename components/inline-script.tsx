"use client";

/**
 * A script that runs during HTML parsing on full page loads, before React hydrates.
 * On the client it renders as text/plain, so React doesn't warn and it never re-runs.
 * See node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
