<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CRM App

A simple CRM tool for logging meetings.

## Features

Each meeting has:

- **Name**: the meeting title
- **Date**: when the meeting happened
- **Participants**: one or more people who attended
- **Notes**: free-form notes about the meeting

Users can log new meetings and add participants to them.

### Status

- **Done:** meeting log page (`/`): a form to log a meeting (name, date, participants, notes) and a list of logged meetings, newest first. Each list item links to its meeting page.
- **Done:** meeting page (`/meetings/[id]`): one bookmarkable page per meeting showing all its details. The browser tab title is the meeting name. Unknown IDs show a "Meeting not found" message.
- **Done:** deleting a meeting (trash-icon button on list items and on the meeting page, with a confirmation prompt). Deleting from the meeting page returns to `/`.
- **Not yet built:** editing meetings.

### Routes

- `/`: meeting log (form + list)
- `/meetings/[id]`: a single meeting; `id` is the meeting's `id` (a UUID)

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4

## Constraints

- **No backend.** No API routes, server databases, or external services. All data lives client-side.
- **No user accounts.** No authentication or per-user data.
- **No new libraries without asking first.** This includes runtime dependencies and dev dependencies. Propose the library and the reason, then wait for approval before installing.

## Data storage

Meetings are saved in the browser's `localStorage` so created items, edits, and deletions survive page reloads and closing/reopening the tab.

- All storage access goes through `lib/meetings.ts`. Don't call `localStorage` directly elsewhere.
- Meetings are one JSON array under the key `crm.meetings.v1`. Save the full array with `saveMeetings()` after every create, edit, or delete. If the `Meeting` shape changes incompatibly, bump the key version and migrate.
- **localStorage is the single source of truth.** Components read meetings with the `useMeetings()` hook (`lib/use-meetings.ts`, built on `useSyncExternalStore`), never by copying them into `useState`. `saveMeetings()` notifies every subscriber, and changes from other tabs arrive via the `storage` event.
  - Why: with Cache Components, Next.js keeps up to 3 visited pages alive but hidden (React `<Activity>`) instead of unmounting them, so their state survives navigation. A page that copied meetings into `useState` showed stale data after returning to it (e.g. a deleted meeting still listed on `/`). See `node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md`.
- `localStorage` only exists in the browser. Read it only in Client Components that call `use(browser())` and are rendered inside `<Suspense>` (or after mount in `useEffect`), never during server prerendering.
- Call `requestPersistentStorage()` once on startup to reduce the chance of the browser evicting data.
- Known limits: data is per browser, per device, and per origin (`localhost:3000` and a deployed URL don't share data). Clearing site data or closing a private window erases it. Safari may delete it after 7 days without a visit.
- Why not IndexedDB: the data is small text records, and IndexedDB's API is much more complex (the recommended `idb` wrapper would be a new library). Revisit if the app needs large data or attachments.

## Commands

- `npm run dev`: start the dev server at http://localhost:3000
- `npm run build`: production build
- `npm run lint`: run ESLint

## Project structure

- `app/`: App Router pages and layouts (`layout.tsx`, `page.tsx`, `globals.css`)
  - `meetings/[id]/page.tsx`: meeting page; reads `params` inside `<Suspense>` (required with Cache Components, since IDs are only known at runtime)
- `components/`: UI components
  - `meeting-log.tsx`: client component for `/` that owns meeting state and persistence; browser-only via `use(browser())`, so render it inside `<Suspense>`
  - `meeting-detail.tsx`: client component for `/meetings/[id]`; browser-only, same rule
  - `meeting-form.tsx`: form for logging a meeting
  - `date-picker.tsx`: date input with a custom calendar popover that follows the light/dark theme (the browser's native picker popup can't be styled)
  - `meeting-list.tsx`: list of logged meetings, each linking to its page
  - `delete-meeting-button.tsx`: trash-icon button with a confirmation prompt
- `lib/meetings.ts`: `Meeting` type, localStorage read/save, and change subscription
- `lib/use-meetings.ts`: `useMeetings()` hook for reading meetings in components
- `lib/format-date.ts`: date display formatting
- `public/`: static assets

## Keeping this file current

Update this file as the app evolves: when features, structure, conventions, or decisions change, reflect them here in the same change.
