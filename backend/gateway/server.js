const WebSocket = require("ws");
const { publishJobRedis } = require("../queue/redis");
const { publishJobKafka } = require("../queue/kafka");

const PORT = process.env.GATEWAY_PORT || 8080;

const wss = new WebSocket.Server({ port: PORT });
console.log(`NodeSight Gateway running on port ${PORT}`);

wss.on("connection", (ws) => {

  ws.isAlive = true;

  // Heartbeat ping
  ws.on("pong", () => ws.isAlive = true);

  ws.on("message", async (msg) => {
    try {
      const data = JSON.parse(msg);
      if(data.type === "image_frame") {
        const job = {
          sessionId: data.sessionId,
          image: data.imageBase64,
          timestamp: Date.now()
        };

        // Publish to both queues for redundancy / scale
        await publishJobRedis(job);
        await publishJobKafka(job);
      }
    } catch (err) {
      console.error("Gateway message error:", err);
    }
  });
});

// Heartbeat check every 15s
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, process.env.WS_HEARTBEAT_INTERVAL || 15000);
