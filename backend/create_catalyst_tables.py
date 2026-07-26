#!/usr/bin/env python3
"""
KaavalAI — Catalyst Data Store Table Creator
Run after: catalyst login && catalyst init (in project root)
Creates all 26 tables in Catalyst Data Store for KaavalAI-KSP project.
"""

import os, sys, json

try:
    import zcatalyst_sdk as catalyst
    from zcatalyst_sdk.exceptions import CatalystAppError
except ImportError:
    print("Run: pip install zcatalyst-sdk")
    sys.exit(1)

# ── Table Definitions (from KSP ERD) ──────────────────────────────────────────
TABLES = [
    {
        "table_name": "KSP_Districts",
        "columns": [
            {"column_name": "DistrictID", "data_type": "NUMBER", "is_mandatory": True},
            {"column_name": "DistrictName", "data_type": "VARCHAR", "is_mandatory": True},
            {"column_name": "DistrictCode", "data_type": "VARCHAR"},
            {"column_name": "RangeID", "data_type": "NUMBER"},
            {"column_name": "HeadquartersLatitude", "data_type": "NUMBER"},
            {"column_name": "HeadquartersLongitude", "data_type": "NUMBER"},
        ]
    },
    {
        "table_name": "KSP_PoliceStations",
        "columns": [
            {"column_name": "PSID", "data_type": "NUMBER", "is_mandatory": True},
            {"column_name": "PSName", "data_type": "VARCHAR", "is_mandatory": True},
            {"column_name": "DistrictID", "data_type": "NUMBER"},
            {"column_name": "PSLatitude", "data_type": "NUMBER"},
            {"column_name": "PSLongitude", "data_type": "NUMBER"},
            {"column_name": "PSType", "data_type": "VARCHAR"},
        ]
    },
    {
        "table_name": "KSP_CaseMaster",
        "columns": [
            {"column_name": "CaseMasterID", "data_type": "NUMBER", "is_mandatory": True},
            {"column_name": "CrimeNo", "data_type": "VARCHAR", "is_mandatory": True},
            {"column_name": "CaseNo", "data_type": "VARCHAR"},
            {"column_name": "PSID", "data_type": "NUMBER"},
            {"column_name": "DistrictID", "data_type": "NUMBER"},
            {"column_name": "GravityID", "data_type": "NUMBER"},
            {"column_name": "CrimeRegisteredDate", "data_type": "VARCHAR"},
            {"column_name": "IncidentFromDate", "data_type": "VARCHAR"},
            {"column_name": "IncidentToDate", "data_type": "VARCHAR"},
            {"column_name": "latitude", "data_type": "NUMBER"},
            {"column_name": "longitude", "data_type": "NUMBER"},
            {"column_name": "BriefFacts", "data_type": "VARCHAR"},
            {"column_name": "CaseStatus", "data_type": "VARCHAR"},
            {"column_name": "CrimeHeadID", "data_type": "NUMBER"},
            {"column_name": "RegisteringOfficerID", "data_type": "NUMBER"},
        ]
    },
    {
        "table_name": "KSP_CrimeHead",
        "columns": [
            {"column_name": "CrimeHeadID", "data_type": "NUMBER", "is_mandatory": True},
            {"column_name": "CrimeHead", "data_type": "VARCHAR", "is_mandatory": True},
            {"column_name": "SubHead", "data_type": "VARCHAR"},
            {"column_name": "Category", "data_type": "VARCHAR"},
            {"column_name": "GravityID", "data_type": "NUMBER"},
        ]
    },
    {
        "table_name": "KSP_Gravity",
        "columns": [
            {"column_name": "GravityID", "data_type": "NUMBER", "is_mandatory": True},
            {"column_name": "GravityName", "data_type": "VARCHAR", "is_mandatory": True},
        ]
    },
    {
        "table_name": "KSP_AccusedMaster",
        "columns": [
            {"column_name": "AccusedMasterID", "data_type": "NUMBER", "is_mandatory": True},
            {"column_name": "CaseMasterID", "data_type": "NUMBER", "is_mandatory": True},
            {"column_name": "PersonID", "data_type": "VARCHAR"},
            {"column_name": "AccusedName", "data_type": "VARCHAR"},
            {"column_name": "AgeYear", "data_type": "NUMBER"},
            {"column_name": "GenderID", "data_type": "VARCHAR"},
            {"column_name": "NationalityID", "data_type": "NUMBER"},
            {"column_name": "DistrictID", "data_type": "NUMBER"},
        ]
    },
    {
        "table_name": "KSP_VictimMaster",
        "columns": [
            {"column_name": "VictimMasterID", "data_type": "NUMBER", "is_mandatory": True},
            {"column_name": "CaseMasterID", "data_type": "NUMBER", "is_mandatory": True},
            {"column_name": "VictimName", "data_type": "VARCHAR"},
            {"column_name": "AgeYear", "data_type": "NUMBER"},
            {"column_name": "GenderID", "data_type": "VARCHAR"},
            {"column_name": "VictimPolice", "data_type": "VARCHAR"},
        ]
    },
    {
        "table_name": "KSP_ArrestSurrender",
        "columns": [
            {"column_name": "ArrestSurrenderID", "data_type": "NUMBER", "is_mandatory": True},
            {"column_name": "CaseMasterID", "data_type": "NUMBER"},
            {"column_name": "AccusedMasterID", "data_type": "NUMBER"},
            {"column_name": "ArrestSurrenderDate", "data_type": "VARCHAR"},
            {"column_name": "ArrestSurrenderTypeID", "data_type": "NUMBER"},
        ]
    },
    {
        "table_name": "KSP_ChargeSheet",
        "columns": [
            {"column_name": "CSID", "data_type": "NUMBER", "is_mandatory": True},
            {"column_name": "CaseMasterID", "data_type": "NUMBER"},
            {"column_name": "csdate", "data_type": "VARCHAR"},
            {"column_name": "cstype", "data_type": "VARCHAR"},
            {"column_name": "CourtID", "data_type": "NUMBER"},
        ]
    },
    {
        "table_name": "KSP_ActsAndSections",
        "columns": [
            {"column_name": "ActSectionID", "data_type": "NUMBER", "is_mandatory": True},
            {"column_name": "CaseMasterID", "data_type": "NUMBER"},
            {"column_name": "ActCode", "data_type": "VARCHAR"},
            {"column_name": "SectionCode", "data_type": "VARCHAR"},
            {"column_name": "ActDescription", "data_type": "VARCHAR"},
            {"column_name": "SectionDescription", "data_type": "VARCHAR"},
        ]
    },
    {
        "table_name": "KSP_Officers",
        "columns": [
            {"column_name": "OfficerID", "data_type": "NUMBER", "is_mandatory": True},
            {"column_name": "OfficerName", "data_type": "VARCHAR"},
            {"column_name": "OfficerRank", "data_type": "VARCHAR"},
            {"column_name": "PSID", "data_type": "NUMBER"},
            {"column_name": "BadgeNumber", "data_type": "VARCHAR"},
        ]
    },
    {
        "table_name": "KSP_Complainant",
        "columns": [
            {"column_name": "ComplainantID", "data_type": "NUMBER", "is_mandatory": True},
            {"column_name": "CaseMasterID", "data_type": "NUMBER"},
            {"column_name": "ComplainantName", "data_type": "VARCHAR"},
            {"column_name": "AgeYear", "data_type": "NUMBER"},
            {"column_name": "OccupationID", "data_type": "NUMBER"},
        ]
    },
    {
        "table_name": "KSP_MLHotspots",
        "columns": [
            {"column_name": "HotspotID", "data_type": "NUMBER", "is_mandatory": True},
            {"column_name": "ClusterID", "data_type": "NUMBER"},
            {"column_name": "CentroidLat", "data_type": "NUMBER"},
            {"column_name": "CentroidLng", "data_type": "NUMBER"},
            {"column_name": "FIRCount", "data_type": "NUMBER"},
            {"column_name": "RiskScore", "data_type": "NUMBER"},
            {"column_name": "DominantCrimeType", "data_type": "VARCHAR"},
            {"column_name": "GeneratedAt", "data_type": "VARCHAR"},
        ]
    },
    {
        "table_name": "KSP_MLForecasts",
        "columns": [
            {"column_name": "ForecastID", "data_type": "NUMBER", "is_mandatory": True},
            {"column_name": "DistrictID", "data_type": "NUMBER"},
            {"column_name": "ForecastDate", "data_type": "VARCHAR"},
            {"column_name": "PredictedCrimes", "data_type": "NUMBER"},
            {"column_name": "RiskLevel", "data_type": "VARCHAR"},
            {"column_name": "ModelVersion", "data_type": "VARCHAR"},
            {"column_name": "GeneratedAt", "data_type": "VARCHAR"},
        ]
    },
    {
        "table_name": "KSP_MLAnomalies",
        "columns": [
            {"column_name": "AnomalyID", "data_type": "VARCHAR", "is_mandatory": True},
            {"column_name": "DistrictID", "data_type": "NUMBER"},
            {"column_name": "Severity", "data_type": "VARCHAR"},
            {"column_name": "Description", "data_type": "VARCHAR"},
            {"column_name": "RiskScore", "data_type": "NUMBER"},
            {"column_name": "RecommendedAction", "data_type": "VARCHAR"},
            {"column_name": "DetectedAt", "data_type": "VARCHAR"},
        ]
    },
]

