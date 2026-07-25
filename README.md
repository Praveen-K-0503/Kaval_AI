# ⚔️ KaavalAI — Karnataka State Police AI Intelligence Suite

> **KSP Datathon 2026 · Challenge 02 · Team:** Praveen K (praveen0503k@gmail.com)  
> **Catalyst Project:** KaavalAI-KSP · Project ID: `56816000000013052`

---

## 🚀 What This Does

KaavalAI is a **real-time AI-powered crime analytics command center** for Karnataka State Police (KSP), built on Zoho Catalyst. It transforms raw FIR data into actionable intelligence using:

| Feature | Technology |
|---|---|
| 30-Day Crime Forecast | XGBoost + Lag Features |
| Spatial Hotspot Detection | DBSCAN (Haversine metric) |
| Criminal Network Analysis | NetworkX PageRank + Betweenness Centrality |
| MO (Modus Operandi) Search | TF-IDF 2-gram Cosine Similarity |
| Anomaly Detection | Isolation Forest (contamination=0.10) |
| Beat Patrol Optimization | Greedy Weighted Cluster Assignment |
| Backend | FastAPI + Zoho Catalyst Data Store |
| Frontend | Next.js 14 App Router |
| Deployment | Zoho Catalyst AppSail + Slate |

---

## 📁 Pages

| Route | Description |
|---|---|
| `/` | Command Center — KPI bar, crime map, network graph, AI dashboard |
| `/firs` | FIR Registry — Search all 10,000+ FIRs by keyword/district/gravity |
| `/firs/[id]` | FIR Detail — 24-table linked record (accused, victims, acts, arrests) |
| `/analytics` | ML Analytics — XGBoost forecast, Isolation Forest, DBSCAN deep dive |
| `/network` | 3D Criminal Network — WebGL graph with ringleader detection |
| `/beat-patrol` | Beat Patrol Optimizer — Officer deployment by risk cluster |
| `/login` | Secure Login — RBAC (SCRB Chief / SP / SHO / Analyst) |

---

## 🛠️ Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
python synthetic_data_generator.py   # Generate 10K synthetic KSP FIRs
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
npm install
npm run dev
# → http://localhost:3000
```

### Catalyst CLI (for cloud deployment)
```bash
npm install -g zcatalyst-cli
catalyst login    # Login with praveen0503k@gmail.com
catalyst init     # Select KaavalAI-KSP project
python backend/create_catalyst_tables.py   # Create 15 Data Store tables
python backend/seed_to_catalyst.py        # Push 10K records to cloud
```

---

## 🤖 ML Engine Endpoints

| Endpoint | Model | Description |
|---|---|---|
| `GET /api/ml/hotspots` | DBSCAN | Spatial crime cluster polygons |
| `GET /api/ml/forecast` | XGBoost | 30-day daily crime prediction |
| `GET /api/ml/network-analysis` | NetworkX | PageRank + centrality scores |
| `POST /api/ml/mo-search` | TF-IDF | MO cosine similarity search |
| `GET /api/ml/anomalies` | Isolation Forest | Statistical anomaly detection |
| `GET /api/ml/beat-patrol/{id}` | Greedy Optimizer | Officer patrol allocation |
| `GET /api/predictive` | Combined | Dashboard summary endpoint |

---

## ☁️ Catalyst Services Used

- **AppSail** — Managed Docker runtime (Next.js + FastAPI)
- **Slate** — Static frontend hosting
- **Data Store** — 15-table relational KSP FIR database
- **Authentication** — RBAC login (5 officer roles)
- **API Gateway** — Secure routing + CORS
- **Signals** — Real-time red-zone alerts
- **Mail** — Automated emergency notifications
- **Cron** — Nightly ML model retraining
- **Cache** — ML result caching
- **SmartBrowz** — PDF case brief generation

---

## 📊 Dataset

Synthetic KSP dataset with 10,000 FIRs across 31 Karnataka districts, based on the official KSP Datathon ERD schema (26 normalized tables).

---

*Built for KSP Datathon 2026 · Powered by Zoho Catalyst · Challenge 02*
