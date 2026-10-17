"use client";

import { use, useLayoutEffect, useRef, useState, type ChangeEvent } from "react";
import { browser } from "react-dom";
import {
  meetingsFromBackup,
  meetingsToBackup,
  saveMeetings,
  type Meeting,
} from "@/lib/meetings";
import { saveThemePreference, type ThemePreference } from "@/lib/theme";
import { useMeetings } from "@/lib/use-meetings";
import { useThemePreference } from "@/lib/use-theme";

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

type Status = { kind: "success" | "error"; text: string };

const sectionClass =
  "rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900";
const headingClass = "text-lg font-semibold text-zinc-900 dark:text-zinc-100";
const descriptionClass = "mt-1 text-sm text-zinc-500 dark:text-zinc-400";
const secondaryButtonClass =
  "rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800";

// Browser-only: settings and meetings live in localStorage. Render inside a <Suspense> boundary.
export function Settings() {
  use(browser("Settings are stored in localStorage."));

  return (
    <div className="space-y-6">
      <AppearanceSettings />
      <BackupSettings />
    </div>
  );
}

function AppearanceSettings() {
  const theme = useThemePreference();
  const [saveFailed, setSaveFailed] = useState(false);

  return (
    <section className={sectionClass}>
      <h2 className={headingClass}>Appearance</h2>
      <p className={descriptionClass}>
        System matches your device&apos;s light or dark setting.
      </p>
      <fieldset className="mt-4">
        <legend className="sr-only">Theme</legend>
        <div className="inline-flex rounded-lg border border-zinc-300 p-1 dark:border-zinc-700">
          {THEME_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 has-checked:bg-zinc-900 has-checked:text-white has-focus-visible:ring-2 has-focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:text-zinc-100 dark:has-checked:bg-zinc-100 dark:has-checked:text-zinc-900"
            >
              <input
                type="radio"
                name="theme"
                value={option.value}
                checked={theme === option.value}
                onChange={() => setSaveFailed(!saveThemePreference(option.value))}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      {saveFailed && (
        <p role="alert" className="mt-3 text-sm text-red-700 dark:text-red-300">
          Couldn&apos;t save your choice: browser storage is unavailable. It applies until you
          reload.
        </p>
      )}
    </section>
  );
}

function BackupSettings() {
  const meetings = useMeetings();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status | null>(null);

  // Next.js keeps this page alive (hidden) after navigating away; don't show an old
  // result message when coming back.
  useLayoutEffect(() => () => setStatus(null), []);

  function exportMeetings() {
    const blob = new Blob([meetingsToBackup(meetings)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `meetings-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus({
      kind: "success",
      text: `Downloaded a backup of ${meetings.length} ${meetings.length === 1 ? "meeting" : "meetings"}.`,
    });
  }

  async function importMeetings(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Clear the input so choosing the same file again still triggers a change.
    event.target.value = "";
    if (!file) return;

    const imported = meetingsFromBackup(await file.text());
    if (imported === null) {
      setStatus({ kind: "error", text: `"${file.name}" isn't a meetings backup file.` });
      return;
    }
    if (imported.length === 0) {
      setStatus({ kind: "error", text: `"${file.name}" doesn't contain any meetings.` });
      return;
    }

    const existingIds = new Set(meetings.map((m) => m.id));
    const updatedCount = imported.filter((m) => existingIds.has(m.id)).length;
    const newCount = imported.length - updatedCount;
    const question =
      `Import ${imported.length} ${imported.length === 1 ? "meeting" : "meetings"}?` +
      (updatedCount > 0
        ? ` ${updatedCount} already ${updatedCount === 1 ? "exists" : "exist"} here and will be replaced by the version in the file.`
        : "") +
      " Your other meetings are kept.";
    if (!window.confirm(question)) return;

    // Imported meetings replace ones with the same ID; everything else is kept.
    const importedById = new Map(imported.map((m) => [m.id, m]));
    const merged: Meeting[] = [
      ...meetings.map((m) => importedById.get(m.id) ?? m),
      ...imported.filter((m) => !existingIds.has(m.id)),
    ];
    if (saveMeetings(merged)) {
      setStatus({
        kind: "success",
        text: `Imported ${imported.length} ${imported.length === 1 ? "meeting" : "meetings"} (${newCount} new, ${updatedCount} updated).`,
      });
    } else {
      setStatus({
        kind: "error",
        text: "Couldn't import: browser storage is unavailable or full.",
      });
    }
  }

  return (
    <section className={sectionClass}>
      <h2 className={headingClass}>Backup</h2>
      <p className={descriptionClass}>
        Meetings are saved only in this browser. Download a backup to keep them safe or move
        them to another browser or device, then import it there.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={exportMeetings}
          disabled={meetings.length === 0}
          className={secondaryButtonClass}
        >
          Export meetings ({meetings.length})
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={secondaryButtonClass}
        >
          Import from file…
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={importMeetings}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
      {status && (
        <p
          role={status.kind === "error" ? "alert" : "status"}
          className={`mt-3 text-sm ${
            status.kind === "error"
              ? "text-red-700 dark:text-red-300"
              : "text-green-700 dark:text-green-400"
          }`}
        >
          {status.text}
        </p>
      )}
    </section>
  );
}
