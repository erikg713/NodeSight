class NodeSightCluster {
  constructor() {
    this.socket = null
    this.url = process.env.REACT_APP_NODE_WS_URL || "wss://node-cluster.pinetwork.com/ws"
    this.reconnectAttempts = 0
    this.maxReconnects = 5
  }

  connect(onMessage) {
    this.socket = new WebSocket(this.url)

    this.socket.onopen = () => {
      console.log("[NodeSightCluster] Connected")
      this.reconnectAttempts = 0
    }

    this.socket.onmessage = (event) => {
      try {
        onMessage(JSON.parse(event.data))
      } catch {
        console.warn("Invalid cluster message")
      }
    }

    this.socket.onclose = () => {
      console.warn("[NodeSightCluster] Disconnected")

      if (this.reconnectAttempts < this.maxReconnects) {
        this.reconnectAttempts++

        setTimeout(() => {
          this.connect(onMessage)
        }, 2000 * this.reconnectAttempts)
      }
    }
  }

  sendUpdate(payload) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload))
    }
  }
}

export const nsCluster = new NodeSightCluster()
