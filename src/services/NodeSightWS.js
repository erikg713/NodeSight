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
