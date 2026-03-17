export function detectFraud({ uid, ip, message }) {

  let score = 0;
  let reasons = [];

  if (!message) {
    return { score: 0, risk: "clear", reasons: [] };
  }

  const lower = message.toLowerCase();

  const phishingKeywords = [
    "verify wallet",
    "send pi",
    "claim reward",
    "limited offer",
    "urgent transfer"
  ];

  phishingKeywords.forEach(keyword => {
    if (lower.includes(keyword)) {
      score += 25;
      reasons.push(`Keyword detected: ${keyword}`);
    }
  });

  const risk =
    score > 80 ? "high" :
    score > 50 ? "medium" :
    score > 0 ? "low" : "clear";

  return {
    score,
    risk,
    reasons
  };
}
