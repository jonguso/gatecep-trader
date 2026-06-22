import {
  userGetItem,
  userSetItem
} from "../auth/userStorage";

export async function loadRecommendationHistory() {
  const raw = await userGetItem(
    "recommendationHistory"
  );

  return raw ? JSON.parse(raw) : [];
}

export async function saveRecommendation(rec) {
  const history =
    await loadRecommendationHistory();

  history.unshift(rec);

  await userSetItem(
    "recommendationHistory",
    JSON.stringify(history)
  );

  return history;
}