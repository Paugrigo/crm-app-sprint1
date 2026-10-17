// Meeting persistence. All meetings are stored as one JSON array in localStorage.
// Browser-only: call these from Client Components after mount, never during prerendering.

export type Meeting = {
  id: string;
  name: string;
  /** Calendar date as YYYY-MM-DD (the value of <input type="date">). */
  date: string;
  participants: string[];
  notes: string;
};

const STORAGE_KEY = "crm.meetings.v1";

function isMeeting(value: unknown): value is Meeting {
  if (typeof value !== "object" || value === null) return false;
  const m = value as Record<string, unknown>;
  return (
    typeof m.id === "string" &&
    typeof m.name === "string" &&
    typeof m.date === "string" &&
    Array.isArray(m.participants) &&
    m.participants.every((p) => typeof p === "string") &&
    typeof m.notes === "string"
  );
}

function parseMeetings(raw: string | null): Meeting[] {
  if (raw === null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isMeeting) : [];
  } catch {
    return [];
  }
}

// localStorage is the single source of truth. Components read it through useMeetings()
// (useSyncExternalStore), so every mounted page re-renders when meetings change, including
// pages Next.js keeps hidden in the background between navigations.

const listeners = new Set<() => void>();
const NO_MEETINGS: Meeting[] = [];
let cachedRaw: string | null = null;
let cachedMeetings: Meeting[] = NO_MEETINGS;

/**
 * Returns saved meetings, or an empty list if storage is empty, unavailable, or corrupt.
 * Returns the same array until storage changes, as useSyncExternalStore requires.
 */
export function loadMeetings(): Meeting[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedMeetings = parseMeetings(raw);
  }
  return cachedMeetings;
}

/** Server snapshot for useSyncExternalStore; meetings only exist in the browser. */
export function loadMeetingsOnServer(): Meeting[] {
  return NO_MEETINGS;
}

/** Calls listener whenever meetings change in this tab or another tab. */
export function subscribeToMeetings(listener: () => void): () => void {
  function handleStorage(event: StorageEvent) {
    // key is null when another tab cleared all storage.
    if (event.key === STORAGE_KEY || event.key === null) listener();
  }
  listeners.add(listener);
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

/** Saves the full list of meetings. Returns false if storage is unavailable or full. */
export function saveMeetings(meetings: Meeting[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
  } catch {
    return false;
  }
  listeners.forEach((listener) => listener());
  return true;
}

// Backups: a JSON file the user downloads and can import later, e.g. in another browser.

const BACKUP_FORMAT = "crm-meetings-backup";

/** The contents of a backup file for these meetings. */
export function meetingsToBackup(meetings: Meeting[]): string {
  return JSON.stringify(
    { format: BACKUP_FORMAT, version: 1, exportedAt: new Date().toISOString(), meetings },
    null,
    2,
  );
}

/**
 * Reads meetings from a backup file. Also accepts a bare array of meetings (the raw
 * localStorage format). Returns null if the file isn't a backup; skips invalid entries.
 */
export function meetingsFromBackup(text: string): Meeting[] | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  const list =
    typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>).meetings
      : parsed;
  return Array.isArray(list) ? list.filter(isMeeting) : null;
}

/**
 * Asks the browser to exempt this site's storage from automatic eviction.
 * Firefox may prompt the user; Chromium and Safari decide silently.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (!navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
