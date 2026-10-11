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

- **Done:** meeting log page (`/`): a form to log a meeting (name, date, participants, notes) and a list of logged meetings, newest first.
- **Done:** deleting a meeting (trash-icon button on each list item, with a confirmation prompt).
- **Not yet built:** editing meetings.

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

- All storage access goes through `lib/meetings.ts` (`loadMeetings`, `saveMeetings`, `requestPersistentStorage`). Don't call `localStorage` directly elsewhere.
- Meetings are one JSON array under the key `crm.meetings.v1`. Load once on mount and save the full array after every create, edit, or delete. If the `Meeting` shape changes incompatibly, bump the key version and migrate.
- `localStorage` only exists in the browser. Use it only in Client Components after mount (e.g. in `useEffect`), never during server prerendering.
- Call `requestPersistentStorage()` once on startup to reduce the chance of the browser evicting data.
- Known limits: data is per browser, per device, and per origin (`localhost:3000` and a deployed URL don't share data). Clearing site data or closing a private window erases it. Safari may delete it after 7 days without a visit.
- Why not IndexedDB: the data is small text records, and IndexedDB's API is much more complex (the recommended `idb` wrapper would be a new library). Revisit if the app needs large data or attachments.

## Commands

- `npm run dev`: start the dev server at http://localhost:3000
- `npm run build`: production build
- `npm run lint`: run ESLint

## Project structure

- `app/`: App Router pages and layouts (`layout.tsx`, `page.tsx`, `globals.css`)
- `components/`: UI components
  - `meeting-log.tsx`: client component that owns meeting state and persistence; browser-only via `use(browser())`, so render it inside `<Suspense>`
  - `meeting-form.tsx`: form for logging a meeting
  - `meeting-list.tsx`: list of logged meetings
- `lib/meetings.ts`: `Meeting` type and localStorage persistence
- `public/`: static assets

## Keeping this file current

Update this file as the app evolves: when features, structure, conventions, or decisions change, reflect them here in the same change.
