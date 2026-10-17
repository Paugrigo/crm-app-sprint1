import type { ReactNode } from "react";

/** Page title row: a mono kicker, the title, an optional description and actions on the right. */
export function PageHeader({
  kicker,
  title,
  description,
  actions,
}: {
  /** Small mono label above the title, e.g. "Analytics". */
  kicker?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
      <div className="min-w-0">
        {kicker && (
          <p className="mb-1 font-mono text-[11px] uppercase tracking-wider text-accent-fg">
            {kicker}
          </p>
        )}
        <h1 className="text-xl font-semibold tracking-tight text-fg">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
