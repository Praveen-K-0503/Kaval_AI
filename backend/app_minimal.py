"""Minimal KaavalAI AppSail test — no heavy imports"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os, datetime

app = FastAPI(title="KaavalAI KSP Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "operational",
        "service": "KaavalAI KSP Intelligence API",
        "version": "1.0.0",
        "timestamp": datetime.datetime.now().isoformat(),
        "port": os.getenv("PORT", "8080"),
    }

@app.get("/health")
def health():
    return {"status": "healthy", "service": "kaavalai-backend"}

@app.get("/api/kpi")
def kpi():
    return {
        "total_firs": 3420,
        "heinous_offences": 412,
        "accused_profiles": 2890,
        "police_stations": 21,
        "active_red_zones": 6,
        "predictive_risk_index": 78.4
    }
