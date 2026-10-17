"use client";

import Link from "next/link";
import { use, type ReactNode } from "react";
import { browser } from "react-dom";
import { formatMeetingDate } from "@/lib/format-date";
import { computeStatistics, daysBetween, localToday, type PersonStats } from "@/lib/statistics";
import { useMeetings } from "@/lib/use-meetings";
import { useTags } from "@/lib/use-tags";

const PEOPLE_SHOWN = 5;

const card = "rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-950";
const heading = "mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100";
const muted = "text-sm text-zinc-500 dark:text-zinc-400";
const bar = "rounded-sm bg-zinc-800 dark:bg-zinc-300";

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

// Browser-only: meetings and tags live in localStorage. Render inside a <Suspense> boundary.
export function Statistics() {
  use(browser("Meetings are stored in localStorage."));

  const meetings = useMeetings();
  const tags = useTags();
  const today = localToday();
  const stats = computeStatistics(meetings, tags, today);

  const upcomingNote =
    stats.upcoming > 0 ? (
      <p className={muted}>
        {plural(stats.upcoming, "meeting")} dated after today{" "}
        {stats.upcoming === 1 ? "isn't" : "aren't"} counted.
      </p>
    ) : null;

  if (stats.total === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
          <p className="font-medium text-zinc-900 dark:text-zinc-100">No statistics yet</p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Statistics appear once you&apos;ve logged a meeting dated today or earlier.
          </p>
          <Link
            href="/meetings/new"
            className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Log a meeting
          </Link>
        </div>
        {upcomingNote}
      </div>
    );
  }

  const monthChange = stats.thisMonth - stats.lastMonth;

  return (
    <div className="space-y-8">
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Meetings" value={stats.total} />
        <StatCard
          label="This month"
          value={stats.thisMonth}
          detail={
            monthChange === 0
              ? "Same as last month"
              : `${monthChange > 0 ? "+" : "−"}${Math.abs(monthChange)} vs last month`
          }
        />
        <StatCard label="People met" value={stats.people} />
        <StatCard
          label="Avg. participants"
          value={stats.averageParticipants.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          detail="per meeting"
        />
      </dl>
      {upcomingNote}

      <section className={card}>
        <h2 className={heading}>Meetings per month</h2>
        <MonthChart months={stats.months} />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className={card}>
          <h2 className={heading}>Who you meet most</h2>
          <PeopleList
            people={stats.topPeople.slice(0, PEOPLE_SHOWN)}
            describe={(p) => plural(p.meetings, "meeting")}
            detail={(p) => `Last met ${formatMeetingDate(p.lastMet)}`}
          />
        </section>
        <section className={card}>
          <h2 className={heading}>Not met in a while</h2>
          <PeopleList
            people={stats.longestSinceMet.slice(0, PEOPLE_SHOWN)}
            describe={(p) => timeSince(p.lastMet, today)}
            detail={(p) => `Last met ${formatMeetingDate(p.lastMet)}`}
          />
        </section>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className={card}>
          <h2 className={heading}>Meetings by tag</h2>
          {stats.tags.length === 0 ? (
            <p className={muted}>No tags yet.</p>
          ) : (
            <BarList
              items={stats.tags.map(({ tag, count }) => ({
                key: tag?.id ?? "untagged",
                label: tag ? (
                  <>
                    <span aria-hidden="true" className="text-zinc-400 dark:text-zinc-500">
                      #
                    </span>
                    {tag.name}
                  </>
                ) : (
                  <span className="italic">Untagged</span>
                ),
                count,
              }))}
            />
          )}
          {stats.tags.some((t) => t.tag) && (
            <p className={`mt-4 ${muted}`}>A meeting with several tags counts once for each.</p>
          )}
        </section>
        <section className={card}>
          <h2 className={heading}>Day of the week</h2>
          <BarList
            items={stats.weekdays.map(({ weekday, count }) => ({
              key: String(weekday),
              label: weekdayName(weekday),
              count,
            }))}
          />
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, detail }: { label: string; value: ReactNode; detail?: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <dt className={muted}>{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
        {value}
      </dd>
      {detail && <dd className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{detail}</dd>}
    </div>
  );
}

function MonthChart({ months }: { months: { month: string; count: number }[] }) {
  const max = Math.max(1, ...months.map((m) => m.count));
  return (
    <ol className="flex h-48 items-end gap-1 sm:gap-2">
      {months.map(({ month, count }, i) => {
        const date = new Date(Number(month.slice(0, 4)), Number(month.slice(5)) - 1, 1);
        const short = date.toLocaleDateString(undefined, { month: "short" });
        // Show the year under the first bar and under each January.
        const showYear = i === 0 || date.getMonth() === 0;
        return (
          <li key={month} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
            <span className="sr-only">
              {date.toLocaleDateString(undefined, { month: "long", year: "numeric" })}:{" "}
              {plural(count, "meeting")}
            </span>
            {/* The top padding leaves room for the count above the tallest bar. */}
            <div aria-hidden="true" className="flex min-h-0 w-full flex-1 items-end justify-center pt-5">
              <div
                className={`relative w-full max-w-10 ${count > 0 ? bar : "bg-zinc-200 dark:bg-zinc-800"}`}
                style={{ height: count > 0 ? `${(count / max) * 100}%` : "2px" }}
              >
                {count > 0 && (
                  <span className="absolute inset-x-0 -top-5 text-center text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
                    {count}
                  </span>
                )}
              </div>
            </div>
            <span aria-hidden="true" className="mt-2 h-8 text-center text-xs leading-4 text-zinc-500 dark:text-zinc-400">
              {short}
              {showYear && <span className="block">{date.getFullYear()}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function BarList({ items }: { items: { key: string; label: ReactNode; count: number }[] }) {
  const max = Math.max(1, ...items.map((item) => item.count));
  return (
    <ul className="space-y-3">
      {items.map(({ key, label, count }) => (
        <li key={key}>
          <div className="mb-1 flex items-baseline justify-between gap-4 text-sm">
            <span className="min-w-0 truncate font-medium text-zinc-800 dark:text-zinc-200">
              {label}
            </span>
            <span className="shrink-0 tabular-nums text-zinc-600 dark:text-zinc-400">{count}</span>
          </div>
          <div aria-hidden="true" className="h-2 rounded-sm bg-zinc-200 dark:bg-zinc-800">
            <div className={`h-full ${bar}`} style={{ width: `${(count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function PeopleList({
  people,
  describe,
  detail,
}: {
  people: PersonStats[];
  describe: (person: PersonStats) => string;
  detail: (person: PersonStats) => string;
}) {
  if (people.length === 0) {
    return <p className={muted}>No participants recorded yet.</p>;
  }
  return (
    <ol className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {people.map((person) => (
        <li
          key={person.name.toLowerCase()}
          className="flex items-baseline justify-between gap-4 py-2 first:pt-0 last:pb-0"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {person.name}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{detail(person)}</p>
          </div>
          <span className="shrink-0 text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
            {describe(person)}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** E.g. "today", "3 days ago", "5 weeks ago", "4 months ago", "2 years ago". */
function timeSince(date: string, today: string): string {
  const days = daysBetween(date, today);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 730) return `${Math.floor(days / 30.44)} months ago`;
  return `${Math.floor(days / 365.25)} years ago`;
}

/** Weekday name for 0 = Monday … 6 = Sunday. */
function weekdayName(weekday: number): string {
  // Jan 1, 2024 was a Monday.
  return new Date(2024, 0, 1 + weekday).toLocaleDateString(undefined, { weekday: "long" });
}
