// Theme preference. Stored in localStorage and applied as a data-theme attribute on <html>:
// "light" or "dark" force that theme; "system" removes the attribute so CSS follows the OS.
// Browser-only, except THEME_SCRIPT, which the root layout inlines into <head>.

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "crm.theme.v1";

/**
 * Runs before the first paint on every full page load, so a saved theme applies without
 * a flash of the wrong colors. Keep it in sync with applyTheme().
 */
export const THEME_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

function isThemePreference(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

/** The saved preference, or "system" if none is saved or storage is unavailable. */
export function loadThemePreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return isThemePreference(saved) ? saved : "system";
  } catch {
    return "system";
  }
}

/** Server snapshot for useSyncExternalStore. */
export function loadThemePreferenceOnServer(): ThemePreference {
  return "system";
}

function applyTheme(preference: ThemePreference) {
  if (preference === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = preference;
}

const listeners = new Set<() => void>();

/**
 * Calls listener when the preference changes in this tab. Changes from other tabs are
 * applied to this page too, so every open tab shows the same theme.
 */
export function subscribeToTheme(listener: () => void): () => void {
  function handleStorage(event: StorageEvent) {
    if (event.key === STORAGE_KEY || event.key === null) {
      applyTheme(loadThemePreference());
      listener();
    }
  }
  listeners.add(listener);
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

/** Saves and applies the preference. Still applies it for this page if saving fails. */
export function saveThemePreference(preference: ThemePreference): boolean {
  applyTheme(preference);
  let saved = true;
  try {
    if (preference === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    saved = false;
  }
  listeners.forEach((listener) => listener());
  return saved;
}
