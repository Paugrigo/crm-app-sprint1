"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import type { Meeting } from "@/lib/meetings";

type MeetingDraft = Omit<Meeting, "id">;

function todayAsDateInputValue(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-400 dark:focus:ring-zinc-800";

const labelClass = "mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300";

export function MeetingForm({ onSubmit }: { onSubmit: (draft: MeetingDraft) => void }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(todayAsDateInputValue);
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantInput, setParticipantInput] = useState("");
  const [notes, setNotes] = useState("");

  function addParticipant() {
    const participant = participantInput.trim();
    if (!participant) return;
    const alreadyAdded = participants.some(
      (p) => p.toLowerCase() === participant.toLowerCase(),
    );
    if (!alreadyAdded) setParticipants([...participants, participant]);
    setParticipantInput("");
  }

  function removeParticipant(participant: string) {
    setParticipants(participants.filter((p) => p !== participant));
  }

  function handleParticipantKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Enter adds the participant instead of submitting the whole form.
    if (event.key === "Enter") {
      event.preventDefault();
      addParticipant();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Include a participant that was typed but not yet added.
    const pending = participantInput.trim();
    const allParticipants =
      pending && !participants.some((p) => p.toLowerCase() === pending.toLowerCase())
        ? [...participants, pending]
        : participants;

    onSubmit({ name: name.trim(), date, participants: allParticipants, notes: notes.trim() });

    setName("");
    setDate(todayAsDateInputValue());
    setParticipants([]);
    setParticipantInput("");
    setNotes("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <label htmlFor="meeting-name" className={labelClass}>
            Meeting name
          </label>
          <input
            id="meeting-name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Quarterly review with Acme"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="meeting-date" className={labelClass}>
            Date
          </label>
          <input
            id="meeting-date"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="meeting-participant" className={labelClass}>
          Participants
        </label>
        <div className="flex gap-2">
          <input
            id="meeting-participant"
            type="text"
            value={participantInput}
            onChange={(e) => setParticipantInput(e.target.value)}
            onKeyDown={handleParticipantKeyDown}
            placeholder="Type a name and press Enter"
            className={inputClass}
          />
          <button
            type="button"
            onClick={addParticipant}
            className="shrink-0 rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Add
          </button>
        </div>
        {participants.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {participants.map((participant) => (
              <li
                key={participant}
                className="flex items-center gap-1 rounded-full bg-zinc-100 py-1 pl-3 pr-1 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
              >
                {participant}
                <button
                  type="button"
                  onClick={() => removeParticipant(participant)}
                  aria-label={`Remove ${participant}`}
                  className="rounded-full px-1.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label htmlFor="meeting-notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="meeting-notes"
          rows={5}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What was discussed, decisions, next steps…"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        Log meeting
      </button>
    </form>
  );
}
