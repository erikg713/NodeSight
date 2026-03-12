/**
 * NodeSight WebSocket Utility
 * Handles real-time communication between the mobile client and 
 * distributed Pi Nodes for offloaded AI processing.
 */

class NodeSightSocket {
  constructor() {
    this.socket = null;
    this.url = process.env.REACT_APP_NODE_WS_URL || "wss://node-cluster.pinetwork.com/ws";
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Initializes the connection to a distributed processing node.
   * @param {Function} onMessage - Callback for incoming AI results.
   * @param {Function} onError - Callback for connection issues.
   */
  connect(onMessage, onError) {
    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log("Connected to NodeSight Distributed Cluster");
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
      };

      this.socket.onerror = (err) => {
        console.error("WebSocket Error:", err);
        if (onError) onError(err);
      };

      this.socket.onclose = () => {
        console.log("Connection closed. Attempting to rotate to nearest node...");
        this.attemptReconnect(onMessage, onError);
      };
    } catch (e) {
      console.error("Socket initialization failed", e);
    }
  }

  /**
   * Sends image metadata or low-res fragments for distributed inference.
   * @param {Object} payload - The scan data (e.g., image hash or tensors).
   */
  sendScanRequest(payload) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: "OFFLOAD_INFERENCE",
        timestamp: Date.now(),
        ...payload
      }));
    } else {
      console.warn("Socket not connected. Falling back to local device inference.");
    }
  }

  attemptReconnect(onMessage, onError) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        this.connect(onMessage, onError);
      }, 2000 * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
    }
  }
}

export const nsSocket = new NodeSightSocket();

export default class NodeSightWS {
  constructor(sessionId, onPartial, onComplete, onError) {
    this.ws = new WebSocket("wss://your-app.piappengine.com/api/analyze/stream");
    this.sessionId = sessionId;
    this.onPartial = onPartial;
    this.onComplete = onComplete;
    this.onError = onError;

    this.ws.onopen = this.onOpen.bind(this);
    this.ws.onmessage = this.onMessage.bind(this);
    this.ws.onerror = this.onError.bind(this);
    this.ws.onclose = this.onClose.bind(this);
  }

  onOpen() { console.log("Connected to NodeSight WebSocket API"); }

  sendImage(imageData) {
    const payload = { imageBase64: btoa(imageData), sessionId: this.sessionId };
    this.ws.send(JSON.stringify(payload));
  }

  onMessage({ data }) {
    const event = JSON.parse(data);
    switch(event.type) {
      case "partial": this.onPartial(event.objects); break;
      case "complete": this.onComplete(event.result); break;
      case "error": this.onError(event.message); break;
      default: console.warn("Unknown event type:", event.type);
    }
  }

  onClose() { console.log("WebSocket connection closed"); }
}
