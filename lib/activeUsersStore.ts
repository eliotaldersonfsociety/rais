// Este objeto solo vive en RAM del servidor
const activeUsers: Record<string, { timestamp: number; pathname: string }> = {};

export function addActiveUser(sessionId: string, pathname: string = '/') {
  activeUsers[sessionId] = { timestamp: Date.now(), pathname };
}

export function removeActiveUser(sessionId: string) {
  delete activeUsers[sessionId];
}

export function cleanExpiredSessions(timeoutMs = 60000) {
  const now = Date.now();
  Object.entries(activeUsers).forEach(([sessionId, data]) => {
    if (now - data.timestamp > timeoutMs) {
      delete activeUsers[sessionId];
    }
  });
}

export function getActiveUserCount(timeoutMs = 60000) {
  cleanExpiredSessions(timeoutMs);
  return Object.values(activeUsers).length;
}

export function getActivePages() {
  const uniquePages = new Set(Object.values(activeUsers).map(data => data.pathname));
  return uniquePages.size;
}
