const dnaStore = new Map();

export async function saveInvestorDNA(userId, record) {
  const now = new Date().toISOString();

  const existing = dnaStore.get(userId);

  const saved = {
    id: existing?.id || `DNA-${userId}`,
    userId,
    ...existing,
    ...record,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };

  dnaStore.set(userId, saved);
  return saved;
}

export async function getInvestorDNA(userId) {
  return dnaStore.get(userId) || null;
}