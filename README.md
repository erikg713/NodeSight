# 🛡️ NodeSight: Distributed AI Intelligence Cluster

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/erikg713/NodeSight/blob/main/LICENSE)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Docker Support](https://img.shields.io/badge/Docker-Supported-2496ED.svg)](https://www.docker.com/)

An enterprise-grade, distributed AI image analysis and threat-monitoring system designed for the Pi Network ecosystem. NodeSight leverages a microservices architecture to deliver high-speed visual inference, OCR, and behavioral analysis across a cluster of specialized compute nodes with minimal latency and maximum scalability.

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Deployment Guide](#deployment-guide)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

### Use Cases

NodeSight addresses critical challenges in distributed AI processing:

- **Real-time Threat Detection**: Analyze images for suspicious content with millisecond response times
- **OCR Processing**: Extract and validate text from documents and user-submitted content
- **Behavioral Analysis**: Monitor for fraudulent patterns and anomalies across the network
- **Edge Optimization**: Reduce bandwidth by preprocessing at the client level before worker processing

### Why Pi Network?

Built natively for the Pi Network's distributed consensus model, NodeSight integrates Pi SDK authentication and leverages Pioneer devices as lightweight compute nodes, creating a truly decentralized AI intelligence layer.

---

## 🏗️ System Architecture

NodeSight implements a three-tier distributed architecture optimized for low-latency, high-throughput processing:

### Layer 1: Client (React Frontend)

- **Initial compression** of images using client-side TensorFlow.js
- **Edge-side inference** for lightweight models (classification, quick filtering)
- **Bandwidth optimization** by transmitting compressed/partial results
- **Real-time feedback** via WebSocket connections

### Layer 2: Gateway (Node.js API Server)

- Central traffic controller orchestrating all distributed operations
- **Pi SDK Authentication** for Pioneer authorization
- **WebSocket Stream Management** for bi-directional communication
- **Load balancing** across available worker nodes
- **Security enforcement** including rate limiting and input validation
- **Result aggregation** merging edge and worker-processed intelligence

### Layer 3: Workers (Python/TensorFlow Cluster)

- **Headless compute nodes** pulling tasks from Redis queue
- Specialized workers: Vision (MobileNet/YOLO), OCR (Tesseract/PaddleOCR), Batch Processing
- **Horizontal scaling**: Add/remove workers without gateway restart
- **Independent model updates** per worker type

### Data Flow

```
Client (Image Upload)
  ↓ [Compress + Edge Inference]
  ↓ [WebSocket → Gateway]
Gateway [Validate, Load Balance]
  ↓ [Push to Redis Queue]
  ↓
Workers [Process in Parallel]
  ↓ [Redis Result Storage]
  ↓ [Stream Results Back]
Client [Display Final Intelligence]
```

---

## Prerequisites

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 4GB | 16GB+ |
| CPU Cores | 2 | 8+ |
| Disk Space | 10GB | 50GB+ |
| OS | Linux/macOS | Ubuntu 20.04 LTS+ |

### Required Software

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **Python**: 3.11+ ([Download](https://www.python.org/downloads/))
- **Docker**: 20.10+ and Docker Compose 2.0+ ([Install](https://docs.docker.com/get-docker/))
- **Redis**: 7.0+ (included in Docker setup)
- **Git**: 2.30+

### API Keys & Credentials

- Pi Network Platform API Key (obtain from [Pi Developer Portal](https://developers.minepi.com/))
- Redis connection credentials (auto-configured with Docker)

---

## 📂 Project Structure

```
NodeSight/
├── backend/
│   ├── gateway/
│   │   ├── server.js              # Express + Socket.io entry point
│   │   ├── middleware/            # Auth, rate limiting, CORS
│   │   ├── controllers/           # Request handlers
│   │   └── package.json
│   ├── workers/
│   │   ├── vision_worker.py       # MobileNet/YOLO inference
│   │   ├── text_worker.py         # Tesseract/PaddleOCR processing
│   │   ├── batch_worker.py        # Non-realtime fraud analysis
│   │   ├── requirements.txt
│   │   └── config.yaml
│   ├── models/
│   │   ├── detection.py           # Vision model orchestration
│   │   ├── ocr_engine.py          # OCR pipeline
│   │   └── preloaded/             # Model weights
│   ├── services/
│   │   ├── queue.py               # Redis queue manager
│   │   ├── aggregator.js          # Result merging logic
│   │   └── logger.js              # Centralized logging
│   └── utils/
│       ├── nodeDistributor.js     # Load balancer
│       ├── validators.js          # Input validation
│       └── helpers.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CameraCapture.js   # Image input component
│   │   │   ├── ResultDisplay.js   # Intelligence visualization
│   │   │   └── StatusMonitor.js   # Cluster health dashboard
│   │   ├── services/
│   │   │   ├── NodeSightWS.js     # WebSocket manager
│   │   │   ├── ImageCompressor.js # Client-side optimization
│   │   │   └── apiClient.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── Dockerfile.gateway
├── Dockerfile.worker
├── .env.example
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── README.md
└── LICENSE
```

---

## 🛠️ Tech Stack

### Frontend
- **React** 18+ with Hooks & Context API
- **TensorFlow.js** for edge-side ML inference
- **Socket.io Client** for real-time WebSocket communication
- **Lucide Icons** for UI components

### Gateway (API Server)
- **Node.js** 18+ runtime
- **Express** 4.18+ for HTTP routing
- **Socket.io** 4.5+ for bi-directional communication
- **Redis Client** for queue/cache management

### AI Workers
- **Python** 3.11+ interpreter
- **TensorFlow** 2.13+ for vision models
- **PyTorch** 2.0+ alternative for specialized models
- **Tesseract/PaddleOCR** for text extraction

### Infrastructure
- **Docker** containerization
- **Docker Compose** multi-container orchestration
- **Redis** 7.0+ message broker & caching

### DevOps & Monitoring
- **GitHub Actions** for CI/CD
- **Prometheus** metrics collection
- **ELK Stack** optional centralized logging

---

## 🚀 Deployment Guide

### Option 1: Docker Compose (Recommended - Production Ready)

#### Step 1: Clone & Configure
```bash
git clone https://github.com/erikg713/NodeSight.git
cd NodeSight
cp .env.example .env
```

#### Step 2: Edit Environment Variables
```bash
nano .env
```

Required variables:
```env
PI_API_KEY=your_pi_network_api_key
PI_API_SECRET=your_pi_network_secret
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_password
NODE_ENV=production
LOG_LEVEL=info
```

#### Step 3: Deploy Cluster
```bash
docker-compose up --build -d
```

#### Step 4: Verify Deployment
```bash
# Check running containers
docker-compose ps

# View gateway logs
docker-compose logs -f gateway

# Health check endpoint
curl http://localhost:3000/health
```

**Expected Output:**
```json
{
  "status": "healthy",
  "workers_connected": 3,
  "redis_status": "connected",
  "uptime_seconds": 45
}
```

---

### Option 2: Manual Setup (Development/Testing)

#### Prerequisites Setup
```bash
# Install Node.js dependencies (Global)
node --version  # Verify v18+
npm --version

# Install Python packages (Global)
python3 --version  # Verify 3.11+
pip --version

# Start Redis (Local or Docker)
docker run -d -p 6379:6379 redis:7-alpine
```

#### Start Gateway Server
```bash
cd backend/gateway
npm install
npm run dev
# Expected: Gateway listening on http://localhost:3000
```

#### Start Vision Worker (New Terminal)
```bash
cd backend/workers
pip install -r requirements.txt
python vision_worker.py --worker-id=vision-1
# Expected: Connected to Redis, waiting for tasks...
```

#### Start OCR Worker (New Terminal)
```bash
cd backend/workers
python text_worker.py --worker-id=ocr-1
# Expected: OCR worker initialized, listening for queue jobs...
```

#### Start Frontend (New Terminal)
```bash
cd frontend
npm install
npm run dev
# Expected: Running on http://localhost:3001
```

---

## 📡 API Endpoints

### Gateway Health & Status

#### GET `/health`
Returns system health and connected worker count.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-03T14:23:45Z",
  "workers": {
    "vision": 3,
    "ocr": 2,
    "batch": 1
  },
  "queue_size": 12,
  "redis_latency_ms": 2
}
```

---

### Image Analysis

#### POST `/api/analyze`
Submit image for multi-stage analysis.

**Request:**
```json
{
  "image_base64": "iVBORw0KGgoAAAANS...",
  "analysis_type": "full",
  "priority": "high"
}
```

**Response:**
```json
{
  "request_id": "req_abc123xyz",
  "status": "processing",
  "estimated_time_ms": 1200,
  "streaming_url": "ws://localhost:3000/stream/req_abc123xyz"
}
```

---

#### WebSocket `/stream/:request_id`
Real-time result streaming.

**Incoming Messages:**
```json
{
  "event": "vision_complete",
  "data": {
    "objects_detected": ["phone", "wallet"],
    "confidence_scores": [0.94, 0.87]
  }
}
```

```json
{
  "event": "ocr_complete",
  "data": {
    "text_extracted": "VISA 4532...",
    "risk_score": 0.78
  }
}
```

---

### Worker Management

#### GET `/api/workers/status`
List connected workers and their load.

**Response:**
```json
{
  "workers": [
    {
      "id": "vision-1",
      "type": "vision",
      "status": "idle",
      "tasks_completed": 1243,
      "avg_processing_time_ms": 145
    },
    {
      "id": "ocr-2",
      "type": "ocr",
      "status": "busy",
      "current_task": "req_xyz789",
      "tasks_completed": 856
    }
  ]
}
```

---

#### POST `/api/workers/scale`
Dynamically adjust worker count (Docker only).

**Request:**
```json
{
  "worker_type": "vision",
  "desired_count": 5
}
```

**Response:**
```json
{
  "action": "scaling_initiated",
  "worker_type": "vision",
  "current": 3,
  "target": 5
}
```

---

## 🔧 Troubleshooting

### Issue: Gateway Cannot Connect to Redis

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:**
```bash
# Check Redis status
docker ps | grep redis

# If not running, restart Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Update .env with correct Redis host
REDIS_HOST=localhost  # If running locally
# or
REDIS_HOST=redis      # If running in Docker Compose
```

---

### Issue: Workers Not Picking Up Tasks

**Symptoms:**
```
Queue size: 15, but workers idle
```

**Debug Steps:**
```bash
# 1. Check worker logs
docker-compose logs worker-vision-1

# 2. Verify Redis queue
redis-cli
> LLEN task_queue
> LRANGE task_queue 0 5

# 3. Restart workers
docker-compose restart worker-vision-1 worker-ocr-1

# 4. Monitor worker connectivity
curl http://localhost:3000/api/workers/status
```

---

### Issue: High Memory Usage in Workers

**Symptoms:**
```
Memory usage: 85-95%
```

**Solution:**
```bash
# Reduce concurrent tasks per worker
export MAX_CONCURRENT_TASKS=2

# Restart workers with new limit
docker-compose down
docker-compose up -d

# Monitor memory
docker stats
```

---

### Issue: WebSocket Connection Drops

**Symptoms:**
```
WebSocket disconnected after 30-60 seconds
```

**Fix:**
```bash
# Increase ping interval in .env
WEBSOCKET_PING_INTERVAL=25000  # 25 seconds

# Verify firewall rules
ufw allow 3000

# Check gateway logs for errors
docker-compose logs gateway | grep -i websocket
```

---

## 🤝 Contributing

### Getting Started

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/NodeSight.git
   cd NodeSight
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/add-new-capability
   ```

3. **Set Up Development Environment**
   ```bash
   # Install pre-commit hooks
   pip install pre-commit
   pre-commit install
   
   # Run tests
   npm run test:backend
   python -m pytest tests/
   ```

4. **Make Changes & Test Locally**
   ```bash
   # Run linters
   npm run lint
   python -m pylint backend/workers/

   # Run tests
   npm run test
   pytest tests/ -v
   ```

5. **Commit with Clear Messages**
   ```bash
   git commit -m "feat(vision): add YOLO v8 support for faster detection"
   ```

6. **Push & Create Pull Request**
   ```bash
   git push origin feature/add-new-capability
   ```

### Code Standards

- **Python**: Follow PEP 8, use type hints, min 80% coverage
- **JavaScript**: ESLint + Prettier configured, min 80% coverage
- **Git**: Conventional Commits format required
- **Documentation**: Update README if adding features

### Reporting Bugs

Submit issues with:
- Minimal reproducible example
- System information (OS, versions)
- Error logs and stack traces
- Expected vs. actual behavior

---

## 📜 License

Licensed under the MIT License - see [LICENSE](https://github.com/erikg713/NodeSight/blob/main/LICENSE) for details.

Created by Erik Gordon ([@erikg713](https://github.com/erikg713))

---

## 📚 Additional Resources

- [Pi Network Documentation](https://developers.minepi.com/)
- [TensorFlow.js Guide](https://www.tensorflow.org/js)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Socket.io Documentation](https://socket.io/docs/)

---

**Last Updated**: April 3, 2026 | **Status**: Production Ready ✅