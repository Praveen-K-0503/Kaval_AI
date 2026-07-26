import json
import os
from datetime import datetime

def nightly_ml_refresh(context, basic_io):
    """
    Cron function: Re-trains ML models with latest FIR data.
    Catalyst Cron expression: 0 19 * * * (19:30 UTC = 01:00 IST)
    """
    import urllib.request
    import urllib.error

    api_base = os.environ.get("KAAVALAI_API_URL", "https://kaavalai-backend-50044342834.development.catalystappsail.in")
    endpoints = [
        "/api/ml/hotspots?eps_km=3",
        "/api/ml/forecast?days=30",
        "/api/ml/anomalies",
    ]
    results = {}
    for ep in endpoints:
        try:
            req = urllib.request.Request(f"{api_base}{ep}")
            with urllib.request.urlopen(req, timeout=60) as r:
                results[ep] = "ok"
        except Exception as e:
            results[ep] = f"error: {e}"

    print(json.dumps({
        "function": "nightly_ml_refresh",
        "timestamp": datetime.utcnow().isoformat(),
        "results": results
    }))
    basic_io.write(json.dumps({"status": "ok", "refreshed": list(results.keys())}))
