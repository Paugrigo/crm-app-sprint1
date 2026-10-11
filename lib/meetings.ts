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

/** Returns saved meetings, or an empty list if storage is empty, unavailable, or corrupt. */
export function loadMeetings(): Meeting[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isMeeting) : [];
  } catch {
    return [];
  }
}

/** Saves the full list of meetings. Returns false if storage is unavailable or full. */
export function saveMeetings(meetings: Meeting[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings));
    return true;
  } catch {
    return false;
  }
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
