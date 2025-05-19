// Este objeto solo vive en RAM del servidor
const activeUsers: Record<string, number> = {}; // { sessionId: timestamp }

export function addActiveUser(sessionId: string) {
  activeUsers[sessionId] = Date.now();
}

export function removeActiveUser(sessionId: string) {
  delete activeUsers[sessionId];
}

export function getActiveUserCount(timeoutMs = 60000) {
  // Considera activo si ha hecho ping en el último minuto
  const now = Date.now();
  return Object.values(activeUsers).filter(ts => now - ts < timeoutMs).length;
}