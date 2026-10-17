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
- **Tags**: zero or more tags, picked from the tags created on the Tags page

Users can log new meetings, add participants and tags to them, and edit or delete them.

### Status

- **Done:** meeting log page (`/`): the list of logged meetings, newest first. Each list item links to its meeting page.
- **Done:** log a meeting page (`/meetings/new`): a form to log a meeting (name, date, participants, notes); saving opens the new meeting's page.
- **Done:** meeting page (`/meetings/[id]`): one bookmarkable page per meeting showing all its details. The browser tab title is the meeting name. Unknown IDs show a "Meeting not found" message.
- **Done:** deleting a meeting (trash-icon button on list items and on the meeting page, with a confirmation prompt). Deleting from the meeting page returns to `/`.
- **Done:** editing a meeting (Edit button on the meeting page swaps the details for the meeting form, prefilled; Save changes or Cancel). Unsaved edits are dropped when navigating away.

- **Done:** menu sidebar on every page (rendered by the root layout): a prominent Log a meeting button at the top (`/meetings/new`), All meetings, Tags, Statistics, the 8 most recent meetings, and Settings at the bottom, with the current page highlighted. On phones it collapses into a top bar with a Menu button.
- **Done:** tags. Tags page (`/tags`, Tags item in the sidebar) creates tags (names unique, ignoring case) and lists them sorted by name, with how many meetings use each. Tags can be renamed in place (pencil button; Enter saves, Escape cancels; same uniqueness rule; meetings show the new name since they store tag IDs) and deleted (trash button with a confirmation prompt; the tag is also removed from every meeting that uses it, but the meetings are kept). The meeting form has a tag picker (toggle chips); tags show on meeting list items and the meeting page.
- **Done:** statistics page (`/statistics`, Statistics item in the sidebar). Only meetings dated up to today count (a note says how many later ones are left out):
  - Overview cards: total meetings, this month vs last month, number of people met, average participants per meeting.
  - Meetings per month for the last 12 months (bar chart, empty months included).
  - Who you meet most, and who you haven't met in a while (top 5 each, with the last-met date). Participant names are free text, so they're matched ignoring case and extra spaces; each person shows their most-used spelling.
  - Meetings by tag (plus Untagged; a meeting counts once per tag) and by day of the week (Monday first).
  - Charts are plain CSS bars (no chart library).
- **Not yet built:** filtering meetings by tag.
- **Done:** settings page (`/settings`, Settings item pinned to the bottom of the sidebar):
  - **Appearance:** Light / Dark / System theme. System follows the OS setting live.
  - **Backup:** export all meetings and tags as a JSON file (format version 2; version 1 had no tags), and import one (merges: imported meetings and tags replace ones with the same ID, others are kept; an imported tag with the same name as an existing one is merged into it; asks for confirmation first).
- **Rule:** no blank screens. Empty states (no meetings yet, no participants, no notes) and not-found states (unknown address, unknown meeting ID) always show a readable message, and not-found states link back to `/`.

### Routes

- `/`: meeting log (list)
- `/meetings/new`: log a meeting (form); a static segment, so it takes precedence over `[id]`
- `/meetings/[id]`: a single meeting; `id` is the meeting's `id` (a UUID)
- `/tags`: create tags and list existing ones
- `/statistics`: meeting statistics
- `/settings`: theme and backup settings
- Any other address: friendly "Page not found" page (`app/not-found.tsx`, HTTP 404) with a link back to `/`

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

- All storage access goes through `lib/meetings.ts` (meetings), `lib/tags.ts` (tags), and `lib/theme.ts` (theme preference). Don't call `localStorage` directly elsewhere.
- Meetings are one JSON array under the key `crm.meetings.v1`; tags are one JSON array under `crm.tags.v1`. Meetings refer to tags by ID (`tagIds`). Meetings saved before tags existed have no `tagIds`; `toMeeting()` fills in `[]` when reading, so the key wasn't bumped. Save the full array with `saveMeetings()` after every create, edit, or delete. If the `Meeting` shape changes incompatibly, bump the key version and migrate.
- **localStorage is the single source of truth.** Components read meetings with the `useMeetings()` hook (`lib/use-meetings.ts`, built on `useSyncExternalStore`), never by copying them into `useState`. `saveMeetings()` notifies every subscriber, and changes from other tabs arrive via the `storage` event.
  - Why: with Cache Components, Next.js keeps up to 3 visited pages alive but hidden (React `<Activity>`) instead of unmounting them, so their state survives navigation. A page that copied meetings into `useState` showed stale data after returning to it (e.g. a deleted meeting still listed on `/`). See `node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md`.
