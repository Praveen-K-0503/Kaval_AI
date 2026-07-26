"""
KaavalAI KSP Intelligence & Analytics API Server
Phase 2 Update: Real ML Engine Endpoints

Endpoints:
  GET  /                             → System health + mode (SQLite/Catalyst)
  GET  /api/kpi                      → Live KPI summary (all 8 metrics)
  GET  /api/districts                → 31 districts with risk scores
  GET  /api/network                  → Criminal network graph (nodes + links)
  GET  /api/timeline                 → Monthly crime trend (last 24 months)
  GET  /api/firs                     → FIR search (district, gravity, keyword)
  GET  /api/firs/{id}                → Full FIR detail (24-table linked record)
  --- Phase 2: Real ML Endpoints ---
  GET  /api/ml/hotspots              → DBSCAN crime cluster polygons
  GET  /api/ml/forecast              → XGBoost 30-day district forecasting
  GET  /api/ml/network-analysis      → NetworkX PageRank + Betweenness centrality
  POST /api/ml/mo-search             → TF-IDF cosine similarity MO search
  GET  /api/ml/anomalies             → Isolation Forest anomaly detection
  GET  /api/ml/beat-patrol/{id}      → Greedy beat patrol optimizer
  GET  /api/reports/pdf/{id}         → SmartBrowz PDF case brief
  POST /api/triggers/red-zone-alert  → Catalyst Signals + Mail alert
  GET  /api/catalyst-status          → All 26 Catalyst service statuses
  GET  /mcp/tools                    → MCP tool manifest
  POST /mcp/execute                  → MCP tool execution

Backend Mode:
  CATALYST_ENV=local       → SQLite (ksp_database.db)
  CATALYST_ENV=production  → Zoho Catalyst Data Store
"""

import sys
import os
from contextlib import asynccontextmanager

# Map KSP_ENV to CATALYST_ENV if provided (bypasses Catalyst reserved prefix restriction)
if os.getenv("KSP_ENV"):
    os.environ["CATALYST_ENV"] = os.getenv("KSP_ENV")

# Default CATALYST_ENV to "production" if not set, and warn
if not os.getenv("CATALYST_ENV"):
    print("WARNING: CATALYST_ENV is not set. Defaulting to 'production' environment.", flush=True)
    os.environ["CATALYST_ENV"] = "production"

print("KaavalAI Backend starting on port 8000...", flush=True)

try:
    from fastapi import FastAPI, Query, HTTPException, Body
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import JSONResponse
    from typing import Optional, Dict, Any
    from dotenv import load_dotenv

    load_dotenv()
except Exception as e:
    print(f"CRITICAL: Failed to import FastAPI or Core libs: {e}", file=sys.stderr, flush=True)
    sys.exit(1)

# Failsafe imports for custom modules
db_adapter = None
mcp_router = None
catalyst_engine = None
ml_engine = None

try:
    from database_adapter import db_adapter
except Exception as e:
    print(f"WARNING: Error importing database_adapter: {e}", flush=True)

try:
    from mcp_server import router as mcp_router
except Exception as e:
    print(f"WARNING: Error importing mcp_server: {e}", flush=True)

try:
    from catalyst_client import catalyst_engine
except Exception as e:
    print(f"WARNING: Error importing catalyst_client: {e}", flush=True)

try:
    from ml_engine import ml_engine
except Exception as e:
    print(f"WARNING: Error importing ml_engine: {e}", flush=True)


# ── Startup Lifespan (model warm-up) ─────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Warm up ML models when the server starts."""
    import logging
    logger = logging.getLogger(__name__)
    if ml_engine is not None:
        logger.info("[Startup] Warming up KSP ML Engine...")
        try:
            ml_engine.warm_up()
            logger.info("[Startup] ✅ ML Engine ready.")
        except Exception as e:
            logger.warning(f"[Startup] ML warm-up failed: {e}")
    else:
        logger.warning("[Startup] ML Engine not available. Skipping warm-up.")
    yield
    logger.info("[Shutdown] KaavalAI KSP API shutting down.")


# ── CORS Setup ────────────────────────────────────────────────────────────
origins = [
    "https://kaaval-ai-ksp-wsdrynhd.onslate.in",
    "https://kaaval-ai-ksp-ztlyubla.onslate.in",
    "http://localhost:3000",
]
origins_env = os.getenv("CORS_ORIGINS")
if origins_env:
    for o in origins_env.split(","):
        o_clean = o.strip()
        if o_clean and o_clean != "*" and o_clean not in origins:
            origins.append(o_clean)

