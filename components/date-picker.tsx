"use client";

import { useEffect, useRef, useState } from "react";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function toDateValue(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Parses "YYYY-MM-DD" as a local date; returns null for empty or invalid values. */
function parseDateValue(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Days to show for a month, Monday-first, padded with nulls before day 1. */
function monthGrid(year: number, month: number): (Date | null)[] {
  const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return [
    ...Array<null>(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
}

/**
 * Date input with a themed calendar popover. The browser's own picker popup
 * can't be styled (it stays white in Safari's dark mode), so this draws its own.
 */
export function DatePicker({
  id,
  value,
  onChange,
  required,
  className,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className: string;
}) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const date = parseDateValue(value) ?? new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function toggle() {
    if (!open) {
      // Open on the selected month (or today's), not wherever it was left.
      const date = parseDateValue(value) ?? new Date();
      setViewMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
    setOpen(!open);
  }

  function shiftMonth(delta: number) {
    setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + delta, 1));
  }

  function select(date: Date) {
    onChange(toDateValue(date));
    setOpen(false);
    triggerRef.current?.focus();
  }

  const todayValue = toDateValue(new Date());
  const monthLabel = viewMonth.toLocaleDateString("en", { month: "long", year: "numeric" });

  const navButtonClass =
    "rounded-sm p-1.5 text-muted hover:bg-surface-2 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60";

  return (
    <div ref={containerRef} className="relative">
      {/* The browser's own picker icon is hidden; the button below replaces it. */}
      <input
        id={id}
        type="date"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${className} pr-10 [&::-webkit-calendar-picker-indicator]:hidden`}
      />
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-label="Choose date from calendar"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Choose date"
        className="absolute inset-y-0 right-0 flex items-center rounded-r-sm px-2.5 text-muted hover:text-accent-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
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
          <path d="M4.5 4.5h11a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1ZM3.5 8.5h13M7 3v3M13 3v3" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose date"
          className="absolute right-0 top-full z-20 mt-1 w-72 rounded-md border border-line-strong bg-surface p-3 shadow-xl shadow-black/10 dark:shadow-black/60"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
              className={navButtonClass}
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="size-4">
                <path d="M12.5 5l-5 5 5 5" />
              </svg>
            </button>
            <span className="font-mono text-xs font-medium uppercase tracking-wider text-fg" aria-live="polite">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
              className={navButtonClass}
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="size-4">
                <path d="M7.5 5l5 5-5 5" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((weekday) => (
              <span key={weekday} className="py-1 font-mono text-[11px] uppercase text-faint">
                {weekday}
              </span>
            ))}
            {monthGrid(viewMonth.getFullYear(), viewMonth.getMonth()).map((date, index) => {
              if (!date) return <span key={`blank-${index}`} />;
              const dateValue = toDateValue(date);
              const isSelected = dateValue === value;
              const isToday = dateValue === todayValue;
              return (
                <button
                  key={dateValue}
                  type="button"
                  onClick={() => select(date)}
                  aria-label={date.toLocaleDateString("en", { dateStyle: "full" })}
                  aria-pressed={isSelected}
                  className={`rounded-sm py-1.5 font-mono text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                    isSelected
                      ? "bg-accent font-semibold text-on-accent"
                      : `text-fg hover:bg-surface-2 ${isToday ? "ring-1 ring-inset ring-accent" : ""}`
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex justify-end border-t border-line pt-2">
            <button
              type="button"
              onClick={() => select(new Date())}
              className="rounded-sm px-2 py-1 font-mono text-xs uppercase tracking-wider text-accent-fg hover:bg-accent-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
