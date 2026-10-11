import { useSyncExternalStore } from "react";
import { loadMeetings, loadMeetingsOnServer, subscribeToMeetings } from "./meetings";

/** Saved meetings, kept in sync with localStorage across pages and tabs. */
export function useMeetings() {
  return useSyncExternalStore(subscribeToMeetings, loadMeetings, loadMeetingsOnServer);
}
