"use client";

import { sortTags } from "@/lib/tags";
import { useTags } from "@/lib/use-tags";

/**
 * A meeting's tags as small labels, sorted by name. Skips IDs of tags that no longer exist,
 * and renders nothing if there are none, unless `emptyMessage` is given.
 */
export function MeetingTags({
  tagIds,
  className = "",
  emptyMessage,
}: {
  tagIds: string[];
  className?: string;
  emptyMessage?: string;
}) {
  const tags = sortTags(useTags().filter((tag) => tagIds.includes(tag.id)));

  if (tags.length === 0) {
    return emptyMessage ? (
      <p className={`text-sm text-zinc-500 dark:text-zinc-400 ${className}`}>{emptyMessage}</p>
    ) : null;
  }

  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`} aria-label="Tags">
      {tags.map((tag) => (
        <li
          key={tag.id}
          className="rounded-md border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300"
        >
          <span aria-hidden="true" className="text-zinc-400 dark:text-zinc-500">
            #
          </span>
          {tag.name}
        </li>
      ))}
    </ul>
  );
}
