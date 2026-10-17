// Shared Tailwind class strings for the "finance terminal" look. Colors are the tokens defined
// in app/globals.css, so these work in both themes without dark: classes.

/** Page width and padding, for each page's <main>. */
export const pageMain = "mx-auto w-full max-w-5xl px-4 py-8 sm:px-6";

/** Narrower page for single-column forms and lists (log a meeting, tags, settings). */
export const pageMainNarrow = "mx-auto w-full max-w-3xl px-4 py-8 sm:px-6";

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-1 focus-visible:ring-offset-bg";

const buttonBase = `inline-flex items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

/** Amber call to action. */
export const buttonPrimary = `${buttonBase} bg-accent text-on-accent hover:bg-accent-hover disabled:hover:bg-accent`;

/** Hairline outline. */
export const buttonSecondary = `${buttonBase} border border-line-strong bg-surface text-fg hover:border-muted hover:bg-surface-2`;

/** No border until hovered. */
export const buttonGhost = `${buttonBase} text-muted hover:bg-surface-2 hover:text-fg`;

/** Square icon-only button (rename, calendar arrows). */
export const iconButton = `inline-flex items-center justify-center rounded-sm p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-fg ${focusRing}`;

/** Text inputs and textareas. */
export const input =
  "w-full rounded-sm border border-line-strong bg-surface px-3 py-2 text-sm text-fg placeholder:text-faint transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25";

/** Bordered box for grouped content. */
export const panel = "rounded-md border border-line bg-surface";

/** Header strip at the top of a panel; put a `label` inside. */
export const panelHeader =
  "flex items-center justify-between gap-3 border-b border-line bg-surface-2/60 px-4 py-2";

/** Small uppercase mono label: form labels, panel titles, table headings. */
export const label = "font-mono text-[11px] font-medium uppercase tracking-wider text-muted";

/** Dashed box for "nothing here yet" messages. */
export const emptyState = "rounded-md border border-dashed border-line-strong px-6 py-8 text-center";

/** Inline link in body text. */
export const textLink =
  "font-medium text-accent-fg underline decoration-accent/40 underline-offset-2 hover:decoration-accent";

/** Error message box (role="alert"). */
export const errorBox =
  "rounded-sm border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger";

/** "Loading …" fallbacks. */
export const loadingText = "font-mono text-xs uppercase tracking-wider text-faint";
