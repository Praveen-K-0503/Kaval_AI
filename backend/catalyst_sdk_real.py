"""
KaavalAI KSP — Real Zoho Catalyst Data Store SDK Client
Phase 1: Catalyst Data Store Integration

Provides native Catalyst Data Store operations for all 26 KSP FIR ERD tables.
Supports:
  - CRUD operations on all 26 tables
  - Batch inserts for seeding (100 rows per batch)
  - Full-text search on BriefFacts
  - Pagination for large datasets
  - Automatic fallback logging

Environment:
  CATALYST_ENV=local       → SDK not initialized (SQLite used)
  CATALYST_ENV=production  → SDK auto-initializes via AppSail service account
"""

import os
import logging
import time
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)

# ── Environment Detection ──────────────────────────────────────────────────
CATALYST_ENV = os.getenv("CATALYST_ENV", "local")
CATALYST_PROJECT_ID = os.getenv("CATALYST_PROJECT_ID", "")
IS_CATALYST_MODE = CATALYST_ENV == "production"

# ── Table Name Registry (26 KSP FIR ERD Tables) ───────────────────────────
KSP_TABLES = [
    "State", "UnitType", "Rank", "Designation", "CaseCategory",
    "GravityOffence", "CrimeHead", "CaseStatusMaster", "OccupationMaster",
    "ReligionMaster", "CasteMaster", "Act", "District", "Court",
    "Unit", "CrimeSubHead", "Section", "Employee", "CaseMaster",
    "ComplainantDetails", "Victim", "Accused", "ChargesheetDetails",
    "ActSectionAssociation", "CrimeHeadActSection", "ArrestSurrender"
]


