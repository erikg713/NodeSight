"""
WebSocket client helper for NodeSight workers.
Sends partial and complete results to the aggregator or WebSocket server.
"""

import os
import json
import websocket
import threading
import time

AGGREGATOR_WS_URL = os.environ.get("AGGREGATOR_WS_URL", "ws://localhost:8080")

# Persistent WebSocket connection with auto-reconnect
class WSClient:
    def __init__(self, url=AGGREGATOR_WS_URL):
        self.url = url
        self.ws = None
        self.connect_lock = threading.Lock()
        self._connect()

    def _connect(self):
        with self.connect_lock:
            if self.ws and self.ws.sock and self.ws.sock.connected:
                return

            try:
                self.ws = websocket.WebSocketApp(
                    self.url,
                    on_open=self.on_open,
                    on_error=self.on_error,
                    on_close=self.on_close
                )
                t = threading.Thread(target=self.ws.run_forever, daemon=True)
                t.start()
                time.sleep(1)  # give it a moment to connect
            except Exception as e:
                print(f"[WSClient] Connection error: {e}")
                time.sleep(2)
                self._connect()

    def on_open(self, ws):
        print(f"[WSClient] Connected to {self.url}")

    def on_error(self, ws, error):
        print(f"[WSClient] WebSocket error: {error}")

    def on_close(self, ws, close_status_code, close_msg):
        print(f"[WSClient] WebSocket closed: {close_status_code} {close_msg}")
        time.sleep(2)
        self._connect()

    def send_result(self, session_id, payload):
        try:
            message = {"sessionId": session_id, "payload": payload}
            if self.ws and self.ws.sock and self.ws.sock.connected:
                self.ws.send(json.dumps(message))
            else:
                print(f"[WSClient] WS not connected, retrying: {message}")
                self._connect()
        except Exception as e:
            print(f"[WSClient] Failed to send message: {e}")
            self._connect()

# Singleton instance
ws_client = WSClient()

def send_result(session_id, payload):
    ws_client.send_result(session_id, payload)
