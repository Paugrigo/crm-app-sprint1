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
 * the same ID; everything else is kept. An imported tag whose name matches another tag (one
 * with a different ID) is merged into that tag, so importing never creates duplicate names.
 * That includes an existing tag that the backup renames to another tag's name: it is merged
 * too, and its meetings, here or in the backup, move to the other tag.
 */
export function mergeBackup(current: BackupData, imported: BackupData): MergeResult {
  // Tag IDs merged into another tag, mapped to that tag's ID. Other IDs stay as they are.
  const mergedTagIds = new Map<string, string>();
  function resolveTagId(id: string): string {
    // Follow chains: a tag can be merged into one that is itself merged later.
    let resolved = id;
    let next: string | undefined;
    while ((next = mergedTagIds.get(resolved)) !== undefined) resolved = next;
    return resolved;
  }

  const tagsById = new Map(current.tags.map((t) => [t.id, t]));
  let newTags = 0;
  for (const tag of imported.tags) {
    const sameName = [...tagsById.values()].find(
      (t) => t.id !== tag.id && sameTagName(t.name, tag.name),
    );
    if (sameName) {
      mergedTagIds.set(tag.id, sameName.id);
      tagsById.delete(tag.id);
    } else {
      if (!tagsById.has(tag.id)) newTags++;
      tagsById.set(tag.id, tag);
    }
  }

  function withMergedTags(meeting: Meeting): Meeting {
    return { ...meeting, tagIds: [...new Set(meeting.tagIds.map(resolveTagId))] };
  }

  const importedMeetings = imported.meetings.map(withMergedTags);
  const currentIds = new Set(current.meetings.map((m) => m.id));
  const importedById = new Map(importedMeetings.map((m) => [m.id, m]));
  const updatedMeetings = importedMeetings.filter((m) => currentIds.has(m.id)).length;

  return {
    meetings: [
      ...current.meetings.map((m) => importedById.get(m.id) ?? withMergedTags(m)),
      ...importedMeetings.filter((m) => !currentIds.has(m.id)),
    ],
    tags: [...tagsById.values()],
    newMeetings: importedMeetings.length - updatedMeetings,
    updatedMeetings,
    newTags,
  };
}
