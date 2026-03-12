import os
import json
import time
import base64
import redis
from queue import Queue
from threading import Thread
from utils.ws_client import send_result
from utils.preprocess import decode_image
from models.detection import detect_objects  # YOLOv8 or other model

# ----------------------------
# Redis configuration
# ----------------------------
REDIS_HOST = os.environ.get("REDIS_HOST", "redis")
REDIS_PORT = int(os.environ.get("REDIS_PORT", 6379))
REDIS_PASSWORD = os.environ.get("REDIS_PASSWORD", None)
STREAM_NAME = os.environ.get("REDIS_STREAM_NAME", "nodesight_stream")
CONCURRENCY = int(os.environ.get("WORKER_CONCURRENCY", 2))
BATCH_SIZE = int(os.environ.get("BATCH_SIZE", 4))  # number of images per batch

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
        batch = []
        while len(batch) < BATCH_SIZE:
            try:
                job = job_queue.get(timeout=2)
                batch.append(job)
            except:
                break  # no more jobs immediately available

        if not batch:
            continue

        try:
            images = []
            session_ids = []

            for job in batch:
                session_ids.append(job.get("sessionId"))
                image_bytes = base64.b64decode(job.get("image"))
                img = decode_image(image_bytes)  # PIL.Image
                images.append(img)

            # Run batch inference
            results_batch = detect_objects(images, use_gpu=os.environ.get("USE_GPU", "true").lower() == "true")

            # Send results
            for i, session_id in enumerate(session_ids):
                partial = results_batch[i].get("partial", [])
                full = results_batch[i].get("full", {})

                send_result(session_id, {"type": "partial", "objects": partial})
                send_result(session_id, {"type": "complete", "result": full})

        except Exception as e:
            for job in batch:
                send_result(job.get("sessionId"), {"type": "error", "message": str(e)})

        finally:
            for _ in batch:
                job_queue.task_done()

# ----------------------------
# Redis Consumer
# ----------------------------
def consume_stream():
    last_id = "0-0"
    while True:
        try:
            entries = r.xread({STREAM_NAME: last_id}, block=5000, count=10)
            if not entries:
                continue

            for stream_name, messages in entries:
                for message_id, data in messages:
                    job = {k: v for k, v in zip(data[::2], data[1::2])}
                    job_queue.put(job)
                    last_id = message_id

        except redis.exceptions.ConnectionError as e:
            print(f"[BatchWorker] Redis connection error: {e}")
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
    print("[BatchWorker] Batch worker started")
    consume_stream()
    for t in threads:
        t.join()
