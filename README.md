🛡️ NodeSight: Distributed AI Intelligence Cluster
NodeSight is an enterprise-grade, distributed AI image analysis and threat-monitoring system designed for the Pi Network. It utilizes a microservices architecture to perform high-speed visual inference, OCR, and behavioral analysis across a cluster of specialized nodes.

🏗️ System Architecture
The system is split into three distinct layers to ensure low latency and high scalability:

Client (React Frontend): Performs initial image compression and edge-side partial results using TensorFlow.js.

Gateway (Node.js): The central traffic controller. It authenticates Pioneers via the Pi SDK, manages WebSocket streams, and enforces the security model.

Workers (Python/TensorFlow): Headless nodes that pull heavy workloads (Vision, OCR, Batch) from a Redis queue and return processed intelligence.

📂 Project Structure
🛰️ Backend Core
gateway/server.js: High-concurrency entry point for WebSockets and API requests.

models/: Orchestrates local AI logic, including detection.py and specialized OCR/Vision models.

queue/redis.js: Connectivity logic for the message broker (Redis).

services/aggregator.js: Merges partial edge results with deep worker results into a final intelligence stream.

utils/nodeDistributor.js: Load-balances tasks across available worker nodes.

🧠 AI Workers
vision_worker.py: Dedicated computer vision node (MobileNet/YOLO).

text_worker.py: Specialized OCR node for document and scam message analysis.

batch_worker.py: High-throughput processor for non-real-time fraud signal analysis.

📱 Frontend (React)
components/: Modular UI including CameraCapture.js and real-time result streaming views.

services/NodeSightWS.js: Manages the bi-directional WebSocket handshake with the Gateway.

services/ImageCompressor.js: Optimizes image blobs before transmission to save bandwidth.

🐳 Containerization & Orchestration
NodeSight is designed to be deployed as a Dockerized cluster.

Dockerfile.gateway: Lightweight Node.js environment for the API and WebSocket server.

Dockerfile.worker: Heavyweight Python environment pre-loaded with ML libraries and models.

docker-compose.yml: Orchestrates the Gateway, Workers, and Redis instances.

🚀 Deployment Guide
1. Environment Configuration
Copy .env.example to .env and configure your Pi Network Platform keys and Redis credentials.

2. Launch via Docker (Recommended)
Bash
docker-compose up --build -d
3. Manual Setup (Development)
Start the Gateway:

Bash
cd backend/gateway && npm install && node server.js
Start a Vision Worker:

Bash
cd backend/workers && pip install -r requirements.txt && python vision_worker.py
🛠️ Tech Stack
Frontend: React, TensorFlow.js, Lucide Icons

Gateway: Node.js, Express, Socket.io

Queue: Redis

Workers: Python 3.11, Flask, TensorFlow/PyTorch

DevOps: Docker, Docker Compose

📜 License & Acknowledgments
Created by Erik Gordon (@erikg713)