- `localStorage` only exists in the browser. Read it only in Client Components that call `use(browser())` and are rendered inside `<Suspense>` (or after mount in `useEffect`), never during server prerendering.
- Call `requestPersistentStorage()` once on startup to reduce the chance of the browser evicting data (done in `sidebar.tsx`, which is on every page).
- Known limits: data is per browser, per device, and per origin (`localhost:3000` and a deployed URL don't share data). Clearing site data or closing a private window erases it. Safari may delete it after 7 days without a visit.
- Why not IndexedDB: the data is small text records, and IndexedDB's API is much more complex (the recommended `idb` wrapper would be a new library). Revisit if the app needs large data or attachments.

## Theming

- Use Tailwind's `dark:` variant for dark styles. It's a custom variant (`app/globals.css`): dark applies when `<html data-theme="dark">`, or when the OS prefers dark and `data-theme` isn't `"light"`. No `data-theme` means "System".
- Never set `data-theme` directly; call `saveThemePreference()` from `lib/theme.ts`.

## Commands

- `npm run dev`: start the dev server at http://localhost:3000
- `npm run build`: production build
- `npm run lint`: run ESLint

## Project structure

- `app/`: App Router pages and layouts (`layout.tsx`, `page.tsx`, `not-found.tsx`, `globals.css`)
  - `meetings/new/page.tsx`: log a meeting page
  - `tags/page.tsx`: tags page
  - `statistics/page.tsx`: statistics page
  - `settings/page.tsx`: settings page
  - `meetings/[id]/page.tsx`: meeting page; reads `params` inside `<Suspense>` (required with Cache Components, since IDs are only known at runtime)
- `components/`: UI components
  - `meeting-log.tsx`: client component for `/` (list + delete); browser-only via `use(browser())`, so render it inside `<Suspense>`
  - `new-meeting.tsx`: client component for `/meetings/new` that saves a new meeting; browser-only, same rule (also keeps the form's default date from being baked in at prerender time)
  - `meeting-detail.tsx`: client component for `/meetings/[id]` (view, edit, delete); browser-only, same rule
  - `meeting-form.tsx`: form for logging a meeting; pass `initial` (plus `submitLabel`, `onCancel`) to edit an existing one
  - `date-picker.tsx`: date input with a custom calendar popover that follows the light/dark theme (the browser's native picker popup can't be styled)
  - `meeting-list.tsx`: list of logged meetings, each linking to its page
  - `delete-button.tsx`: generic trash-icon button with a confirmation prompt
  - `delete-meeting-button.tsx`: `DeleteButton` preset for meetings
  - `tags-manager.tsx`: client component for `/tags` (create form, list, rename, delete); browser-only, same rule
  - `statistics.tsx`: client component for `/statistics` (cards, month chart, people lists, tag and weekday bars); browser-only, same rule
  - `meeting-tags.tsx`: a meeting's tags as small `#name` labels
  - `settings.tsx`: client component for `/settings` (theme switch, backup export/import); browser-only, same rule
  - `inline-script.tsx`: runs a script before hydration on full page loads (used for the theme, so there's no flash of the wrong colors)
  - `sidebar.tsx`: app menu in the root layout, with "Log a meeting" as a primary button at the top; the part using `usePathname()` and localStorage is inside `<Suspense>` (with Cache Components, `usePathname()` suspends on `/meetings/[id]`), and the fallback shows plain links
- `lib/meetings.ts`: `Meeting` type, localStorage read/save, and change subscription
- `lib/use-meetings.ts`: `useMeetings()` hook for reading meetings in components
- `lib/tags.ts`: `Tag` type, localStorage read/save, and change subscription (same pattern as `lib/meetings.ts`)
- `lib/use-tags.ts`: `useTags()` hook
- `lib/statistics.ts`: `computeStatistics()` (pure function over meetings, tags, and today's date) and date helpers for it
- `lib/backup.ts`: backup file format (export, import, and merging imported data)
- `lib/theme.ts`: theme preference (`crm.theme.v1` in localStorage), applying it as `data-theme` on `<html>`, and the inline script that applies it before first paint
- `lib/use-theme.ts`: `useThemePreference()` hook
- `lib/format-date.ts`: date display formatting
- `public/`: static assets

## Keeping this file current

Update this file as the app evolves: when features, structure, conventions, or decisions change, reflect them here in the same change.
