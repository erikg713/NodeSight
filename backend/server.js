require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const logger = require("./utils/logger");
const { initWebSocketServer } = require("./routes/stream");
const aggregator = require("./services/aggregator");
const nodeDistributor = require("./utils/nodeDistributor");
const sessionManager = require("./utils/sessionManager");
const { register, activeSessionsGauge } = require("./utils/metrics");

// ----------------------------
// Express App Setup
// ----------------------------
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ----------------------------
// Health Check & Metrics
// ----------------------------
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// Optional: static demo files
app.use(express.static("public"));

// ----------------------------
// HTTP + WebSocket Server
// ----------------------------
const server = http.createServer(app);
const wss = initWebSocketServer(server);

// ----------------------------
// Track active sessions for metrics
// ----------------------------
setInterval(() => {
  activeSessionsGauge.set(sessionManager.sessions.size);
}, 5000);

// ----------------------------
// Sample: register a few nodes
// ----------------------------
nodeDistributor.addNode("worker-1", process.env.WORKER_WS_URL || "ws://worker-1:9000");
nodeDistributor.addNode("worker-2", process.env.WORKER_WS_URL2 || "ws://worker-2:9000");

// ----------------------------
// Graceful Shutdown
// ----------------------------
const shutdown = () => {
  logger.info("Shutting down NodeSight server...");
  wss.close();
  server.close(() => process.exit(0));
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// ----------------------------
// Start Server
// ----------------------------
const PORT = parseInt(process.env.GATEWAY_PORT || 8080, 10);
server.listen(PORT, () => {
  logger.info(`[NodeSight] Server running on http://localhost:${PORT}`);
  logger.info("[NodeSight] WebSocket server initialized");
});
