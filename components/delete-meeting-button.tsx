"use client";

import type { Meeting } from "@/lib/meetings";
import { DeleteButton } from "./delete-button";

/** Trash-icon button that asks for confirmation before calling onDelete. */
export function DeleteMeetingButton({
  meeting,
  onDelete,
}: {
  meeting: Meeting;
  onDelete: (id: string) => void;
}) {
  return (
    <DeleteButton
      label={`Delete ${meeting.name}`}
      title="Delete meeting"
      confirmMessage={`Delete "${meeting.name}"? This can't be undone.`}
      onConfirm={() => onDelete(meeting.id)}
    />
  );
}
