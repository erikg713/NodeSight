/**
 * DecisionEngine
 * Balanced Hybrid AI: Local vs Cluster
 */
class DecisionEngine {
  constructor() {
    this.latencyThreshold = 300; // ms
    this.lastPing = 0;
  }

  /**
   * Decides if the current frame should go to the Cluster or stay Local.
   * @param {number} currentPing - Current socket latency
   * @returns {string} 'cluster' | 'local'
   */
  getInferencePath(currentPing) {
    this.lastPing = currentPing;
    
    // If connection is slow or disconnected, force Local AI
    if (currentPing > this.latencyThreshold || currentPing === 0) {
      return 'local';
    }
    
    return 'cluster';
  }

  /**
   * Formats the confidence score for UI display
   */
  formatConfidence(score) {
    return `${(score * 100).toFixed(1)}%`;
  }
}

export default new DecisionEngine();
