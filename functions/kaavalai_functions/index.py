"""
KaavalAI — Catalyst Serverless Functions
Phase 3 Integration: Cron Jobs, Signals, Mail

Deploy to Catalyst Serverless via:
  catalyst deploy --only functions
"""
import json
import os
from datetime import datetime, timedelta

# ─────────────────────────────────────────────────────────────────────────────
# HANDLER 1: Nightly ML Refresh (Cron — runs at 01:00 AM IST every night)
# ─────────────────────────────────────────────────────────────────────────────
def nightly_ml_refresh(context, basic_io):
    """
    Cron function: Re-trains ML models with latest FIR data.
    Catalyst Cron expression: 0 19 * * *  (19:30 UTC = 01:00 IST)
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
                results[ep] = json.loads(r.read())["status"] if "status" in json.loads(r.read()) else "ok"
        except Exception as e:
            results[ep] = f"error: {e}"

    print(json.dumps({
        "function": "nightly_ml_refresh",
        "timestamp": datetime.utcnow().isoformat(),
        "results": results
    }))
    basic_io.write(json.dumps({"status": "ok", "refreshed": list(results.keys())}))


# ─────────────────────────────────────────────────────────────────────────────
# HANDLER 2: Red Zone Alert (Catalyst Signals trigger)
# ─────────────────────────────────────────────────────────────────────────────
def red_zone_alert(context, basic_io):
    """
    Triggered by Catalyst Signals when anomaly risk_score > 75.
    Sends email via Catalyst Mail to district SP.
    """
    try:
        import zcatalyst_sdk as catalyst
        app = catalyst.initialize(context)

        # Read signal payload
        payload = json.loads(basic_io.read() or "{}")
        district = payload.get("district", "Unknown")
        risk_score = payload.get("risk_score", 0)
        anomaly_id = payload.get("anomaly_id", "ANOM-UNKNOWN")
        description = payload.get("description", "")

        if risk_score < 75:
            basic_io.write(json.dumps({"status": "below_threshold", "risk_score": risk_score}))
            return

        # Send alert email via Catalyst Mail
        mailer = app.mail()
        mail_response = mailer.send_mail({
            "from": {"address": "kaavalai-noreply@ksp.gov.in", "name": "KaavalAI Alert System"},
            "to": [{"address": "sp@ksp.gov.in", "name": "District SP"}],
            "subject": f"🚨 RED ZONE ALERT — {district} | Risk Score: {risk_score}",
            "htmlbody": f"""
                <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff;border:1px solid #e2e8f0;border-radius:12px;">
                    <div style="background:#dc2626;color:#fff;padding:16px;border-radius:8px;margin-bottom:16px;">
                        <h2 style="margin:0">🚨 KaavalAI Red Zone Alert</h2>
                        <p style="margin:4px 0 0;opacity:0.9">Anomaly ID: {anomaly_id}</p>
                    </div>
                    <table style="width:100%;border-collapse:collapse;font-size:13px;">
                        <tr><td style="padding:8px;background:#f8fafc;font-weight:700;width:140px">District</td><td style="padding:8px">{district}</td></tr>
                        <tr><td style="padding:8px;background:#f8fafc;font-weight:700">Risk Score</td><td style="padding:8px;color:#dc2626;font-weight:800">{risk_score}/100</td></tr>
                        <tr><td style="padding:8px;background:#f8fafc;font-weight:700">Description</td><td style="padding:8px">{description}</td></tr>
                        <tr><td style="padding:8px;background:#f8fafc;font-weight:700">Detected At</td><td style="padding:8px">{datetime.now().strftime('%d %b %Y, %I:%M %p IST')}</td></tr>
                    </table>
                    <div style="margin-top:16px;padding:12px;background:#fef2f2;border-radius:8px;font-size:12px;color:#991b1b;">
                        <strong>Recommended Action:</strong> {payload.get("recommended_action", "Increase patrol presence immediately.")}
                    </div>
                    <p style="margin-top:16px;font-size:11px;color:#94a3b8;text-align:center;">
                        KaavalAI · Karnataka State Police SCRB · Project ID: 56816000000013052
                    </p>
                </div>
            """,
        })
        basic_io.write(json.dumps({"status": "alert_sent", "district": district, "risk_score": risk_score}))

    except Exception as e:
        basic_io.write(json.dumps({"status": "error", "message": str(e)}))


# ─────────────────────────────────────────────────────────────────────────────
# HANDLER 3: Weekly Summary Report (Cron — every Monday 8 AM IST)
# ─────────────────────────────────────────────────────────────────────────────
def weekly_summary_report(context, basic_io):
    """
    Cron function: Sends weekly crime analytics digest to SCRB Director.
    Catalyst Cron expression: 30 2 * * 1  (02:30 UTC Mon = 08:00 IST)
    """
    try:
        import zcatalyst_sdk as catalyst
        import urllib.request

        app = catalyst.initialize(context)
        api_base = os.environ.get("KAAVALAI_API_URL", "http://localhost:8000")

        # Fetch week summary from API
        data = {"hotspot_count": 0, "anomalies": 0, "forecast_risk": "N/A"}
        try:
            with urllib.request.urlopen(f"{api_base}/api/dashboard-summary", timeout=30) as r:
                data = json.loads(r.read())
        except Exception:
            pass

        mailer = app.mail()
        mailer.send_mail({
            "from": {"address": "kaavalai-reports@ksp.gov.in", "name": "KaavalAI Weekly Report"},
            "to": [{"address": "scrb.director@ksp.gov.in", "name": "SCRB Director"}],
            "subject": f"📊 KaavalAI Weekly Crime Summary — Week of {(datetime.now() - timedelta(days=7)).strftime('%d %b %Y')}",
            "htmlbody": f"""
                <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
                    <h2 style="color:#1d4ed8">KaavalAI Weekly Summary</h2>
                    <p>Hotspot Clusters: <strong>{data.get('hotspot_count', 'N/A')}</strong></p>
                    <p>Anomalies Detected: <strong>{data.get('anomalies', 'N/A')}</strong></p>
                    <p>Open FIRs: <strong>{data.get('open_firs', 'N/A')}</strong></p>
                    <p style="font-size:11px;color:#94a3b8">Auto-generated by KaavalAI Catalyst Cron · {datetime.now().isoformat()}</p>
                </div>
            """,
        })
        basic_io.write(json.dumps({"status": "weekly_report_sent"}))

    except Exception as e:
        basic_io.write(json.dumps({"status": "error", "message": str(e)}))
