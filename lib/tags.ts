// Tag persistence. All tags are stored as one JSON array in localStorage; meetings refer to
// tags by ID (Meeting.tagIds). Same pattern as lib/meetings.ts.
// Browser-only: call these from Client Components after mount, never during prerendering.

export type Tag = {
  id: string;
  name: string;
};

const STORAGE_KEY = "crm.tags.v1";

export const TAG_NAME_MAX_LENGTH = 40;

export function isTag(value: unknown): value is Tag {
  if (typeof value !== "object" || value === null) return false;
  const t = value as Record<string, unknown>;
  return typeof t.id === "string" && typeof t.name === "string";
}

function parseTags(raw: string | null): Tag[] {
  if (raw === null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isTag) : [];
  } catch {
    return [];
  }
}

/** Tag names are unique regardless of case and surrounding spaces. */
export function sameTagName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** Tags sorted by name, for display. */
export function sortTags(tags: Tag[]): Tag[] {
  return [...tags].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
}

// localStorage is the single source of truth; components read it through useTags().

const listeners = new Set<() => void>();
const NO_TAGS: Tag[] = [];
let cachedRaw: string | null = null;
let cachedTags: Tag[] = NO_TAGS;

/** Saved tags. Returns the same array until storage changes, as useSyncExternalStore requires. */
export function loadTags(): Tag[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedTags = parseTags(raw);
  }
  return cachedTags;
}

/** Server snapshot for useSyncExternalStore; tags only exist in the browser. */
export function loadTagsOnServer(): Tag[] {
  return NO_TAGS;
}

/** Calls listener whenever tags change in this tab or another tab. */
export function subscribeToTags(listener: () => void): () => void {
  function handleStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  }
  listeners.add(listener);
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

/** Saves the full list of tags. Returns false if storage is unavailable or full. */
export function saveTags(tags: Tag[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
  } catch {
    return false;
  }
  listeners.forEach((listener) => listener());
  return true;
}
