# ⚔️ KaavalAI — Karnataka State Police Operational Intelligence & Analytics Platform

> **KSP Datathon 2026 · Challenge 02 · Team:** Praveen K (praveen0503k@gmail.com)  
> **Zoho Catalyst Project:** `KaavalAI-KSP` (Project ID: `56816000000013052` · Org ID: `60080028417`)  
> 🌐 **Live Slate Frontend Portal:** [https://kaval-ai-bptxfxwh.onslate.in](https://kaval-ai-bptxfxwh.onslate.in)  
> ⚙️ **Live AppSail Backend Container:** [https://kaavalai-production-api-50044342834.development.catalystserverless.in](https://kaavalai-production-api-50044342834.development.catalystserverless.in)

---

## 🎯 Executive Overview

KaavalAI is an enterprise-grade, data-driven operational intelligence command suite for the **Karnataka State Police (KSP)**. Built natively on **Zoho Catalyst**, it transforms preseeded FIR databases into live, dynamic analytics, predictive crime risk maps, criminal syndicate graphs, and automated evidence management workflows.

---

## 🚀 Key Modules & Capabilities

| Module | Core Technology | Description |
|---|---|---|
| **30-Day Crime Risk Forecast** | XGBoost + Spatiotemporal Lags | Computes daily crime trends and monthly district risk forecasts. |
| **Spatial Hotspot Detection** | DBSCAN (Haversine Distance) | Identifies crime density cluster polygons and high-gravity zones. |
| **Syndicate Network Analysis** | NetworkX (PageRank & Betweenness) | Uncovers criminal ringleaders and multi-node syndicate links. |
| **Modus Operandi (MO) Search** | TF-IDF (2-gram) + Cosine Similarity | Matches crime MO descriptions against historical FIR facts. |
| **Anomaly Detector** | Isolation Forest (`contamination=0.10`) | Flags statistical crime spikes and patrol gaps across 31 districts. |
| **Beat Patrol Optimizer** | Dijkstra Weighted Allocator | Optimizes patrol beat distribution based on active risk clusters. |
| **Evidence Store** | Catalyst Stratus File Store | Drag-and-drop evidence upload (Photos, Videos, PDFs) with metadata tracking. |
| **PDF Case Briefs** | Catalyst SmartBrowz Engine | Compiles official KSP investigation briefs with analytical intel into downloadable PDFs. |
| **Real-time Alerts** | WebSockets + Signals + Mail | Thread-safe WebSocket broadcaster pushing live updates to active command clients. |

---

## 📁 Application Routing Architecture

| Route | Access Level | Description |
|---|---|---|
| `/` | **Public** | Modern Landing Page showcasing KaavalAI features, architecture, and technology stack. |
| `/command-center` | **Protected** | Main Operational Command Center dashboard with live KPI counters, maps, and graphs. |
| `/login` | **Public** | JWT Security Portal supporting role login & **Catalyst Hosted Single Sign-On**. |
| `/firs` | **Protected** | FIR Case Registry with full CRUD operations and evidence attachment drawers. |
| `/firs/[id]` | **Protected** | Full 24-table linked FIR record details (Accused, Victims, Acts, Officers). |
| `/analytics` | **Protected** | ML Predictors dashboard featuring XGBoost, Isolation Forest, and DBSCAN clusters. |
| `/network` | **Protected** | Interactive 3D criminal syndicate network visualization. |
| `/beat-patrol` | **Protected** | Greedy beat patrol optimizer for station house officers. |
| `/admin` | **Admin Only** | System Telemetry Console displaying AppSail health, active users, WS links, and storage bytes. |

---

## ☁️ Zoho Catalyst Native Integration Matrix

All 15 Catalyst services are configured and verified with live runtime tests:

- **AppSail** — Managed container runtime serving FastAPI backend (`kaavalai-production-api`).
- **Slate** — Frontend web hosting (`kaval-ai-bptxfxwh.onslate.in`).
- **Data Store** — 26 relational ERD SQL tables housing 3,000+ preseeded KSP FIR records.
- **Authentication** — Hosted SSO Portal link (`/__catalyst/auth/login`) + JWT HS256 role-based security.
- **Stratus** — File Store managing evidence file uploads (Photos, Videos, Forensic PDFs).
- **SmartBrowz** — Headless browser engine generating official compiled PDF case reports (`/api/report/generate`).
- **Functions** — Python 3.9 serverless functions (`nightly_ml_refresh`, `red_zone_alert`, `weekly_summary_report`).
- **Signals** — Emergency event dispatcher for red-zone crime spikes (`RED_ZONE_CRIME_SPIKE`).
- **Mail** — Emergency notification trigger (`zcatalyst_sdk.email`).
- **Cron** — Scheduled nightly ML retraining pipeline (`00:00 UTC`).
- **API Gateway** — Secure routing, throttling, and CORS origin validation.
- **WebSockets** — Thread-safe asyncio live event broadcaster (`/ws/updates`).

---

## 🛠️ Local Development & Execution

### 1. Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000
# → Live API Docs: http://localhost:8000/docs
```

### 2. Frontend (Next.js 14)
```bash
npm install
npm run dev
# → Local App Portal: http://localhost:3000
```

### 3. Automated Verification & Audit Suite
```bash
cd backend
python -u run_full_audit.py              # System & ML verification audit
python -u verify_all_catalyst_services.py # Comprehensive 15-service runtime verification
```

---

## 🔒 Production Hardening Features

- **Rate Limiting Middleware:** Blocks requests exceeding 120 req/min per IP.
- **Kubernetes Probes:** `/health/liveness` & `/health/readiness` endpoints.
- **Global Error Handling:** Intercepts unhandled exceptions returning clean JSON error bodies.
- **Thread-Safe WebSocket Scheduler:** `asyncio.run_coroutine_threadsafe` avoids threadpool event loop crashes.

---

*Built for KSP Datathon 2026 · Challenge 02 · Powered by Zoho Catalyst & FastAPI*
