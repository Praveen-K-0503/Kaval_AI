import json
from datetime import datetime

def red_zone_alert(context, basic_io):
    """
    Triggered by Catalyst Signals when anomaly risk_score > 75.
    Sends email via Catalyst Mail to district SP.
    """
    try:
        import zcatalyst_sdk as catalyst
        app = catalyst.initialize(context)

        payload = json.loads(basic_io.read() or "{}")
        district = payload.get("district", "Unknown")
        risk_score = payload.get("risk_score", 0)
        anomaly_id = payload.get("anomaly_id", "ANOM-UNKNOWN")
        description = payload.get("description", "")

        if risk_score < 75:
            basic_io.write(json.dumps({"status": "below_threshold", "risk_score": risk_score}))
            return

        mailer = app.mail()
        mailer.send_mail({
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
                </div>
            """,
        })
        basic_io.write(json.dumps({"status": "alert_sent", "district": district, "risk_score": risk_score}))

    except Exception as e:
        basic_io.write(json.dumps({"status": "error", "message": str(e)}))
