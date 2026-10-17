"use client";

import { use, useLayoutEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { browser } from "react-dom";
import { saveMeetings } from "@/lib/meetings";
import { saveTags, sameTagName, sortTags, TAG_NAME_MAX_LENGTH, type Tag } from "@/lib/tags";
import { useMeetings } from "@/lib/use-meetings";
import { useTags } from "@/lib/use-tags";
import { DeleteButton } from "./delete-button";

type Status = { kind: "success" | "error"; text: string };

// Browser-only: tags and meetings live in localStorage. Render inside a <Suspense> boundary.
export function TagsManager() {
  use(browser("Tags are stored in localStorage."));

  const tags = useTags();
  const meetings = useMeetings();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Next.js keeps this page alive (hidden) after navigating away; don't show an old
  // result message or a half-finished rename when coming back.
  useLayoutEffect(
    () => () => {
      setStatus(null);
      setEditingId(null);
    },
    [],
  );

  function createTag(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const existing = tags.find((tag) => sameTagName(tag.name, trimmed));
    if (existing) {
      setStatus({ kind: "error", text: `A tag named "${existing.name}" already exists.` });
      return;
    }

    if (saveTags([...tags, { id: crypto.randomUUID(), name: trimmed }])) {
      setName("");
      setStatus({ kind: "success", text: `Created tag "${trimmed}".` });
    } else {
      setStatus({ kind: "error", text: "Couldn't save: browser storage is unavailable or full." });
    }
  }

  /** Renames the tag; returns an error message, or null on success. */
  function renameTag(tag: Tag, newName: string): string | null {
    const trimmed = newName.trim();
    if (!trimmed) return "Tag name can't be empty.";
    const existing = tags.find((t) => t.id !== tag.id && sameTagName(t.name, trimmed));
    if (existing) return `A tag named "${existing.name}" already exists.`;

    // Meetings refer to tags by ID, so they pick up the new name automatically.
    if (trimmed !== tag.name) {
      const renamed = tags.map((t) => (t.id === tag.id ? { ...t, name: trimmed } : t));
      if (!saveTags(renamed)) return "Couldn't save: browser storage is unavailable or full.";
      setStatus({ kind: "success", text: `Renamed "${tag.name}" to "${trimmed}".` });
    }
    setEditingId(null);
    return null;
  }

  function deleteTag(tag: Tag) {
    // Remove the tag from meetings first, so a failed save never leaves meetings pointing at
    // a deleted tag.
    const usedBy = meetings.filter((meeting) => meeting.tagIds.includes(tag.id));
    const meetingsSaved =
      usedBy.length === 0 ||
      saveMeetings(
        meetings.map((meeting) =>
          meeting.tagIds.includes(tag.id)
            ? { ...meeting, tagIds: meeting.tagIds.filter((id) => id !== tag.id) }
            : meeting,
        ),
      );
    if (meetingsSaved && saveTags(tags.filter((t) => t.id !== tag.id))) {
      setStatus({ kind: "success", text: `Deleted tag "${tag.name}".` });
    } else {
      setStatus({ kind: "error", text: "Couldn't delete: browser storage is unavailable." });
    }
  }

  function meetingCount(tagId: string): number {
    return meetings.filter((meeting) => meeting.tagIds.includes(tagId)).length;
  }

  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Create a tag
        </h2>
        <form onSubmit={createTag}>
          <label
            htmlFor="tag-name"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            Tag name
          </label>
          <div className="flex gap-2">
            <input
              id="tag-name"
              type="text"
              required
              maxLength={TAG_NAME_MAX_LENGTH}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setStatus(null);
              }}
              placeholder="e.g. Sales, Follow-up, Acme"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-800"
            />
            <button
              type="submit"
              disabled={!name.trim()}
              className="shrink-0 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 dark:disabled:hover:bg-zinc-100"
            >
              Create tag
            </button>
          </div>
        </form>
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

      <section>
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          All tags <span className="font-normal text-zinc-500">({tags.length})</span>
        </h2>
        {tags.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
            <p className="font-medium text-zinc-900 dark:text-zinc-100">No tags yet</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Create your first tag above, then add it to meetings when you log or edit them.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {sortTags(tags).map((tag) => {
              const count = meetingCount(tag.id);
              if (tag.id === editingId) {
                return (
                  <li key={tag.id} className="px-4 py-3">
                    <RenameTagForm
                      tag={tag}
                      onRename={(newName) => renameTag(tag, newName)}
                      onCancel={() => setEditingId(null)}
                    />
                  </li>
                );
              }
              return (
                <li key={tag.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="min-w-0 break-words font-medium text-zinc-900 dark:text-zinc-100">
                    <span aria-hidden="true" className="text-zinc-400 dark:text-zinc-500">
                      #
                    </span>
                    {tag.name}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="mr-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {count === 0
                        ? "Not used yet"
                        : `${count} ${count === 1 ? "meeting" : "meetings"}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(tag.id);
                        setStatus(null);
                      }}
                      aria-label={`Rename tag ${tag.name}`}
                      title="Rename tag"
                      className="flex items-center rounded-md border border-zinc-300 p-1.5 text-zinc-700 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:focus:ring-zinc-800"
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
                        <path d="M13.5 3.5l3 3L7 16H4v-3l9.5-9.5ZM11.5 5.5l3 3" />
                      </svg>
                    </button>
                    <DeleteButton
                      label={`Delete tag ${tag.name}`}
                      title="Delete tag"
                      confirmMessage={
                        count === 0
                          ? `Delete the tag "${tag.name}"?`
                          : `Delete the tag "${tag.name}"? It will be removed from ${count} ${count === 1 ? "meeting" : "meetings"}. The meetings themselves are kept.`
                      }
                      onConfirm={() => deleteTag(tag)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

/** Inline form that replaces a tag's row while renaming it. Enter saves, Escape cancels. */
function RenameTagForm({
  tag,
  onRename,
  onCancel,
}: {
  tag: Tag;
  onRename: (name: string) => string | null;
  onCancel: () => void;
}) {
  const [name, setName] = useState(tag.name);
  const [error, setError] = useState<string | null>(null);
  const inputId = `rename-tag-${tag.id}`;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(onRename(name));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") onCancel();
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor={inputId} className="sr-only">
        New name for {tag.name}
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id={inputId}
          type="text"
          required
          autoFocus
          maxLength={TAG_NAME_MAX_LENGTH}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          aria-invalid={error !== null}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className="min-w-0 flex-1 rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-800"
        />
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
    </form>
  );
}
