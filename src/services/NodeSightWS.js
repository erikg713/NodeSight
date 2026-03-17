import { io } from 'socket.io-client';

class NodeSightWS {
  constructor() {
    this.socket = null;
    this.serverUrl = process.env.REACT_APP_GATEWAY_URL || 'http://localhost:5050';
  }

  /**
   * Initialize connection with specific handlers for streaming results
   */
  connect(callbacks = {}) {
    const { onPartial, onComplete, onError, onStatusChange } = callbacks;

    this.socket = io(this.serverUrl, {
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    // --- Connection Lifecycle ---
    this.socket.on('connect', () => {
      onStatusChange?.('connected');
    });

    this.socket.on('connect_error', (err) => {
      onError?.(err.message);
      onStatusChange?.('error');
    });

    // --- AI Intelligence Listeners ---
    this.socket.on('partial_result', (data) => {
      onPartial?.(data.objects);
    });

    this.socket.on('analysis_complete', (results) => {
      onComplete?.(results);
    });

    this.socket.on('disconnect', () => {
      onStatusChange?.('disconnected');
    });
  }

  /**
   * Cleans and sends image to the cluster
   */
  analyze(imageBase64, sessionId) {
    if (!this.socket?.connected) return;

    // Strip header if present
    const cleanedBase64 = imageBase64.includes("base64,")
      ? imageBase64.split(",")[1]
      : imageBase64;

    this.socket.emit('analyze_request', {
      image: cleanedBase64,
      sessionId: sessionId,
      timestamp: Date.now(),
    });
  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
  }
}

export default new NodeSightWS();
