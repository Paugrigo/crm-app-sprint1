// Backups: a JSON file of all meetings and tags that the user downloads and can import later,
// e.g. in another browser. Pure functions; saving is up to the caller.

import { toMeetings, type Meeting } from "./meetings";
import { isTag, sameTagName, type Tag } from "./tags";

const BACKUP_FORMAT = "crm-meetings-backup";

export type BackupData = { meetings: Meeting[]; tags: Tag[] };

/** The contents of a backup file. Version 2 added tags. */
export function toBackup({ meetings, tags }: BackupData): string {
  return JSON.stringify(
    { format: BACKUP_FORMAT, version: 2, exportedAt: new Date().toISOString(), meetings, tags },
    null,
    2,
  );
}

/**
 * Reads a backup file. Accepts version 1 files (no tags) and a bare array of meetings (the
 * raw localStorage format). Returns null if the file isn't a backup; skips invalid entries.
 */
export function fromBackup(text: string): BackupData | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (Array.isArray(parsed)) return { meetings: toMeetings(parsed), tags: [] };
  if (typeof parsed !== "object" || parsed === null) return null;

  const { meetings, tags } = parsed as Record<string, unknown>;
  if (!Array.isArray(meetings)) return null;
  return {
    meetings: toMeetings(meetings),
    tags: Array.isArray(tags) ? tags.filter(isTag) : [],
  };
}

export type MergeResult = BackupData & {
  newMeetings: number;
  updatedMeetings: number;
  newTags: number;
};

/**
 * Merges imported data into the current data. Imported meetings and tags replace ones with
 * the same ID; everything else is kept. An imported tag whose name matches an existing tag
 * (but with a different ID) is treated as that tag, so importing never creates duplicates.
 */
export function mergeBackup(current: BackupData, imported: BackupData): MergeResult {
  // Map each imported tag ID to the ID it will have after merging.
  const tagIdMap = new Map<string, string>();
  const tagsById = new Map(current.tags.map((t) => [t.id, t]));
  let newTags = 0;
  for (const tag of imported.tags) {
    if (tagsById.has(tag.id)) {
      tagsById.set(tag.id, tag);
      tagIdMap.set(tag.id, tag.id);
      continue;
    }
    const sameName = [...tagsById.values()].find((t) => sameTagName(t.name, tag.name));
    if (sameName) {
      tagIdMap.set(tag.id, sameName.id);
    } else {
      tagsById.set(tag.id, tag);
      tagIdMap.set(tag.id, tag.id);
      newTags++;
    }
  }

  const importedMeetings = imported.meetings.map((m) => ({
    ...m,
    tagIds: [...new Set(m.tagIds.map((id) => tagIdMap.get(id) ?? id))],
  }));
  const currentIds = new Set(current.meetings.map((m) => m.id));
  const importedById = new Map(importedMeetings.map((m) => [m.id, m]));
  const updatedMeetings = importedMeetings.filter((m) => currentIds.has(m.id)).length;

  return {
    meetings: [
      ...current.meetings.map((m) => importedById.get(m.id) ?? m),
      ...importedMeetings.filter((m) => !currentIds.has(m.id)),
    ],
    tags: [...tagsById.values()],
    newMeetings: importedMeetings.length - updatedMeetings,
    updatedMeetings,
    newTags,
  };
}
