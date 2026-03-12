const { createLogger, format, transports } = require("winston");

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: process.env.LOG_JSON === "true"
    ? format.json()
    : format.combine(format.colorize(), format.simple()),
  transports: [new transports.Console()],
});

module.exports = logger;
