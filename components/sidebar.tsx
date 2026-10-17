"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, use, useEffect, useState } from "react";
import { browser } from "react-dom";
import { formatMeetingDate } from "@/lib/format-date";
import { requestPersistentStorage } from "@/lib/meetings";
import { subscribeToTheme } from "@/lib/theme";
import { useMeetings } from "@/lib/use-meetings";

const RECENT_LIMIT = 8;

const linkBase = "block rounded-md px-3 py-2 text-sm font-medium";
const linkIdle =
  "text-zinc-700 hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100";
const linkActive = "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100";

/**
 * App menu: a left sidebar on wider screens, a top bar with a Menu toggle on phones.
 * Rendered by the root layout, so it stays mounted across navigations.
 */
export function Sidebar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // The sidebar is on every page, so this runs once on startup whichever page loads first.
  useEffect(() => {
    requestPersistentStorage();
  }, []);

  // Apply theme changes made in other tabs (subscribing is enough; there's nothing to render).
  useEffect(() => subscribeToTheme(() => {}), []);

  return (
    <aside className="border-b border-zinc-200 bg-zinc-50 md:sticky md:flex md:flex-col md:top-0 md:h-screen md:w-64 md:shrink-0 md:overflow-y-auto md:border-b-0 md:border-r dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between px-4 py-4 md:px-5 md:py-6">
        <Link
          href="/"
          onClick={close}
          className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
        >
          Meeting log
        </Link>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="app-menu"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 md:hidden dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <nav
        id="app-menu"
        aria-label="Main"
        className={`${open ? "flex" : "hidden"} flex-col px-3 pb-4 md:flex md:flex-1 md:pb-6`}
      >
        {/* The active link depends on the URL, and recent meetings on localStorage; neither
            is known while prerendering, so show plain links until the browser takes over. */}
        <Suspense
          fallback={
            <>
              <MainLinks pathname={null} onNavigate={close} />
              <SettingsLink pathname={null} onNavigate={close} />
            </>
          }
        >
          <SidebarContent onNavigate={close} />
        </Suspense>
      </nav>
    </aside>
  );
}

function SidebarContent({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  return (
    <>
      <MainLinks pathname={pathname} onNavigate={onNavigate} />
      <RecentMeetings pathname={pathname} onNavigate={onNavigate} />
      <SettingsLink pathname={pathname} onNavigate={onNavigate} />
    </>
  );
}

/** Pinned to the bottom of the sidebar on wider screens; last item in the phone menu. */
function SettingsLink({
  pathname,
  onNavigate,
}: {
  pathname: string | null;
  onNavigate: () => void;
}) {
  const active = pathname === "/settings";
  return (
    <div className="mt-6 border-t border-zinc-200 pt-3 md:mt-auto dark:border-zinc-800">
      <Link
        href="/settings"
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-2 ${linkBase} ${active ? linkActive : linkIdle}`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
        >
          <path d="M3.5 6h13M3.5 14h13" />
          <circle cx="7.5" cy="6" r="1.75" fill="currentColor" />
          <circle cx="12.5" cy="14" r="1.75" fill="currentColor" />
        </svg>
        Settings
      </Link>
    </div>
  );
}

function MainLinks({
  pathname,
  onNavigate,
}: {
  pathname: string | null;
  onNavigate: () => void;
}) {
  return (
    <>
      {/* The main action, styled as a primary button so it stands out from the links. */}
      <Link
        href="/meetings/new"
        onClick={onNavigate}
        aria-current={pathname === "/meetings/new" ? "page" : undefined}
        className="mb-4 flex items-center justify-center gap-2 rounded-md bg-zinc-900 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 aria-[current=page]:ring-2 aria-[current=page]:ring-zinc-400 aria-[current=page]:ring-offset-2 aria-[current=page]:ring-offset-zinc-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950 dark:aria-[current=page]:ring-zinc-500 dark:aria-[current=page]:ring-offset-zinc-950"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className="size-4"
        >
          <path d="M10 4v12M4 10h12" />
        </svg>
        Log a meeting
      </Link>
      <ul className="space-y-1">
        <li>
          <Link
            href="/"
            onClick={onNavigate}
            aria-current={pathname === "/" ? "page" : undefined}
            className={`${linkBase} ${pathname === "/" ? linkActive : linkIdle}`}
          >
            All meetings
          </Link>
        </li>
        <li>
          <Link
            href="/tags"
            onClick={onNavigate}
            aria-current={pathname === "/tags" ? "page" : undefined}
            className={`${linkBase} ${pathname === "/tags" ? linkActive : linkIdle}`}
          >
            Tags
          </Link>
        </li>
      </ul>
    </>
  );
}

function RecentMeetings({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  use(browser("Meetings are stored in localStorage."));
  const meetings = useMeetings();

  // Newest first, like the meeting list; ISO dates sort correctly as strings.
  const recent = [...meetings].sort((a, b) => b.date.localeCompare(a.date)).slice(0, RECENT_LIMIT);

  return (
    <div className="mt-6">
      <h2 className="px-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Recent meetings
      </h2>
      {recent.length === 0 ? (
        <p className="mt-2 px-3 text-sm text-zinc-500 dark:text-zinc-400">None yet.</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {recent.map((meeting) => {
            const href = `/meetings/${meeting.id}`;
            const active = pathname === href;
            return (
              <li key={meeting.id}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-md px-3 py-2 ${active ? linkActive : linkIdle}`}
                >
                  <span className="block truncate text-sm font-medium">{meeting.name}</span>
                  <span className="block text-xs font-normal text-zinc-500 dark:text-zinc-400">
                    {formatMeetingDate(meeting.date)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {meetings.length > RECENT_LIMIT && (
        <Link
          href="/"
          onClick={onNavigate}
          className="mt-2 block px-3 text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          View all {meetings.length} →
        </Link>
      )}
    </div>
  );
}
