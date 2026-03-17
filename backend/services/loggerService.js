import fs from "fs";

const LOG_FILE = "./data/logs/security.log";

export function logSecurityEvent(event) {

  const line =
    `${new Date().toISOString()} | ${JSON.stringify(event)}\n`;

  fs.appendFileSync(LOG_FILE, line);

}
