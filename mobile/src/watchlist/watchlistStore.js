import { userGetItem, userSetItem } from "../auth/userStorage";

export const WATCHLIST_NAMES = [
  "My WatchList 1",
  "My WatchList 2",
  "My WatchList 3"
];

export const DEFAULT_WATCHLISTS = {
  "My WatchList 1": ["SCOM", "KCB", "BAT", "EABL", "COOP"],
  "My WatchList 2": [],
  "My WatchList 3": []
};

export async function loadWatchlists() {
  const raw = await userGetItem("watchlists");

  if (!raw) {
    await userSetItem("watchlists", JSON.stringify(DEFAULT_WATCHLISTS));
    return DEFAULT_WATCHLISTS;
  }

  const parsed = JSON.parse(raw);

  return {
    ...DEFAULT_WATCHLISTS,
    ...parsed
  };
}

export async function saveWatchlists(watchlists) {
  await userSetItem("watchlists", JSON.stringify(watchlists));
  return watchlists;
}