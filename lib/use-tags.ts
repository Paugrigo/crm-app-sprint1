import { useSyncExternalStore } from "react";
import { loadTags, loadTagsOnServer, subscribeToTags } from "./tags";

/** Saved tags, kept in sync with localStorage across pages and tabs. */
export function useTags() {
  return useSyncExternalStore(subscribeToTags, loadTags, loadTagsOnServer);
}
