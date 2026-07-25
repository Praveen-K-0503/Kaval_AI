#!/usr/bin/env python3
"""
KaavalAI — Catalyst Column Adder (Cookie Auth)
Uses browser session cookies extracted from DevTools.
"""
import sys, json, urllib.request, urllib.error

# ── Auth from browser DevTools ──────────────────────────────────────────────
BASE = "https://console.catalyst.zoho.in/baas/v1/project/56816000000013052"
COOKIE = (
    "_iamadt=ef3acb95f55b6fa18bd8424eb19d6da86d8c5f1b1145634a1f76056cc88aa25504d4ab1dd8edc65a523afca3eb3df846;"
    "_iambdt=3d701d1c130f65e8500eb0317ddb81f199a61b9b6a034a69d20847910ccd3e6cf62a36298c9d1c0b5c9d0143e18cff818dc76c9c99cc5582604ba1fb6a8b47d9;"
    "JSESSIONID=7D9F6EE01545220E27A606B49FC31648;"
    "CT_CSRF_TOKEN=f66ef035c01017f37f2e00cc002e6e84d3ae48ef3a55ddb9235a37de2056bedb99b272c9160fcf367af238242d83f91e683118fb824f6e13821d36bb880252ee;"
    "stk=1e1b285a808ac0aedabaa9fc6edefe6f;"
    "zalb_3a750b85f1=02c0e945ba5342ff5e68260669f5403b"
)
CSRF = "zd_csrparam=f66ef035c01017f37f2e00cc002e6e84d3ae48ef3a55ddb9235a37de2056bedb99b272c9160fcf367af238242d83f91e683118fb824f6e13821d36bb880252ee"

HEADERS = {
    "Cookie": COOKIE,
    "x-zcsrf-token": CSRF,
    "environment": "Development",
    "Accept": "application/vnd.catalyst.v2+json",
    "Content-Type": "application/json",
    "catalyst-org": "60080028417",
    "Referer": "https://console.catalyst.zoho.in/baas/60080028417/project/56816000000013052/Development",
}

