import { userGetItem, userSetItem } from "../auth/userStorage";

export const WATCHLIST_NAMES = [
  "Dividend Income",
  "Capital Growth",
  "Balanced Growth"
];

export const DEFAULT_WATCHLISTS = {
  "Dividend Income": ["BAT", "EABL", "SCBK", "KCB", "COOP"],
  "Capital Growth": ["SCOM", "EABL", "KCB", "ABSA", "KEGN"],
  "Balanced Growth": ["SCOM", "KCB", "COOP", "EABL", "SMWF"]
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