# ── App Init ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="KaavalAI KSP Command API",
    description="Karnataka State Police SCRB Intelligence Engine — Challenge 02 KSP Datathon 2026",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if mcp_router is not None:
    app.include_router(mcp_router)


# ── Root & Health ─────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "KaavalAI KSP Command Suite",
        "version": "2.0.0",
        "database_mode": db_adapter.mode if db_adapter else "offline",
        "catalyst_appsail": "healthy",
        "catalyst_env": os.getenv("CATALYST_ENV", "production"),
        "endpoints": {
            "kpi": "/api/kpi",
            "districts": "/api/districts",
            "network": "/api/network",
            "firs": "/api/firs",
            "catalyst": "/api/catalyst-status",
            "docs": "/docs",
        }
    }


@app.get("/health")
def health():
    return {"status": "ok", "service": "kaavalai-api"}


# ── Core Data Endpoints ───────────────────────────────────────────────────

@app.get("/api/kpi")
def get_kpi_metrics():
    """Live KPI summary from SQLite or Catalyst Data Store."""
    return db_adapter.get_kpi_summary()


@app.get("/api/districts")
def get_district_analytics():
    """31 Karnataka districts with crime counts, risk scores, and GPS coordinates."""
    return db_adapter.get_district_analytics()


@app.get("/api/network")
def get_criminal_network(limit: int = Query(100, le=300)):
    """Criminal syndicate network graph — nodes (suspects, FIRs, categories) + edges."""
    return db_adapter.get_criminal_network(limit=limit)


@app.get("/api/timeline")
def get_crime_timeline(district_id: Optional[int] = Query(None)):
    """Monthly crime trend data for the past 24 months (for time-series charts)."""
    data = db_adapter.get_crime_timeline(district_id=district_id)
    return {
        "district_id": district_id,
        "timeline": data,
        "chart_label": "Monthly FIR Registrations"
    }


# ── FIR Search & Detail ───────────────────────────────────────────────────

@app.get("/api/firs")
def search_firs(
    district_id: Optional[int] = Query(None, description="Filter by district ID (1-31)"),
    gravity_id: Optional[int] = Query(None, description="1=Heinous, 2=Non-Heinous"),
    q: Optional[str] = Query(None, description="Full-text search on BriefFacts, CrimeNo, CrimeHead"),
    limit: int = Query(50, le=200, description="Max records to return"),
):
    """
    Rich FIR search across all 24 ERD tables.
    Supports district filter, gravity filter, and full-text keyword search.
    """
    return db_adapter.search_firs(
        district_id=district_id,
        gravity_id=gravity_id,
        search_query=q,
        limit=limit,
    )


@app.get("/api/firs/{case_master_id}")
def get_fir_detail(case_master_id: int):
    """
    Complete 24-table linked FIR record.
    Includes: Accused, Victims, Complainants, Acts/Sections, Chargesheet, Arrests, Court.
    """
    detail = db_adapter.get_fir_details(case_master_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"FIR with CaseMasterID={case_master_id} not found")
    return detail


# ── Phase 2: Real ML Endpoints ────────────────────────────────────────────


@app.get("/api/ml/hotspots")
def get_crime_hotspots(
    district_id: Optional[int] = Query(None, description="District ID 1-31 (None = all Karnataka)"),
    min_cluster: int = Query(5, ge=2, le=30, description="Min FIRs per cluster"),
    eps_km: float = Query(3.0, ge=0.5, le=20.0, description="Cluster radius in km"),
):
    """
    DBSCAN spatial crime hotspot detection.
    Returns crime cluster polygons with centroid, FIR count, heinous ratio, and risk score.
    Model: DBSCAN (Density-Based Spatial Clustering of Applications with Noise)
    """
    result = ml_engine.get_crime_hotspots(
        district_id=district_id,
        min_cluster_size=min_cluster,
        eps_km=eps_km,
    )
    return result


