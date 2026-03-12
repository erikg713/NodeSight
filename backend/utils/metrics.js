const client = require("prom-client");

const register = new client.Registry();

const activeSessionsGauge = new client.Gauge({
  name: "nodesight_active_sessions",
  help: "Number of active WebSocket sessions",
});

const jobsProcessedCounter = new client.Counter({
  name: "nodesight_jobs_processed_total",
  help: "Total number of jobs processed",
});

register.registerMetric(activeSessionsGauge);
register.registerMetric(jobsProcessedCounter);

module.exports = {
  register,
  activeSessionsGauge,
  jobsProcessedCounter,
};
