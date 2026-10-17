import { useSyncExternalStore } from "react";
import { loadThemePreference, loadThemePreferenceOnServer, subscribeToTheme } from "./theme";

/** The saved theme preference, kept in sync across pages and tabs. */
export function useThemePreference() {
  return useSyncExternalStore(subscribeToTheme, loadThemePreference, loadThemePreferenceOnServer);
}
