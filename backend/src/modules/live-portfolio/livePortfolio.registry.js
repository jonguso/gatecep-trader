const activeUsers = new Map();

export function registerActiveUser(userId, socketId) {
  if (!userId || !socketId) return;

  const existing = activeUsers.get(userId) || new Set();
  existing.add(socketId);
  activeUsers.set(userId, existing);
}

export function unregisterSocket(socketId) {
  for (const [userId, sockets] of activeUsers.entries()) {
    sockets.delete(socketId);

    if (!sockets.size) {
      activeUsers.delete(userId);
    }
  }
}

export function getActiveUserIds() {
  return [...activeUsers.keys()];
}

export function getActiveUserCount() {
  return activeUsers.size;
}