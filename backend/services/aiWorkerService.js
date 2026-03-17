import axios from "axios";

const AI_WORKER_URL = process.env.AI_WORKER_URL || "http://localhost:5050";

export async function runFraudAI(data) {

  try {

    const response = await axios.post(
      `${AI_WORKER_URL}/api/analyze/fraud`,
      data
    );

    return response.data;

  } catch (error) {

    console.error("AI worker request failed:", error.message);

    return {
      analysis: {
        risk: "unknown",
        score: 0,
        reasons: ["AI worker unavailable"]
      }
    };

  }
}
