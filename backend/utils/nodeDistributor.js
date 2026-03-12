/**
 * NodeSight Node Distributor
 * --------------------------
 * Distributes sessions and image processing jobs
 * across multiple AI worker nodes for hyperscale workloads.
 */

class NodeDistributor {
  constructor() {
    this.nodes = new Map(); // nodeId -> { activeSessions: Set, wsUrl }
  }

  // Register a worker node
  addNode(nodeId, wsUrl) {
    if (!this.nodes.has(nodeId)) {
      this.nodes.set(nodeId, { wsUrl, activeSessions: new Set() });
      console.log(`[NodeDistributor] Node added: ${nodeId}`);
    }
  }

  // Remove a worker node
  removeNode(nodeId) {
    if (this.nodes.has(nodeId)) {
      this.nodes.delete(nodeId);
      console.log(`[NodeDistributor] Node removed: ${nodeId}`);
    }
  }

  // Assign a session to the least-loaded node
  assignSession(sessionId) {
    if (this.nodes.size === 0) throw new Error("No worker nodes available");

    let selectedNode = null;
    let minLoad = Infinity;

    for (const [nodeId, node] of this.nodes.entries()) {
      const load = node.activeSessions.size;
      if (load < minLoad) {
        minLoad = load;
        selectedNode = node;
      }
    }

    selectedNode.activeSessions.add(sessionId);
    console.log(`[NodeDistributor] Session ${sessionId} assigned to ${selectedNode.wsUrl}`);

    return selectedNode.wsUrl;
  }

  // Release a session from a node
  releaseSession(sessionId) {
    for (const [nodeId, node] of this.nodes.entries()) {
      if (node.activeSessions.has(sessionId)) {
        node.activeSessions.delete(sessionId);
        console.log(`[NodeDistributor] Session ${sessionId} released from ${node.wsUrl}`);
        break;
      }
    }
  }

  // Get node load info (for metrics)
  getNodeStatus() {
    const status = {};
    for (const [nodeId, node] of this.nodes.entries()) {
      status[nodeId] = {
        wsUrl: node.wsUrl,
        activeSessions: node.activeSessions.size
      };
    }
    return status;
  }

  // Optional placeholder for distributed Pi node inference
  async distributeTask(imageBuffer) {
    // Future implementation: send image to multiple nodes
    return await Promise.resolve("Distributed inference placeholder");
  }
}

// Export a singleton instance
module.exports = new NodeDistributor();
