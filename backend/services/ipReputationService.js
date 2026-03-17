const flaggedIPs = new Map();

export function checkIP(ip) {

  const record = flaggedIPs.get(ip) || { attempts: 0 };

  record.attempts += 1;

  flaggedIPs.set(ip, record);

  if (record.attempts > 20) {
    return {
      risk: "high",
      reason: "Too many requests"
    };
  }

  return {
    risk: "clear"
  };
}
