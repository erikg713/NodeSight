const Redis = require("ioredis");

// -----------------------------
// Redis connection configuration
// -----------------------------
const redis = new Redis({
  host: process.env.REDIS_HOST || "redis",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    // exponential backoff
    return Math.min(times * 50, 2000);
  },
});

const STREAM_NAME = process.env.REDIS_STREAM_NAME || "nodesight_stream";

// -----------------------------
// Publish job to Redis Stream
// -----------------------------
async function publishJob(job) {
  if (!job || !job.sessionId || !job.image) {
    throw new Error("Invalid job payload");
  }

  await redis.xadd(
    STREAM_NAME,
    "*", // auto-generate ID
    "sessionId", job.sessionId,
    "image", job.image,
    "timestamp", job.timestamp || Date.now()
  );
}

// -----------------------------
// Consume jobs (worker side)
// -----------------------------
async function consumeJobs(processor, lastId = "0-0") {
  while (true) {
    try {
      const response = await redis.xread(
        { key: STREAM_NAME, id: lastId, block: 0 }
      );

      if (!response) continue;

      for (const [stream, messages] of response) {
        for (const [id, data] of messages) {
          const job = {};
          for (let i = 0; i < data.length; i += 2) {
            job[data[i]] = data[i + 1];
          }

          // Call processor callback
          await processor(job);

          lastId = id;
        }
      }
    } catch (err) {
      console.error("Redis consumer error:", err);
      await new Promise((resolve) => setTimeout(resolve, 500)); // simple retry delay
    }
  }
}

module.exports = {
  redis,
  publishJob,
  consumeJobs,
};
