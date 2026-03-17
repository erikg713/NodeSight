import { io } from 'socket.io-client';

/**
 * NodeSightWS Service
 * Manages real-time bi-directional communication with the AI Cluster.
 */
class NodeSightWS {
  constructor() {
    this.socket = null;
    this.serverUrl = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:5050';
  }

  /**
   * Initialize the connection to the Gateway
   * @param {Function} onResults - Callback for when AI analysis is returned.
   * @param {Function} onStatusChange - Callback to track connection health.
   */
  connect(onResults, onStatusChange) {
    this.socket = io(this.serverUrl, {
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log("🛰️ Connected to NodeSight Gateway");
      if (onStatusChange) onStatusChange('connected');
    });

    this.socket.on('connect_error', (err) => {
      console.error("🔌 Connection Error:", err.message);
      if (onStatusChange) onStatusChange('error');
    });

    // Listen for the final analysis from the Python Workers
    this.socket.on('analysis_complete', (results) => {
      console.log("🧠 Intelligence Received:", results);
      if (onResults) onResults(results);
    });

    this.socket.on('disconnect', () => {
      if (onStatusChange) onStatusChange('disconnected');
    });
  }

  /**
   * Sends a compressed image payload to the cluster.
   * @param {string} compressedBase64 
   */
  analyze(compressedBase64) {
    if (!this.socket || !this.socket.connected) {
      console.error("❌ Cannot analyze: Socket not connected.");
      return;
    }

    this.socket.emit('analyze_request', {
      image: compressedBase64,
      timestamp: Date.now(),
    });
  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
  }
}

// Export as a singleton for use across components
export default new NodeSightWS();

export default class NodeSightWS {
  constructor(sessionId, onPartial, onComplete, onError) {
    this.sessionId = sessionId
    this.onPartial = onPartial
    this.onComplete = onComplete
    this.onError = onError

    this.ws = new WebSocket(
      process.env.REACT_APP_WS_URL ||
      "wss://your-app.piappengine.com/api/analyze/stream"
    )

    this.ws.onopen = () => {
      console.log(`[NodeSight] Session ${sessionId} connected`)
    }

    this.ws.onmessage = this.handleMessage.bind(this)

    this.ws.onerror = () => {
      this.onError("Network error: AI stream disconnected")
    }

    this.ws.onclose = () => {
      console.log("[NodeSight] Stream closed")
    }
  }

  sendImage(imageBase64) {
    if (this.ws.readyState !== WebSocket.OPEN) return

    const cleanedBase64 =
      imageBase64.includes("base64,")
        ? imageBase64.split(",")[1]
        : imageBase64

    const payload = {
      imageBase64: cleanedBase64,
      sessionId: this.sessionId,
      timestamp: Date.now()
    }

    this.ws.send(JSON.stringify(payload))
  }

  handleMessage({ data }) {
    try {
      const event = JSON.parse(data)

      switch (event.type) {
        case "partial":
          this.onPartial?.(event.objects)
          break

        case "complete":
          this.onComplete?.(event.result)
          break

        case "error":
          this.onError?.(event.message)
          break

        default:
          console.warn("Unknown event:", event.type)
      }

    } catch (err) {
      console.error("WS parse error:", err)
    }
  }

  close() {
    if (this.ws) {
      this.ws.close()
    }
  }
}
