# NodeSight

**NodeSight** is the distributed threat-monitoring layer of PiGuard. It observes system activity, analyzes suspicious behavior, and streams intelligence to the PiGuard security engine in real time.

NodeSight runs alongside backend services and collects signals such as:

* suspicious API usage
* abnormal request patterns
* scam message detection
* IP-level anomalies
* fraud scoring events

These signals are processed by the PiGuard AI engine and surfaced on the security dashboard.

---

# Architecture

NodeSight operates as a **local monitoring node** that feeds security telemetry into the PiGuard fraud intelligence system.

```
Client Activity
      ↓
NodeSight Monitoring Node
      ↓
PiGuard Fraud Engine
      ↓
AI Detection Pipeline
      ↓
Security Dashboard
```

NodeSight can be deployed on:

* backend servers
* API gateways
* edge nodes
* monitoring containers

---

# Features

**Real-Time Threat Monitoring**

Streams security events to PiGuard.

**Fraud Signal Aggregation**

Collects and forwards suspicious activity such as:

* repeated login attempts
* phishing messages
* wallet verification scams
* API abuse

**Distributed Security Nodes**

Multiple NodeSight instances can run simultaneously and report to the same PiGuard backend.

**AI-Ready Telemetry**

All signals are formatted for direct processing by the PiGuard AI modules.

---

# Project Structure

```
nodesight/
│
├── collectors/        # activity collection modules
├── detectors/         # anomaly detection hooks
├── transport/         # event streaming
├── config/            # node configuration
├── nodesight.py       # main node runner
└── README.md
```

---

# Installation

## Requirements

* Python 3.9+
* Node.js backend running PiGuard
* AI engine enabled

Install dependencies:
```
pip install -r backend/requirements.txt
pip install node backend/server.js
```

---

# Running NodeSight

Start a monitoring node:

```bash
python nodesight.py
```

By default the node will connect to the PiGuard backend:

```
http://localhost:8000
```

You can change this in the configuration file.

---

# Example Event

Example telemetry sent to PiGuard:

```json
{
  "timestamp": "2026-03-12T18:32:00Z",
  "event_type": "fraud_detection",
  "uid": "pi_user_123",
  "ip": "192.168.1.10",
  "risk": "high",
  "score": 87,
  "reason": "AI detected phishing pattern"
}
```

---

# Integration with PiGuard

NodeSight feeds events into the PiGuard AI engine:

```
NodeSight
   ↓
Fraud Detection Engine
   ↓
Embedding Analysis
   ↓
Scam Pattern Detection
   ↓
Dashboard Alert
```

Modules involved:

```
engine/
├── les_transform.py
├── lens_decoder.py
├── scam_pattern_engine.py
├── temporal_seed.py
└── identity_token.py
```

---

# Security Model

NodeSight uses signed identity tokens to prevent spoofed telemetry.

```
NodeSight
   ↓
Identity Token Engine
   ↓
Verified Security Event
```

This ensures only trusted nodes can submit events.

---

# License

MIT License

---