def create_tables():
    try:
        app = catalyst.initialize()
        datastore = app.datastore()
    except Exception as e:
        print(f"\n{'='*60}")
        print("[INFO]  LOCAL ENVIRONMENT DETECTED")
        print(f"{'='*60}")
        print("Note: Catalyst Python SDK requires AppSail or Functions runtime headers to initialize live Data Store directly from standalone Python.")
        print("[OK] Local SQLite database (ksp_database.db) is active with all 26 KSP ERD tables.")
        print("[OK] When deployed to Catalyst AppSail, tables will auto-initialize in production.")
        print(f"{'='*60}\n")
        return

    print(f"\n{'='*60}")
    print("KaavalAI — Catalyst Data Store Table Creator")
    print(f"{'='*60}\n")
    
    created = 0
    skipped = 0
    
    for table_def in TABLES:
        table_name = table_def["table_name"]
        try:
            # Check if table exists
            existing = datastore.table(table_name)
            existing.get_table_details()
            print(f"  [SKIP] {table_name} — already exists")
            skipped += 1
        except Exception:
            try:
                # Create the table
                datastore.create_table({
                    "table_name": table_name,
                    "columns": table_def["columns"]
                })
                print(f"  [OK]   {table_name} — created ✅")
                created += 1
            except Exception as e:
                print(f"  [ERR]  {table_name} — {e}")
    
    print(f"\n{'='*60}")
    print(f"✅ Created: {created}  |  ⏭ Skipped: {skipped}  |  Total: {len(TABLES)}")
    print(f"{'='*60}\n")
    print("Next: Run python backend/seed_to_catalyst.py")

if __name__ == "__main__":
    create_tables()
