/**
 * NodeSight WebSocket Utility Suite
 * Consolidates distributed node cluster communication and session-based 
 * image streaming for real-time AI feedback.
 */

// 1. Singleton for general cluster status and background offloading
class NodeSightCluster {
  constructor() {
    this.socket = null;
    this.url = process.env.REACT_APP_NODE_WS_URL || "wss://node-cluster.pinetwork.com/ws";
    this.reconnectAttempts = 0;
  }

  connect(onMessage) {
    this.socket = new WebSocket(this.url);
    this.socket.onmessage = (event) => onMessage(JSON.parse(event.data));
    this.socket.onclose = () => {
      if (this.reconnectAttempts < 5) {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(onMessage), 2000 * this.reconnectAttempts);
      }
    };
  }

  sendUpdate(payload) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }
}

export const nsCluster = new NodeSightCluster();

// 2. Class for active Image Analysis sessions
export default class NodeSightWS {
  constructor(sessionId, onPartial, onComplete, onError) {
    // Note: Ensure this URL points to your Pi App Engine endpoint
    this.ws = new WebSocket("wss://your-app.piappengine.com/api/analyze/stream");
    this.sessionId = sessionId;
    this.onPartial = onPartial;
    this.onComplete = onComplete;
    this.onError = onError;

    this.ws.onopen = () => console.log(`Session ${sessionId} connected`);
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onerror = (err) => this.onError("Streaming error: Check connection.");
    this.ws.onclose = () => console.log("Streaming session closed.");
  }

  /**
   * Sends image data to the server. 
   * @param {string|Blob} imageData - Raw image data
   */
  sendImage(imageData) {
    if (this.ws.readyState !== WebSocket.OPEN) return;

    // Payload uses base64 for the streaming API
    const payload = { 
      imageBase64: typeof imageData === 'string' ? btoa(imageData) : imageData, 
      sessionId: this.sessionId,
      timestamp: Date.now()
    };
    
    this.ws.send(JSON.stringify(payload));
  }

  handleMessage({ data }) {
    try {
      const event = JSON.parse(data);
      switch(event.type) {
        case "partial": 
          this.onPartial(event.objects); 
          break;
        case "complete": 
          this.onComplete(event.result); 
          break;
        case "error": 
          this.onError(event.message); 
          break;
        default: 
          console.warn("Unknown socket event:", event.type);
      }
    } catch (err) {
      console.error("Failed to parse socket message", err);
    }
  }

  close() {
    if (this.ws) this.ws.close();
  }
}
