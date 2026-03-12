const { redis, consumeJobs } = require("../queue/redis");
const { sendToSession } = require("../routes/stream");
const EventEmitter = require("events");

class Aggregator extends EventEmitter {
  constructor() {
    super();
    this.sessions = new Map(); // sessionId -> { partialResults: [], lastUpdated: Date }
    this.sessionTimeout = parseInt(process.env.SESSION_TIMEOUT || 300, 10) * 1000;
    this.startCleanupLoop();
  }

  // Register partial results from workers
  async handleJob(job) {
    const { sessionId, objects, result, type } = job;
    if (!sessionId) return;

    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, { partialResults: [], lastUpdated: Date.now() });
    }

    const session = this.sessions.get(sessionId);
    session.lastUpdated = Date.now();

    if (type === "partial") {
      session.partialResults.push(objects);
      sendToSession(sessionId, { type: "partial", objects });
    }

    if (type === "complete") {
      sendToSession(sessionId, { type: "complete", result });
      this.sessions.delete(sessionId); // clear after complete
    }
  }

  // Start consuming Redis stream
  startRedisConsumer() {
    consumeJobs(async (job) => {
      // Job structure: { sessionId, objects, result, type }
      await this.handleJob(job);
    });
  }

  // Optional Kafka consumer can also be added here

  // Cleanup old sessions
  startCleanupLoop() {
    setInterval(() => {
      const now = Date.now();
      for (const [sessionId, session] of this.sessions.entries()) {
        if (now - session.lastUpdated > this.sessionTimeout) {
          sendToSession(sessionId, { type: "error", message: "Session timed out" });
          this.sessions.delete(sessionId);
        }
      }
    }, this.sessionTimeout / 2);
  }
}

const aggregator = new Aggregator();
aggregator.startRedisConsumer();

module.exports = aggregator;
