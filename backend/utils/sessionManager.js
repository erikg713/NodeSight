class SessionManager {
  constructor() {
    this.sessions = new Map(); // sessionId -> { ws, lastUpdated }
    this.timeout = parseInt(process.env.SESSION_TIMEOUT || 300, 10) * 1000;
    this.startCleanup();
  }

  addSession(sessionId, ws) {
    this.sessions.set(sessionId, { ws, lastUpdated: Date.now() });
  }

  updateHeartbeat(sessionId) {
    if (this.sessions.has(sessionId)) {
      this.sessions.get(sessionId).lastUpdated = Date.now();
    }
  }

  removeSession(sessionId) {
    this.sessions.delete(sessionId);
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  startCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [sessionId, session] of this.sessions.entries()) {
        if (now - session.lastUpdated > this.timeout) {
          if (session.ws && session.ws.readyState === 1) {
            session.ws.send(JSON.stringify({ type: "error", message: "Session timed out" }));
          }
          this.sessions.delete(sessionId);
        }
      }
    }, this.timeout / 2);
  }
}

module.exports = new SessionManager();
