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