# ── Column definitions ──────────────────────────────────────────────────────
TABLE_COLUMNS = {
    "KSP_Districts": [
        {"column_name":"DistrictID","data_type":"INTEGER"},
        {"column_name":"DistrictName","data_type":"VARCHAR","max_size":"100","search_indexed":True},
        {"column_name":"DistrictCode","data_type":"VARCHAR","max_size":"20"},
        {"column_name":"RangeID","data_type":"INTEGER"},
        {"column_name":"HeadquartersLatitude","data_type":"DOUBLE"},
        {"column_name":"HeadquartersLongitude","data_type":"DOUBLE"},
    ],
    "KSP_PoliceStations": [
        {"column_name":"PSID","data_type":"INTEGER"},
        {"column_name":"PSName","data_type":"VARCHAR","max_size":"150","search_indexed":True},
        {"column_name":"DistrictID","data_type":"INTEGER"},
        {"column_name":"PSCode","data_type":"VARCHAR","max_size":"20"},
        {"column_name":"latitude","data_type":"DOUBLE"},
        {"column_name":"longitude","data_type":"DOUBLE"},
        {"column_name":"PSType","data_type":"VARCHAR","max_size":"50"},
    ],
    "KSP_CaseMaster": [
        {"column_name":"CrimeNo","data_type":"VARCHAR","max_size":"50","is_mandatory":True,"is_unique":True,"search_indexed":True},
        {"column_name":"PSID","data_type":"INTEGER"},
        {"column_name":"DistrictID","data_type":"INTEGER"},
        {"column_name":"CrimeHeadID","data_type":"INTEGER"},
        {"column_name":"GravityID","data_type":"INTEGER"},
        {"column_name":"latitude","data_type":"DOUBLE"},
        {"column_name":"longitude","data_type":"DOUBLE"},
        {"column_name":"CrimeRegisteredDate","data_type":"VARCHAR","max_size":"30","search_indexed":True},
        {"column_name":"CaseStatus","data_type":"VARCHAR","max_size":"30","search_indexed":True},
        {"column_name":"BriefFacts","data_type":"VARCHAR","max_size":"255"},
        {"column_name":"AccuseCount","data_type":"INTEGER"},
        {"column_name":"VictimCount","data_type":"INTEGER"},
        {"column_name":"ArrestCount","data_type":"INTEGER"},
        {"column_name":"PropertyValue","data_type":"DOUBLE"},
    ],
    "KSP_CrimeHead": [
        {"column_name":"CrimeHeadID","data_type":"INTEGER"},
        {"column_name":"CrimeHeadName","data_type":"VARCHAR","max_size":"200","search_indexed":True},
        {"column_name":"CategoryID","data_type":"INTEGER"},
        {"column_name":"IPC_Section","data_type":"VARCHAR","max_size":"100"},
        {"column_name":"GravityID","data_type":"INTEGER"},
    ],
    "KSP_AccusedMaster": [
        {"column_name":"AccusedID","data_type":"INTEGER"},
        {"column_name":"CrimeNo","data_type":"VARCHAR","max_size":"50","search_indexed":True},
        {"column_name":"AccusedName","data_type":"VARCHAR","max_size":"150","search_indexed":True},
        {"column_name":"Age","data_type":"INTEGER"},
        {"column_name":"Gender","data_type":"VARCHAR","max_size":"10"},
        {"column_name":"District","data_type":"VARCHAR","max_size":"100"},
        {"column_name":"ArrestDate","data_type":"VARCHAR","max_size":"30"},
        {"column_name":"CriminalHistory","data_type":"INTEGER"},
        {"column_name":"MO_Description","data_type":"VARCHAR","max_size":"255"},
    ],
    "KSP_VictimMaster": [
        {"column_name":"VictimID","data_type":"INTEGER"},
        {"column_name":"CrimeNo","data_type":"VARCHAR","max_size":"50","search_indexed":True},
        {"column_name":"VictimName","data_type":"VARCHAR","max_size":"150","search_indexed":True},
        {"column_name":"Age","data_type":"INTEGER"},
        {"column_name":"Gender","data_type":"VARCHAR","max_size":"10"},
        {"column_name":"District","data_type":"VARCHAR","max_size":"100"},
        {"column_name":"InjuryType","data_type":"VARCHAR","max_size":"100"},
        {"column_name":"Occupation","data_type":"VARCHAR","max_size":"100"},
    ],
}

def api(url, method="GET", data=None):
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read()), r.status
    except urllib.error.HTTPError as e:
        try: return json.loads(e.read()), e.code
        except: return {"error": str(e)}, e.code

def main():
    print("KaavalAI - Adding columns to Catalyst Data Store")
    print("=" * 50)

    # Fetch tables
    resp, status = api(f"{BASE}/table")
    if status != 200:
        print(f"FAIL to fetch tables: {status} - {resp}")
        sys.exit(1)

    tables = {t["table_name"]: t["table_id"] for t in resp.get("data", [])}
    print(f"Found {len(tables)} tables: {list(tables.keys())}\n")

    total_ok = 0
    total_skip = 0
    total_err = 0

    for tname, cols in TABLE_COLUMNS.items():
        if tname not in tables:
            print(f"SKIP: {tname} not found")
            continue
        tid = tables[tname]
        print(f"\n[{tname}] (ID: {tid})")
        for col in cols:
            resp, status = api(f"{BASE}/table/{tid}/column", method="POST", data=col)
            resp_str = json.dumps(resp).lower()
            if status in (200, 201):
                print(f"  OK  {col['column_name']}")
                total_ok += 1
            elif "already" in resp_str or "duplicate" in resp_str or status == 400:
                print(f"  --  {col['column_name']} (already exists)")
                total_skip += 1
            else:
                print(f"  ERR {col['column_name']}: {status} - {resp}")
                total_err += 1

    print(f"\n{'='*50}")
    print(f"Done! Created: {total_ok} | Skipped: {total_skip} | Errors: {total_err}")

if __name__ == "__main__":
    main()