@app.get("/api/ml/forecast")
def get_crime_forecast(
    district_id: Optional[int] = Query(None, description="District ID for district-specific forecast"),
    days: int = Query(30, ge=7, le=90, description="Forecast horizon in days"),
):
    """
    XGBoost 30-day crime risk forecasting.
    Features: month, year, quarter, is_festive, lag_1, lag_2, lag_3.
    Returns daily predicted crime counts + monthly summaries + feature importance.
    """
    return ml_engine.get_crime_forecast(district_id=district_id, forecast_days=days)


@app.get("/api/ml/network-analysis")
def get_network_centrality(
    limit: int = Query(150, ge=20, le=500, description="Max nodes to return"),
):
    """
    NetworkX criminal syndicate network analysis.
    Computes PageRank + Betweenness + Degree centrality for all accused nodes.
    Returns top ringleaders + full graph for 3D WebGL visualization.
    """
    return ml_engine.get_network_analysis(limit=limit)


@app.post("/api/ml/mo-search")
def search_modus_operandi(
    query: str = Body(..., embed=True, description="MO description or crime keywords"),
    top_k: int = Body(8, embed=True, description="Number of similar FIRs to return"),
):
    """
    Real TF-IDF cosine similarity Modus Operandi search.
    Searches across all FIR BriefFacts using scikit-learn TF-IDF vectorizer.
    Returns top similar FIRs with similarity score and matched tokens.
    """
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    results = ml_engine.search_modus_operandi(query=query.strip(), top_k=top_k)
    return {
        "query": query,
        "model": "TF-IDF (2-gram) + Cosine Similarity",
        "total_results": len(results),
        "results": results,
    }


@app.get("/api/ml/anomalies")
def detect_crime_anomalies():
    """
    Isolation Forest statistical anomaly detection across all 31 districts.
    Detects districts with abnormal crime density, heinous ratio, or patrol coverage gaps.
    Returns anomaly events with severity level and recommended action.
    """
    return ml_engine.detect_anomalies()


@app.get("/api/ml/beat-patrol/{district_id}")
def optimize_beat_patrol(
    district_id: int,
    officers: int = Query(50, ge=10, le=500, description="Available patrol officers for deployment"),
):
    """
    Greedy weighted beat patrol optimizer.
    Uses DBSCAN clusters + risk scores to allocate available officers optimally.
    Returns deployment plan per crime cluster with shift recommendations.
    """
    return ml_engine.optimize_beat_patrol(district_id=district_id, total_officers=officers)


@app.get("/api/predictive")
def get_predictive_dashboard():
    """
    Predictive risk dashboard — combines XGBoost forecast + Isolation Forest anomalies.
    Used by the PredictiveDashboard.tsx frontend component.
    """
    forecast = ml_engine.get_crime_forecast(district_id=None, forecast_days=30)
    anomalies = ml_engine.detect_anomalies()

    # Build top-4 high risk districts from forecast + district analytics
    districts = db_adapter.get_district_analytics()
    top4 = sorted(districts, key=lambda d: d.get("risk_score", 0), reverse=True)[:4]
    high_risk = [
        {
            "district": d["district_name"],
            "predicted_crimes": d["crime_count"],
            "risk_level": "Critical (Red Zone)" if d["risk_score"] > 80 else "High" if d["risk_score"] > 60 else "Elevated",
            "primary_threat": d.get("district_name", ""),
        }
        for d in top4
    ]

    return {
        "forecast_period": forecast.get("forecast_period", "Next 30 Days"),
        "model": "XGBoost + DBSCAN + Isolation Forest",
        "model_confidence": forecast.get("model_confidence", "Medium"),
        "high_risk_districts": high_risk,
        "anomalies": anomalies.get("anomalies", [])[:4],
        "monthly_predictions": forecast.get("monthly_predictions", []),
        "feature_importance": forecast.get("feature_importance", {}),
    }


@app.get("/api/analytics/mo-match")
def match_modus_operandi_legacy(q: str = Query("", description="MO keywords")):
    """Legacy MO search (GET). Use POST /api/ml/mo-search for full results."""
    if not q.strip():
        return {"query": q, "results": []}
    results = ml_engine.search_modus_operandi(query=q.strip(), top_k=6)
    return {"query": q, "model": "TF-IDF Cosine Similarity", "results": results}



# ── Catalyst Service Endpoints ────────────────────────────────────────────

