import urllib.request, json

def test(label, url, method='GET', body=None):
    try:
        if body:
            req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'}, method='POST')
        else:
            req = urllib.request.Request(url)
        r = urllib.request.urlopen(req, timeout=30)
        data = json.loads(r.read())
        print(f"[OK] {label}")
        return data
    except Exception as e:
        print(f"[ERROR] {label}: {e}")
        return {}

# 1. DBSCAN Hotspots
d = test("DBSCAN Hotspots", "http://localhost:8000/api/ml/hotspots")
print(f"  -> clusters_detected={d.get('clusters_detected',0)}, firs_analyzed={d.get('total_firs_analyzed',0)}")

# 2. XGBoost Forecast
d = test("XGBoost Forecast", "http://localhost:8000/api/ml/forecast")
print(f"  -> daily_forecast_days={len(d.get('daily_forecast',[]))}, confidence={d.get('model_confidence')}")

# 3. NetworkX Analysis
d = test("NetworkX Centrality", "http://localhost:8000/api/ml/network-analysis")
gs = d.get("graph_stats", {})
print(f"  -> nodes={gs.get('total_nodes',0)}, edges={gs.get('total_edges',0)}")
top = d.get("top_ringleaders", [])
if top:
    print(f"  -> Top ringleader: {top[0].get('name')} score={top[0].get('composite_score')}")

# 4. TF-IDF MO Search
d = test("TF-IDF MO Search", "http://localhost:8000/api/ml/mo-search", body={"query": "ATM robbery night", "top_k": 5})
print(f"  -> results={d.get('total_results',0)}, model={d.get('model')}")
if d.get("results"):
    print(f"  -> Best similarity score: {d['results'][0].get('similarity_score')}%")

# 5. Isolation Forest
d = test("Isolation Forest Anomalies", "http://localhost:8000/api/ml/anomalies")
print(f"  -> anomalies_detected={d.get('anomalies_detected',0)}, districts_analyzed={d.get('districts_analyzed',0)}")

# 6. Beat Patrol
d = test("Beat Patrol Optimizer (District 1)", "http://localhost:8000/api/ml/beat-patrol/1?officers=60")
print(f"  -> clusters={len(d.get('deployment_plan',[]))}, total_officers={d.get('total_officers')}")

# 7. Predictive (combined)
d = test("Predictive Dashboard", "http://localhost:8000/api/predictive")
print(f"  -> model={d.get('model')}, anomalies={len(d.get('anomalies',[]))}")

print("")
print("Phase 2 ML Engine verification complete!")
