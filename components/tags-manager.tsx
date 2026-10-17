"use client";

import { use, useLayoutEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { browser } from "react-dom";
import { saveMeetings } from "@/lib/meetings";
import { saveTags, sameTagName, sortTags, TAG_NAME_MAX_LENGTH, type Tag } from "@/lib/tags";
import { useMeetings } from "@/lib/use-meetings";
import { useTags } from "@/lib/use-tags";
import { DeleteButton } from "./delete-button";
import {
  buttonPrimary,
  buttonSecondary,
  emptyState,
  iconButton,
  input,
  label,
  panel,
  panelHeader,
} from "./ui";

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
    <div className="space-y-6">
      <section className={panel}>
        <div className={panelHeader}>
          <h2 className={label}>Create a tag</h2>
        </div>
        <form onSubmit={createTag} className="p-4">
          <label htmlFor="tag-name" className={`mb-1.5 block ${label}`}>
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
              className={input}
            />
            <button
              type="submit"
              disabled={!name.trim()}
              className={`${buttonPrimary} shrink-0 px-4`}
            >
              Create tag
            </button>
          </div>
          {status && (
            <p
              role={status.kind === "error" ? "alert" : "status"}
              className={`mt-3 font-mono text-xs ${
                status.kind === "error" ? "text-danger" : "text-up"
              }`}
            >
              {status.kind === "error" ? "✕ " : "✓ "}
              {status.text}
            </p>
          )}
        </form>
      </section>

      <section className={`${panel} overflow-hidden`}>
        <div className={panelHeader}>
          <h2 className={label}>All tags</h2>
          <span className="font-mono text-xs text-muted">{tags.length} total</span>
        </div>
        {tags.length === 0 ? (
          <div className={`${emptyState} m-4`}>
            <p className={label}>No data</p>
            <p className="mt-2 font-medium text-fg">No tags yet</p>
            <p className="mt-1 text-sm text-muted">
              Create your first tag above, then add it to meetings when you log or edit them.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {sortTags(tags).map((tag) => {
              const count = meetingCount(tag.id);
              if (tag.id === editingId) {
                return (
                  <li key={tag.id} className="bg-surface-2 px-4 py-2.5">
                    <RenameTagForm
                      tag={tag}
                      onRename={(newName) => renameTag(tag, newName)}
                      onCancel={() => setEditingId(null)}
                    />
                  </li>
                );
              }
              return (
                <li
                  key={tag.id}
                  className="flex items-center justify-between gap-4 px-4 py-2 transition-colors hover:bg-surface-2"
                >
                  <span className="min-w-0 break-words font-mono text-sm text-fg">
                    <span aria-hidden="true" className="text-accent-fg">
                      #
                    </span>
                    {tag.name}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="mr-2 font-mono text-xs text-muted">
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
                      className={iconButton}
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
          className={`${input} min-w-0 flex-1 py-1.5 font-mono`}
        />
        <button type="submit" className={buttonPrimary}>
          Save
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={buttonSecondary}
        >
          Cancel
        </button>
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="mt-2 font-mono text-xs text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
