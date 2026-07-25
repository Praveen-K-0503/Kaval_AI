#!/usr/bin/env python3
"""
KaavalAI — Catalyst Data Store Column Adder
Adds custom KSP columns to existing Catalyst tables using REST API.
Run: python backend/add_catalyst_columns.py
"""
import os, sys, json, subprocess, urllib.request, urllib.error

# ─── Get CLI auth token ────────────────────────────────────────────────────────
def get_cli_token():
    token_paths = [
        os.path.expanduser("~/.config/zcatalyst/token"),
        os.path.expanduser("~/.zcatalyst/token"),
        os.path.expanduser("~/AppData/Roaming/zcatalyst/token"),
    ]
    for p in token_paths:
        if os.path.exists(p):
            with open(p) as f:
                data = json.load(f)
                return data.get("access_token", "")
    # Try getting from catalyst CLI
    try:
        result = subprocess.run(
            ["npx", "zcatalyst-cli", "token", "--print"],
            capture_output=True, text=True, cwd=os.path.dirname(os.path.dirname(__file__))
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except Exception:
        pass
    return None

# ─── Column definitions per table ─────────────────────────────────────────────
TABLE_COLUMNS = {
    "KSP_Districts": [
        {"columnName": "DistrictID",             "dataType": "INTEGER"},
        {"columnName": "DistrictName",           "dataType": "VARCHAR", "maxSize": "100"},
        {"columnName": "DistrictCode",           "dataType": "VARCHAR", "maxSize": "20"},
        {"columnName": "RangeID",                "dataType": "INTEGER"},
        {"columnName": "HeadquartersLatitude",   "dataType": "DOUBLE"},
        {"columnName": "HeadquartersLongitude",  "dataType": "DOUBLE"},
    ],
    "KSP_PoliceStations": [
        {"columnName": "PSID",            "dataType": "INTEGER"},
        {"columnName": "PSName",          "dataType": "VARCHAR", "maxSize": "150"},
        {"columnName": "DistrictID",      "dataType": "INTEGER"},
        {"columnName": "PSCode",          "dataType": "VARCHAR", "maxSize": "20"},
        {"columnName": "latitude",        "dataType": "DOUBLE"},
        {"columnName": "longitude",       "dataType": "DOUBLE"},
        {"columnName": "PSType",          "dataType": "VARCHAR", "maxSize": "50"},
    ],
    "KSP_CaseMaster": [
        {"columnName": "CrimeNo",              "dataType": "VARCHAR", "maxSize": "50", "mandatory": True, "searchIndex": True, "unique": True},
        {"columnName": "PSID",                 "dataType": "INTEGER"},
        {"columnName": "DistrictID",           "dataType": "INTEGER"},
        {"columnName": "CrimeHeadID",          "dataType": "INTEGER"},
        {"columnName": "GravityID",            "dataType": "INTEGER"},
        {"columnName": "latitude",             "dataType": "DOUBLE"},
        {"columnName": "longitude",            "dataType": "DOUBLE"},
        {"columnName": "CrimeRegisteredDate",  "dataType": "VARCHAR", "maxSize": "30", "searchIndex": True},
        {"columnName": "CaseStatus",           "dataType": "VARCHAR", "maxSize": "30", "searchIndex": True},
        {"columnName": "BriefFacts",           "dataType": "VARCHAR", "maxSize": "255"},
        {"columnName": "AccuseCount",          "dataType": "INTEGER"},
        {"columnName": "VictimCount",          "dataType": "INTEGER"},
        {"columnName": "ArrestCount",          "dataType": "INTEGER"},
        {"columnName": "PropertyValue",        "dataType": "DOUBLE"},
    ],
    "KSP_CrimeHead": [
        {"columnName": "CrimeHeadID",    "dataType": "INTEGER"},
        {"columnName": "CrimeHeadName",  "dataType": "VARCHAR", "maxSize": "200", "searchIndex": True},
        {"columnName": "CategoryID",     "dataType": "INTEGER"},
        {"columnName": "IPC_Section",    "dataType": "VARCHAR", "maxSize": "100"},
        {"columnName": "GravityID",      "dataType": "INTEGER"},
    ],
    "KSP_AccusedMaster": [
        {"columnName": "AccusedID",       "dataType": "INTEGER"},
        {"columnName": "CrimeNo",         "dataType": "VARCHAR", "maxSize": "50", "searchIndex": True},
        {"columnName": "AccusedName",     "dataType": "VARCHAR", "maxSize": "150", "searchIndex": True, "pii": True},
        {"columnName": "Age",             "dataType": "INTEGER"},
        {"columnName": "Gender",          "dataType": "VARCHAR", "maxSize": "10"},
        {"columnName": "District",        "dataType": "VARCHAR", "maxSize": "100"},
        {"columnName": "Occupation",      "dataType": "VARCHAR", "maxSize": "100"},
        {"columnName": "ArrestDate",      "dataType": "VARCHAR", "maxSize": "30"},
        {"columnName": "CriminalHistory", "dataType": "INTEGER"},
        {"columnName": "MO_Description",  "dataType": "VARCHAR", "maxSize": "255"},
    ],
    "KSP_VictimMaster": [
        {"columnName": "VictimID",    "dataType": "INTEGER"},
        {"columnName": "CrimeNo",     "dataType": "VARCHAR", "maxSize": "50", "searchIndex": True},
        {"columnName": "VictimName",  "dataType": "VARCHAR", "maxSize": "150", "searchIndex": True, "pii": True},
        {"columnName": "Age",         "dataType": "INTEGER"},
        {"columnName": "Gender",      "dataType": "VARCHAR", "maxSize": "10"},
        {"columnName": "District",    "dataType": "VARCHAR", "maxSize": "100"},
        {"columnName": "InjuryType",  "dataType": "VARCHAR", "maxSize": "100"},
        {"columnName": "Occupation",  "dataType": "VARCHAR", "maxSize": "100"},
    ],
}

def call_api(url, method="GET", data=None, token=None):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read()), r.status
    except urllib.error.HTTPError as e:
        return json.loads(e.read()), e.code
    except Exception as ex:
        return {"error": str(ex)}, 0