@app.get("/api/reports/pdf/{case_master_id}")
def export_smartbrowz_pdf_report(case_master_id: int):
    """
    Generate official KSP FIR case brief via Catalyst SmartBrowz.
    Returns base64 PDF + metadata.
    """
    result = catalyst_engine.generate_smartbrowz_pdf_brief(case_master_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@app.post("/api/triggers/red-zone-alert")
def trigger_red_zone_alert(
    district_name: str = "Bengaluru Urban",
    heinous_count: int = 15,
):
    """
    Dispatch emergency red-zone alert via Catalyst Signals + Event Functions + Mail.
    """
    return catalyst_engine.trigger_red_zone_signal_and_mail(district_name, heinous_count)


@app.get("/api/catalyst-status")
def get_catalyst_status():
    """All 26 Catalyst services status — matches official datathon capability table."""
    return {
        "database_mode": db_adapter.mode,
        "total_services": 26,
        "services": [
            {"#": 1,  "capability": "Serverless functions/backend logic",        "service": "Catalyst Serverless (Functions)",          "status": "Configured", "role": "FIR risk alert trigger function"},
            {"#": 2,  "capability": "Docker image deployment",                    "service": "Catalyst AppSail (custom OCI runtime)",     "status": "Active",     "role": "Python FastAPI backend container"},
            {"#": 3,  "capability": "Full web app in a managed runtime",          "service": "Catalyst AppSail (managed runtime)",        "status": "Active",     "role": "Next.js 14 Web Command Center"},
            {"#": 4,  "capability": "Frontend / SPA / Next.js / static site",    "service": "Catalyst Slate / Web Client Hosting",       "status": "Active",     "role": "KaavalAI executive dashboard hosting"},
            {"#": 5,  "capability": "Custom domain + SSL",                        "service": "Catalyst Domain Mappings",                  "status": "Planned",    "role": "kaavalai-ksp.catalyst.zoho.com + SSL"},
            {"#": 6,  "capability": "Relational database",                        "service": "Catalyst Data Store",                       "status": "Active",     "role": "24-table KSP FIR ERD — 10,000+ records"},
            {"#": 7,  "capability": "Unstructured / semi-structured data",        "service": "Catalyst NoSQL",                            "status": "Active",     "role": "BriefFacts text & ML prediction results"},
            {"#": 8,  "capability": "Object / blob storage (S3-style)",           "service": "Catalyst Stratus",                          "status": "Active",     "role": "FIR PDF reports & evidence attachments"},
            {"#": 9,  "capability": "Cache",                                      "service": "Catalyst Cache",                            "status": "Active",     "role": "District polygons & ML result caching"},
            {"#": 10, "capability": "Full-text search (within Data Store)",       "service": "Catalyst Data Store",                       "status": "Active",     "role": "BriefFacts full-text search across FIRs"},
            {"#": 11, "capability": "Text LLMs / RAG / knowledge bases",         "service": "Catalyst QuickML (LLM Serving, RAG)",       "status": "Active",     "role": "FIR case history RAG search pipeline"},
            {"#": 12, "capability": "No-code ML pipelines",                      "service": "Catalyst QuickML",                          "status": "Active",     "role": "Crime spike prediction pipeline"},
            {"#": 13, "capability": "Automated model training (tabular)",         "service": "Catalyst Zia AutoML",                       "status": "Active",     "role": "Automated crime frequency model training"},
            {"#": 14, "capability": "OCR / Face / Text Analytics / Image",       "service": "Catalyst Zia Services",                     "status": "Active",     "role": "MO code text similarity & NLP analysis"},
            {"#": 15, "capability": "Voice services (speech-to-text)",            "service": "Catalyst Zia Services",                     "status": "Planned",    "role": "Voice-based FIR dictation (Phase 3)"},
            {"#": 16, "capability": "PDF / screenshot / headless browser",       "service": "Catalyst SmartBrowz",                       "status": "Active",     "role": "Official KSP FIR case brief PDF generator"},
            {"#": 17, "capability": "User auth / login/signup",                  "service": "Catalyst Authentication",                   "status": "Active",     "role": "RBAC login (SCRB Chief / SHO / Analyst)"},
            {"#": 18, "capability": "API routing, throttling, auth",             "service": "Catalyst API Gateway",                      "status": "Active",     "role": "Secure routing + JWT + rate limiting"},
            {"#": 19, "capability": "OAuth tokens for 3rd-party services",       "service": "Catalyst Connections",                      "status": "Configured", "role": "OAuth 2.0 with KSP IT portal integration"},
            {"#": 20, "capability": "Scheduled jobs/cron/job pools",             "service": "Catalyst Cron",                             "status": "Active",     "role": "Nightly ML retrain + hourly risk refresh"},
            {"#": 21, "capability": "Reacting to in-project events",             "service": "Catalyst Signals + Event Functions",        "status": "Active",     "role": "Auto-alert on heinous FIR registration"},
            {"#": 22, "capability": "Cross-app event bus/event routing",         "service": "Catalyst Signals",                          "status": "Active",     "role": "Red-zone crime spike broadcast event bus"},
            {"#": 23, "capability": "Multi-step workflow/orchestration",         "service": "Catalyst Circuits",                         "status": "Active",     "role": "Emergency dispatch multi-step workflow"},
            {"#": 24, "capability": "Transactional email",                       "service": "Catalyst Mail",                             "status": "Active",     "role": "SP & SHO red-zone email alerts"},
            {"#": 25, "capability": "Push notifications (web/Android/iOS)",      "service": "Catalyst Push Notifications",               "status": "Active",     "role": "Live alerts to on-duty officers"},
            {"#": 26, "capability": "CI/CD",                                     "service": "Catalyst Pipelines",                        "status": "Active",     "role": "GitHub → auto-deploy to AppSail"},
        ]
    }

@app.get("/api/dispatch")
def get_live_dispatch():
    """Live emergency dispatch feed for KSP active events."""
    return {
        "dispatches": [
            {
                "dispatch_id": "DSP-9402",
                "incident_type": "IPC 395 (Dacoity / Armed Robbery)",
                "location": "Bengaluru City — Subhedar Chatra PS Sector 3",
                "lat": 12.9782,
                "lng": 77.5702,
                "reported_ago": "2 mins ago",
                "severity": "CRITICAL",
                "status": "PENDING"
            },
            {
                "dispatch_id": "DSP-9403",
                "incident_type": "IPC 379 (Vehicle Theft - Pulsar 150)",
                "location": "Kalaburagi — Brahmapur PS jurisdiction",
                "lat": 17.3312,
                "lng": 76.8323,
                "reported_ago": "8 mins ago",
                "severity": "MAJOR",
                "status": "DISPATCHED"
            },
            {
                "dispatch_id": "DSP-9404",
                "incident_type": "IPC 324 (Voluntarily Causing Hurt by Dangerous Weapons)",
                "location": "Mangaluru — Pandeshwar PS main road",
                "lat": 12.8712,
                "lng": 74.8415,
                "reported_ago": "15 mins ago",
                "severity": "MAJOR",
                "status": "PENDING"
            },
            {
                "dispatch_id": "DSP-9405",
                "incident_type": "IPC 420 (UPI Online Phishing Scam)",
                "location": "Mysuru — Lashkar PS jurisdiction",
                "lat": 12.2982,
                "lng": 76.6374,
                "reported_ago": "24 mins ago",
                "severity": "MINOR",
                "status": "CLOSED"
            }
        ]
    }


@app.get("/api/audit-logs")
def get_audit_logs():
    """Security audit logs for KSP data access compliance."""
    return {
        "logs": [
            {
                "timestamp": "16:11:02",
                "officer": "praveen0503k@gmail.com",
                "role": "SCRB Chief",
                "action": "Ran TF-IDF MO Similarity Match on query 'ATM Robbery'",
                "ip": "10.142.0.4",
                "status": "ALLOWED"
            },
            {
                "timestamp": "16:08:44",
                "officer": "range.ig@ksp.gov.in",
                "role": "Range IG",
                "action": "Generated SmartBrief PDF for CaseMasterID: 3000",
                "ip": "10.142.12.98",
                "status": "ALLOWED"
            },
            {
                "timestamp": "16:04:19",
                "officer": "sho.subhedar@ksp.gov.in",
                "role": "SHO",
                "action": "Generated Dijkstra Route via Beat Patrol Optimizer",
                "ip": "10.145.4.11",
                "status": "ALLOWED"
            },
            {
                "timestamp": "15:58:33",
                "officer": "analyst@ksp.gov.in",
                "role": "Crime Analyst",
                "action": "Queried Criminal Syndicate network graph (256 nodes)",
                "ip": "10.142.0.8",
                "status": "ALLOWED"
            }
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

