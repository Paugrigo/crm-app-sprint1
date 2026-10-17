// Meeting persistence. All meetings are stored as one JSON array in localStorage.
// Browser-only: call these from Client Components after mount, never during prerendering.

export type Meeting = {
  id: string;
  name: string;
  /** Calendar date as YYYY-MM-DD (the value of <input type="date">). */
  date: string;
  participants: string[];
  notes: string;
  /** IDs of the meeting's tags (see lib/tags.ts). May include IDs of tags that no longer exist. */
  tagIds: string[];
};

const STORAGE_KEY = "crm.meetings.v1";

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

/**
 * Returns the value as a Meeting, or null if it isn't one. Meetings saved before tags
 * existed have no tagIds; they get an empty list, so no storage migration is needed.
 */
export function toMeeting(value: unknown): Meeting | null {
  if (typeof value !== "object" || value === null) return null;
  const m = value as Record<string, unknown>;
  if (
    typeof m.id !== "string" ||
    typeof m.name !== "string" ||
    typeof m.date !== "string" ||
    !isStringArray(m.participants) ||
    typeof m.notes !== "string"
  ) {
    return null;
  }
  return {
    id: m.id,
    name: m.name,
    date: m.date,
    participants: m.participants,
    notes: m.notes,
    tagIds: isStringArray(m.tagIds) ? m.tagIds : [],
  };
}

/** Valid meetings from a parsed JSON array, skipping anything that isn't one. */
export function toMeetings(values: unknown[]): Meeting[] {
  return values.map(toMeeting).filter((m): m is Meeting => m !== null);
}

function parseMeetings(raw: string | null): Meeting[] {
  if (raw === null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? toMeetings(parsed) : [];
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
