import os
import json
import time
import base64
import redis
import torch
from queue import Queue
from threading import Thread
from datetime import datetime
from models.detection import detect_objects  # your YOLOv8 wrapper
from utils.ws_client import send_result  # helper to send back results to aggregator

# ----------------------------
# Redis configuration
# ----------------------------
REDIS_HOST = os.environ.get("REDIS_HOST", "redis")
REDIS_PORT = int(os.environ.get("REDIS_PORT", 6379))
REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD", None)
STREAM_NAME = os.environ.get("REDIS_STREAM_NAME", "nodesight_stream")
CONSUMER_GROUP = os.environ.get("WORKER_GROUP", "vision_workers")
CONCURRENCY = int(os.environ.get("WORKER_CONCURRENCY", 2))

r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, password=REDIS_PASSWORD, decode_responses=True)

# ----------------------------
# Job Queue
# ----------------------------
job_queue = Queue(maxsize=100)

# ----------------------------
# Worker Thread
# ----------------------------
def worker():
    while True:
        job = job_queue.get()
        if job is None:
            break

        session_id = job.get("sessionId")
        image_b64 = job.get("image")
        timestamp = job.get("timestamp", int(time.time() * 1000))

        try:
            # Decode image
            image_bytes = base64.b64decode(image_b64)
            
            # Run AI detection
            results = detect_objects(image_bytes, use_gpu=os.environ.get("USE_GPU", "true").lower() == "true")
            
            # Send partial results
            send_result(session_id, {"type": "partial", "objects": results.get("partial", [])})
            
            # Simulate complete result
            send_result(session_id, {"type": "complete", "result": results.get("full", {})})

        except Exception as e:
            send_result(session_id, {"type": "error", "message": str(e)})

        finally:
            job_queue.task_done()

# ----------------------------
# Redis Consumer
# ----------------------------
def consume_stream():
    last_id = "0-0"
    while True:
        try:
            entries = r.xread({STREAM_NAME: last_id}, block=5000, count=5)
            if not entries:
                continue

            for stream_name, messages in entries:
                for message_id, data in messages:
                    job = {k: v for k, v in zip(data[::2], data[1::2])}
                    job_queue.put(job)
                    last_id = message_id

        except redis.exceptions.ConnectionError as e:
            print(f"[Worker] Redis connection error: {e}")
            time.sleep(2)

# ----------------------------
# Start Worker Threads
# ----------------------------
threads = []
for _ in range(CONCURRENCY):
    t = Thread(target=worker)
    t.daemon = True
    t.start()
    threads.append(t)

# ----------------------------
# Start Redis Consumer
# ----------------------------
if __name__ == "__main__":
    print("[Worker] Vision worker started")
    consume_stream()
    for t in threads:
        t.join()
