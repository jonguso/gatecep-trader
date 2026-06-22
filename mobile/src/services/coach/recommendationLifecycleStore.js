import { userGetItem, userSetItem } from "../auth/userStorage";

const RECOMMENDATION_HISTORY_KEY = "recommendationHistory";

export const RECOMMENDATION_STATUS = {
  SAVED: "SAVED",
  BASKET_CREATED: "BASKET_CREATED",
  REVIEW_PENDING: "REVIEW_PENDING",
  QUEUED: "QUEUED",
  EXECUTING: "EXECUTING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
};

export async function loadRecommendationHistory() {
  const raw = await userGetItem(RECOMMENDATION_HISTORY_KEY);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveRecommendationRecord(record = {}) {
  const history = await loadRecommendationHistory();
  const now = new Date().toISOString();

  const id = record.id || `REC-${Date.now()}`;

  const nextRecord = {
    ...record,
    id,
    status: record.status || RECOMMENDATION_STATUS.SAVED,
    executionStatus: record.executionStatus || "NOT_STARTED",
    executionLifecycle: record.executionLifecycle || [
      {
        status: RECOMMENDATION_STATUS.SAVED,
        timestamp: now
      }
    ],
    savedAt: record.savedAt || now,
    updatedAt: now
  };

  const next = [
    nextRecord,
    ...history.filter((item) => item.id !== id)
  ];

  await userSetItem(RECOMMENDATION_HISTORY_KEY, JSON.stringify(next));

  return nextRecord;
}

export async function updateRecommendationStatus(
  recommendationId,
  status,
  patch = {}
) {
  const history = await loadRecommendationHistory();
  const now = new Date().toISOString();

  const next = history.map((item) => {
    if (item.id !== recommendationId) return item;

    return {
      ...item,
      ...patch,
      status,
      executionLifecycle: [
        {
          status,
          timestamp: now,
          message: patch.message || ""
        },
        ...(item.executionLifecycle || [])
      ],
      updatedAt: now
    };
  });

  await userSetItem(RECOMMENDATION_HISTORY_KEY, JSON.stringify(next));

  return next;
}