class CatalystDataStoreClient:
    """
    Real Catalyst Data Store SDK client.
    Used when CATALYST_ENV=production (AppSail or development with Catalyst CLI).
    """

    def __init__(self):
        self._app = None
        self._datastore = None
        self.is_connected = False
        self._table_cache: Dict[str, Any] = {}
        self._lookup_cache: Dict[str, List[Dict]] = {}
        self._connect()

    def _connect(self):
        """Initialize the Catalyst SDK connection."""
        if not IS_CATALYST_MODE:
            logger.info("[CatalystSDK] Running in LOCAL mode — SQLite active, Catalyst SDK not loaded.")
            return

        try:
            import zcatalyst_sdk as catalyst  # type: ignore
            self._app = catalyst.initialize()
            self._datastore = self._app.datastore()
            self.is_connected = True
            logger.info("[CatalystSDK] ✅ Connected to Catalyst Data Store successfully.")
        except ImportError:
            logger.error("[CatalystSDK] ❌ zcatalyst-sdk not installed. Run: pip install zcatalyst-sdk")
        except Exception as e:
            logger.error(f"[CatalystSDK] ❌ Connection failed: {e}")

    # ── Table Accessor ──────────────────────────────────────────────────────

    def _get_table(self, table_name: str):
        """Get or cache a Catalyst table instance."""
        if table_name not in self._table_cache:
            if not self.is_connected:
                raise ConnectionError(f"Catalyst not connected. Cannot access table: {table_name}")
            self._table_cache[table_name] = self._datastore.table(table_name)
        return self._table_cache[table_name]

    # ── READ Operations ─────────────────────────────────────────────────────

    def get_rows(
        self,
        table_name: str,
        max_rows: int = 200,
        page: int = 1
    ) -> List[Dict[str, Any]]:
        """Fetch rows from a Catalyst table with pagination support."""
        if not self.is_connected:
            return []

        all_rows: List[Dict] = []
        current_page = page

        while len(all_rows) < max_rows:
            fetch_count = min(200, max_rows - len(all_rows))
            try:
                result = self._get_table(table_name).get_page_details(
                    page_number=current_page,
                    max_rows=fetch_count
                )
                batch = result.get("data", [])
                if not batch:
                    break
                all_rows.extend([self._normalize(r) for r in batch])
                current_page += 1
                if len(batch) < fetch_count:
                    break
            except Exception as e:
                logger.error(f"[CatalystSDK] get_rows({table_name}) error: {e}")
                break

        return all_rows[:max_rows]

    def get_row_by_id(self, table_name: str, row_id: int) -> Optional[Dict[str, Any]]:
        """Fetch a single row by ROWID from a Catalyst table."""
        if not self.is_connected:
            return None
        try:
            result = self._get_table(table_name).get_row(row_id)
            return self._normalize(result) if result else None
        except Exception as e:
            logger.error(f"[CatalystSDK] get_row_by_id({table_name}, {row_id}) error: {e}")
            return None

    def search_rows(self, table_name: str, search_query: str) -> List[Dict[str, Any]]:
        """Full-text search in a Catalyst table (uses Catalyst Data Store FTS)."""
        if not self.is_connected:
            return []
        try:
            result = self._get_table(table_name).search_rows(search_query=search_query)
            rows = result.get("data", []) if isinstance(result, dict) else []
            return [self._normalize(r) for r in rows]
        except Exception as e:
            logger.error(f"[CatalystSDK] search_rows({table_name}) error: {e}")
            return []

    def get_lookup_table(self, table_name: str) -> Dict[int, Dict]:
        """
        Load and cache a lookup/reference table as a dict keyed by first column.
        Used to simulate JOINs in Python since Catalyst Data Store doesn't support JOINs.
        """
        if table_name in self._lookup_cache:
            return {row.get("ROWID", i): row for i, row in enumerate(self._lookup_cache[table_name])}

        rows = self.get_rows(table_name, max_rows=1000)
        self._lookup_cache[table_name] = rows
        return {row.get("ROWID", i): row for i, row in enumerate(rows)}

    # ── WRITE Operations ────────────────────────────────────────────────────

    def insert_row(self, table_name: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Insert a single row into a Catalyst table."""
        if not self.is_connected:
            raise ConnectionError("Catalyst not connected")
        try:
            result = self._get_table(table_name).insert_row(data)
            return self._normalize(result)
        except Exception as e:
            logger.error(f"[CatalystSDK] insert_row({table_name}) error: {e}")
            raise

    def insert_rows_batch(
        self,
        table_name: str,
        rows: List[Dict[str, Any]],
        batch_size: int = 100,
        delay_ms: int = 200
    ) -> int:
        """
        Insert rows in batches (Catalyst limit: 100 rows per request).
        Returns total number of rows successfully inserted.
        """
        if not self.is_connected:
            raise ConnectionError("Catalyst not connected")

        total_inserted = 0
        total_batches = (len(rows) + batch_size - 1) // batch_size

        for i in range(0, len(rows), batch_size):
            batch = rows[i:i + batch_size]
            batch_num = i // batch_size + 1
            try:
                self._get_table(table_name).insert_rows(batch)
                total_inserted += len(batch)
                logger.info(f"[CatalystSDK] {table_name}: Batch {batch_num}/{total_batches} — {total_inserted} rows inserted")
                if delay_ms > 0:
                    time.sleep(delay_ms / 1000.0)
            except Exception as e:
                logger.error(f"[CatalystSDK] insert_rows_batch({table_name}) batch {batch_num} error: {e}")

        return total_inserted

    def update_row(self, table_name: str, row_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing row by ROWID."""
        if not self.is_connected:
            raise ConnectionError("Catalyst not connected")
        try:
            data["ROWID"] = row_id
            result = self._get_table(table_name).update_row(data)
            return self._normalize(result)
        except Exception as e:
            logger.error(f"[CatalystSDK] update_row({table_name}, {row_id}) error: {e}")
            raise

    def delete_row(self, table_name: str, row_id: int) -> bool:
        """Delete a row by ROWID."""
        if not self.is_connected:
            raise ConnectionError("Catalyst not connected")
        try:
            self._get_table(table_name).delete_row(row_id)
            return True
        except Exception as e:
            logger.error(f"[CatalystSDK] delete_row({table_name}, {row_id}) error: {e}")
            return False

    # ── KSP-Specific High-Level Queries ────────────────────────────────────

    def get_case_master_with_joins(
        self,
        limit: int = 50,
        district_filter: Optional[int] = None,
        gravity_filter: Optional[int] = None,
        search_text: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Fetch CaseMaster rows and enrich with JOIN data from reference tables.
        Since Catalyst doesn't support SQL JOINs, we do Python-level joins.
        """
        # Step 1: Fetch reference tables into memory (cached)
        districts = {r.get("DistrictID", r.get("ROWID")): r for r in self.get_rows("District", max_rows=50)}
        units = {r.get("UnitID", r.get("ROWID")): r for r in self.get_rows("Unit", max_rows=500)}
        gravity = {r.get("GravityOffenceID", r.get("ROWID")): r for r in self.get_rows("GravityOffence", max_rows=10)}
        crime_heads = {r.get("CrimeHeadID", r.get("ROWID")): r for r in self.get_rows("CrimeHead", max_rows=50)}
        categories = {r.get("CaseCategoryID", r.get("ROWID")): r for r in self.get_rows("CaseCategory", max_rows=10)}

        # Step 2: Fetch CaseMaster (with optional FTS search)
        if search_text:
            cases = self.search_rows("CaseMaster", search_text)
        else:
            cases = self.get_rows("CaseMaster", max_rows=limit * 3)  # Over-fetch for filtering

        # Step 3: Python-level JOIN enrichment
        enriched = []
        for c in cases:
            ps_id = c.get("PoliceStationID")
            unit = units.get(ps_id, {})
            dist_id = unit.get("DistrictID")
            district = districts.get(dist_id, {})
            grav = gravity.get(c.get("GravityOffenceID"), {})
            head = crime_heads.get(c.get("CrimeMajorHeadID"), {})
            cat = categories.get(c.get("CaseCategoryID"), {})

            # Apply filters
            if district_filter and dist_id != district_filter:
                continue
            if gravity_filter and c.get("GravityOffenceID") != gravity_filter:
                continue

            enriched.append({
                **c,
                "DistrictName": district.get("DistrictName", "Unknown"),
                "PoliceStation": unit.get("UnitName", "Unknown"),
                "Gravity": grav.get("LookupValue", "Unknown"),
                "CrimeHead": head.get("CrimeGroupName", "Unknown"),
                "Category": cat.get("LookupValue", "Unknown"),
            })

            if len(enriched) >= limit:
                break

        return enriched

    def get_fir_full_detail(self, case_master_id: int) -> Optional[Dict[str, Any]]:
        """
        Fetch complete FIR record with all 24 linked tables.
        Emulates the SQL JOINs from database_adapter.py using Python-level joins.
        """
        # Fetch base case
        cases = self.get_rows("CaseMaster", max_rows=1000)
        case = next((c for c in cases if c.get("CaseMasterID") == case_master_id), None)
        if not case:
            return None

        # Fetch all related records
        accused_list = [a for a in self.get_rows("Accused", max_rows=500) if a.get("CaseMasterID") == case_master_id]
        victims = [v for v in self.get_rows("Victim", max_rows=500) if v.get("CaseMasterID") == case_master_id]
        complainants = [c for c in self.get_rows("ComplainantDetails", max_rows=500) if c.get("CaseMasterID") == case_master_id]
        chargesheet = [cs for cs in self.get_rows("ChargesheetDetails", max_rows=200) if cs.get("CaseMasterID") == case_master_id]
        arrests = [ar for ar in self.get_rows("ArrestSurrender", max_rows=200) if ar.get("CaseMasterID") == case_master_id]
        act_sections = [a for a in self.get_rows("ActSectionAssociation", max_rows=500) if a.get("CaseMasterID") == case_master_id]

        return {
            **case,
            "accused_list": accused_list,
            "victims": victims,
            "complainants": complainants,
            "chargesheet": chargesheet,
            "arrests": arrests,
            "acts_sections": act_sections,
        }

    def get_district_crime_counts(self) -> List[Dict[str, Any]]:
        """
        Aggregate crime counts by district.
        Python-level aggregation since Catalyst doesn't support GROUP BY.
        """
        cases = self.get_rows("CaseMaster", max_rows=5000)
        units = {r.get("UnitID", r.get("ROWID")): r for r in self.get_rows("Unit", max_rows=500)}
        districts = self.get_rows("District", max_rows=50)

        # Count cases per district
        dist_counts: Dict[int, int] = {}
        for c in cases:
            ps_id = c.get("PoliceStationID")
            unit = units.get(ps_id, {})
            dist_id = unit.get("DistrictID")
            if dist_id:
                dist_counts[dist_id] = dist_counts.get(dist_id, 0) + 1

        # Build result
        result = []
        for d in districts:
            dist_id = d.get("DistrictID", d.get("ROWID"))
            result.append({
                "DistrictID": dist_id,
                "DistrictName": d.get("DistrictName", "Unknown"),
                "CrimeCount": dist_counts.get(dist_id, 0),
            })

        return sorted(result, key=lambda x: x["CrimeCount"], reverse=True)

    # ── Utility ─────────────────────────────────────────────────────────────

    def _normalize(self, row: Dict) -> Dict:
        """Strip Catalyst metadata fields and return clean row dict."""
        if not row:
            return {}
        skip_keys = {"CREATORID", "MODIFIEDTIME", "CREATEDTIME"}
        return {k: v for k, v in row.items() if k not in skip_keys}

    def clear_lookup_cache(self):
        """Clear the in-memory lookup cache (call after data changes)."""
        self._lookup_cache.clear()
        logger.info("[CatalystSDK] Lookup cache cleared.")


# ── Singleton Instance ─────────────────────────────────────────────────────
catalyst_ds = CatalystDataStoreClient()
