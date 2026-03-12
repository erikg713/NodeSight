import os
import json
import time
import base64
import redis
from queue import Queue
from threading import Thread
from utils.ws_client import send_result
from utils.preprocess import decode_image
from PIL import Image
import pytesseract  # OCR engine

# ----------------------------
# Redis configuration
# ----------------------------
REDIS_HOST = os.environ.get("REDIS_HOST", "redis")
REDIS_PORT = int(os.environ.get("REDIS_PORT", 6379))
REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD", None)
STREAM_NAME = os.environ.get("REDIS_STREAM_NAME", "nodesight_stream")
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

        try:
            # Decode image
            image_bytes = base64.b64decode(image_b64)
            image = decode_image(image_bytes)  # returns PIL Image

            # OCR extraction
            text = pytesseract.image_to_string(image)

            # Send partial result
            send_result(session_id, {"type": "partial", "text": text[:50]})  # first 50 chars

            # Send complete result
            send_result(session_id, {"type": "complete", "text": text})

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
            print(f"[TextWorker] Redis connection error: {e}")
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
    print("[TextWorker] Text worker started")
    consume_stream()
    for t in threads:
        t.join()