def main():
    # Load project config
    catalystrc = {}
    rc_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".catalystrc")
    if os.path.exists(rc_path):
        with open(rc_path) as f:
            catalystrc = json.load(f)

    project_id = catalystrc.get("project_id", "56816000000013052")
    base_url = f"https://api.catalyst.zoho.in/baas/v1/project/{project_id}"

    token = get_cli_token()
    if not token:
        print("❌ No CLI token found. Run: npx zcatalyst-cli login")
        sys.exit(1)

    print(f"✅ Using project: {project_id}")
    print(f"✅ Auth token: {token[:20]}...")

    # Get existing tables
    resp, status = call_api(f"{base_url}/table", token=token)
    if status != 200:
        print(f"❌ Failed to fetch tables: {status} — {resp}")
        sys.exit(1)

    tables = {t["table_name"]: t["table_id"] for t in resp.get("data", [])}
    print(f"\n📋 Found {len(tables)} existing tables: {list(tables.keys())}\n")

    # Add columns to each table
    for table_name, columns in TABLE_COLUMNS.items():
        if table_name not in tables:
            print(f"⚠️  Table '{table_name}' not found — skipping")
            continue

        table_id = tables[table_name]
        print(f"\n🔧 Adding columns to {table_name} (ID: {table_id})...")

        for col in columns:
            col_data = {
                "column_name": col["columnName"],
                "data_type": col["dataType"],
            }
            if "maxSize" in col:
                col_data["max_size"] = col["maxSize"]
            if col.get("mandatory"):
                col_data["is_mandatory"] = True
            if col.get("searchIndex"):
                col_data["search_indexed"] = True
            if col.get("unique"):
                col_data["is_unique"] = True
            if col.get("pii"):
                col_data["pii_ephi"] = "PII"

            resp, status = call_api(
                f"{base_url}/table/{table_id}/column",
                method="POST",
                data=col_data,
                token=token
            )
            if status in (200, 201):
                print(f"  ✅ {col['columnName']} ({col['dataType']})")
            elif "already" in str(resp).lower() or status == 400:
                print(f"  ⏭️  {col['columnName']} already exists")
            else:
                print(f"  ❌ {col['columnName']}: {status} — {resp}")

    print("\n🎉 Done! All columns processed.")
    print("Next: Run python backend/seed_to_catalyst.py to load 10K FIR records")

if __name__ == "__main__":
    main()
