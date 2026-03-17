/**
 * NodeSight WebSocket Utility
 * Handles real-time communication for distributed AI processing.
 */

export default class NodeSightWS {
  constructor(sessionId, onPartial, onComplete, onError) {
    this.ws = new WebSocket(process.env.REACT_APP_WS_URL || "wss://your-app.piappengine.com/api/analyze/stream");
    this.sessionId = sessionId;
    this.onPartial = onPartial;
    this.onComplete = onComplete;
    this.onError = onError;

    this.ws.onopen = () => console.log(`[NodeSight] Session ${sessionId} connected.`);
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onerror = () => this.onError("Network error: Connection to AI cluster lost.");
    this.ws.onclose = () => console.log("[NodeSight] Session closed.");
  }

  /**
   * Encodes and sends image data for analysis.
   * @param {string} imageData - Base64 encoded image string.
   */
  sendImage(imageData) {
    if (this.ws.readyState !== WebSocket.OPEN) return;

    const payload = { 
      imageBase64: imageData.includes('base64,') ? imageData.split(',')[1] : btoa(imageData), 
      sessionId: this.sessionId,
      timestamp: Date.now()
    };
    
    this.ws.send(JSON.stringify(payload));
  }

  handleMessage({ data }) {
    try {
      const event = JSON.parse(data);
      switch(event.type) {
        case "partial": this.onPartial(event.objects); break;
        case "complete": this.onComplete(event.result); break;
        case "error": this.onError(event.message); break;
        default: console.warn("Unhandled event:", event.type);
      }
    } catch (err) {
      console.error("Parse error in WS stream:", err);
    }
  }

  close() {
    if (this.ws) this.ws.close();
  }
}
