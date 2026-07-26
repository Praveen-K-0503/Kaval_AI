import json
import os
from datetime import datetime, timedelta

def weekly_summary_report(context, basic_io):
    """
    Cron function: Sends weekly crime analytics digest to SCRB Director.
    Catalyst Cron expression: 30 2 * * 1 (02:30 UTC Mon = 08:00 IST)
    """
    try:
        import zcatalyst_sdk as catalyst
        import urllib.request

        app = catalyst.initialize(context)
        api_base = os.environ.get("KAAVALAI_API_URL", "https://kaavalai-backend-50044342834.development.catalystappsail.in")

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
                </div>
            """,
        })
        basic_io.write(json.dumps({"status": "weekly_report_sent"}))

    except Exception as e:
        basic_io.write(json.dumps({"status": "error", "message": str(e)}))
