const WebSocket = require("ws");
const { publishJob } = require("../queue/redis");
const { publishJobKafka } = require("../queue/kafka");

// Store active sessions
const sessions = new Map();

// WebSocket route initializer
function initWebSocketServer(server) {
  const wss = new WebSocket.Server({ server });

  console.log("[NodeSight] WebSocket streaming initialized");

  wss.on("connection", (ws, req) => {
    const sessionId = req.url.split("/").pop(); // e.g., ws://host/stream/<sessionId>
    ws.sessionId = sessionId;
    ws.isAlive = true;

    // Store session
    sessions.set(sessionId, ws);

    console.log(`[NodeSight] Client connected: ${sessionId}`);

    // Heartbeat ping
    ws.on("pong", () => ws.isAlive = true);

    ws.on("message", async (msg) => {
      try {
        const data = JSON.parse(msg);

        if (data.type === "image_frame") {
          const job = {
            sessionId: sessionId,
            image: data.imageBase64,
            timestamp: Date.now()
          };

          // Publish to Redis
          await publishJob(job);

          // Optionally publish to Kafka
          if (publishJobKafka) await publishJobKafka(job);
        }
      } catch (err) {
        console.error(`[NodeSight] WS message error:`, err);
        ws.send(JSON.stringify({ type: "error", message: err.message }));
      }
    });

    ws.on("close", () => {
      console.log(`[NodeSight] Session closed: ${sessionId}`);
      sessions.delete(sessionId);
    });

    ws.on("error", (err) => {
      console.error(`[NodeSight] WS error:`, err);
    });
  });

  // Heartbeat interval to detect dead connections
  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, parseInt(process.env.WS_HEARTBEAT_INTERVAL || 15000, 10));

  return wss;
}

// Send partial or complete results to a session
function sendToSession(sessionId, payload) {
  const ws = sessions.get(sessionId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

module.exports = {
  initWebSocketServer,
  sendToSession
};
