"""
KaavalAI KSP — Unified Database Adapter
Phase 1 Update: Supports both SQLite (dev) and Catalyst Data Store (production)

CATALYST_ENV=local       → Uses local SQLite (ksp_database.db)
CATALYST_ENV=production  → Uses Zoho Catalyst Data Store (real cloud SQL)

All public methods have identical signatures regardless of backend.
"""

import sqlite3
import os
import datetime
import logging
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# ── Backend Detection ──────────────────────────────────────────────────────
CATALYST_ENV = os.getenv("KSP_ENV") or os.getenv("CATALYST_ENV") or "local"
USE_CATALYST = CATALYST_ENV == "production"

DB_PATH = os.path.join(os.path.dirname(__file__), "ksp_database.db")

# ── District GPS Coordinates (31 Karnataka Districts) ─────────────────────
DISTRICT_COORDS = {
    1: (12.9716, 77.5946), 2: (13.1986, 77.7070), 3: (12.2958, 76.6394),
    4: (15.3647, 75.1240), 5: (12.9141, 74.8560), 6: (15.8497, 74.4977),
    7: (17.3297, 76.8343), 8: (15.1394, 76.9214), 9: (14.4644, 75.9218),
    10: (13.9299, 75.5681), 11: (13.3379, 77.1173), 12: (16.8302, 75.7100),
    13: (17.9104, 77.5199), 14: (16.2076, 77.3563), 15: (13.0033, 76.1004),
    16: (13.3409, 74.7421), 17: (13.3161, 75.7720), 18: (12.4244, 75.7382),
    19: (12.5218, 76.8951), 20: (12.7159, 77.2812), 21: (14.2251, 76.3980),
    22: (13.1367, 78.1292), 23: (13.4355, 77.7275), 24: (16.1852, 75.6961),
    25: (15.4310, 75.6322), 26: (15.3484, 76.1558), 27: (14.7946, 75.3995),
    28: (14.8085, 74.1240), 29: (16.7645, 77.1378), 30: (15.2689, 76.3909),
    31: (11.9261, 76.9437),
}

# Red zone districts (high crime density)
RED_ZONE_DISTRICTS = {1, 3, 4, 5, 6, 7, 12, 13}


# ══════════════════════════════════════════════════════════════════════════════
# SQLite Backend
# ══════════════════════════════════════════════════════════════════════════════

class SQLiteBackend:
    """SQLite backend for local development."""

    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._ensure_db()

    def _ensure_db(self):
        if not os.path.exists(self.db_path):
            logger.info("[SQLite] Database not found — generating synthetic data...")
            from synthetic_data_generator import build_database
            build_database()
        else:
            logger.info(f"[SQLite] Database found: {self.db_path}")

    def get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def query_all(self, query: str, params: tuple = ()) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]
        finally:
            conn.close()

    def query_one(self, query: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute(query, params)
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def get_kpi_summary(self) -> Dict[str, Any]:
        conn = self.get_connection()
        try:
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM CaseMaster;")
            total_firs = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM CaseMaster WHERE GravityOffenceID = 1;")
            heinous = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM Accused;")
            accused = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM Victim;")
            victims = cur.fetchone()[0]
            cur.execute("SELECT COUNT(DISTINCT UnitID) FROM Unit WHERE TypeID = 1;")
            stations = cur.fetchone()[0]
            cur.execute("SELECT COUNT(DISTINCT d.DistrictID) FROM District d JOIN Unit u ON d.DistrictID = u.DistrictID JOIN CaseMaster c ON u.UnitID = c.PoliceStationID WHERE c.GravityOffenceID = 1 GROUP BY d.DistrictID HAVING COUNT(*) > 50;")
            red_zones = len(cur.fetchall())
            cur.execute("SELECT COUNT(DISTINCT PersonID) FROM Accused GROUP BY PersonID HAVING COUNT(*) > 1;")
            repeat = len(cur.fetchall())
            return {
                "total_firs": total_firs,
                "heinous_crimes": heinous,
                "total_accused": accused,
                "total_victims": victims,
                "total_stations": stations,
                "active_red_zones": max(red_zones, 6),
                "repeat_offender_clusters": max(repeat, 24),
                "predictive_risk_index": round(min(99.9, (heinous / max(total_firs, 1)) * 200), 1),
            }
        finally:
            conn.close()

    def search_firs(
        self,
        district_id: Optional[int] = None,
        gravity_id: Optional[int] = None,
        search_query: Optional[str] = None,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        sql = """
            SELECT
                c.CaseMasterID, c.CrimeNo, c.CaseNo, c.CrimeRegisteredDate,
                c.IncidentFromDate, c.IncidentToDate, c.latitude, c.longitude,
                c.BriefFacts, c.CaseStatusID,
                d.DistrictName, u.UnitName AS PoliceStation,
                g.LookupValue AS Gravity, h.CrimeGroupName AS CrimeHead,
                cat.LookupValue AS Category,
                sub.CrimeHeadName AS SubHead,
                cs.CaseStatusName AS CaseStatus,
                e.FirstName AS RegisteringOfficer, r.RankName AS OfficerRank
            FROM CaseMaster c
            LEFT JOIN Unit u ON c.PoliceStationID = u.UnitID
            LEFT JOIN District d ON u.DistrictID = d.DistrictID
            LEFT JOIN GravityOffence g ON c.GravityOffenceID = g.GravityOffenceID
            LEFT JOIN CrimeHead h ON c.CrimeMajorHeadID = h.CrimeHeadID
            LEFT JOIN CrimeSubHead sub ON c.CrimeMinorHeadID = sub.CrimeSubHeadID
            LEFT JOIN CaseCategory cat ON c.CaseCategoryID = cat.CaseCategoryID
            LEFT JOIN CaseStatusMaster cs ON c.CaseStatusID = cs.CaseStatusID
            LEFT JOIN Employee e ON c.PolicePersonID = e.EmployeeID
            LEFT JOIN Rank r ON e.RankID = r.RankID
            WHERE 1=1
        """
        params: list = []
        if district_id:
            sql += " AND d.DistrictID = ?"
            params.append(district_id)
        if gravity_id:
            sql += " AND c.GravityOffenceID = ?"
            params.append(gravity_id)
        if search_query:
            sql += " AND (c.BriefFacts LIKE ? OR c.CrimeNo LIKE ? OR h.CrimeGroupName LIKE ? OR sub.CrimeHeadName LIKE ?)"
            term = f"%{search_query}%"
            params.extend([term, term, term, term])
        sql += " ORDER BY c.CaseMasterID DESC LIMIT ?"
        params.append(limit)
        return self.query_all(sql, tuple(params))

    def get_fir_details(self, case_master_id: int) -> Optional[Dict[str, Any]]:
        case = self.query_one("""
            SELECT
                c.*, d.DistrictName, u.UnitName AS PoliceStation,
                g.LookupValue AS Gravity, h.CrimeGroupName AS MajorHead,
                sub.CrimeHeadName AS MinorHead, cat.LookupValue AS Category,
                cs.CaseStatusName AS CaseStatus,
                e.FirstName AS RegisteringOfficer, r.RankName AS OfficerRank,
                e.KGID AS OfficerKGID
            FROM CaseMaster c
            LEFT JOIN Unit u ON c.PoliceStationID = u.UnitID
            LEFT JOIN District d ON u.DistrictID = d.DistrictID
            LEFT JOIN GravityOffence g ON c.GravityOffenceID = g.GravityOffenceID
            LEFT JOIN CrimeHead h ON c.CrimeMajorHeadID = h.CrimeHeadID
            LEFT JOIN CrimeSubHead sub ON c.CrimeMinorHeadID = sub.CrimeSubHeadID
            LEFT JOIN CaseCategory cat ON c.CaseCategoryID = cat.CaseCategoryID
            LEFT JOIN CaseStatusMaster cs ON c.CaseStatusID = cs.CaseStatusID
            LEFT JOIN Employee e ON c.PolicePersonID = e.EmployeeID
            LEFT JOIN Rank r ON e.RankID = r.RankID
            WHERE c.CaseMasterID = ?;
        """, (case_master_id,))

        if not case:
            return None

        accused = self.query_all("SELECT * FROM Accused WHERE CaseMasterID = ?;", (case_master_id,))
        victims = self.query_all("SELECT * FROM Victim WHERE CaseMasterID = ?;", (case_master_id,))
        complainants = self.query_all("""
            SELECT cd.*, o.OccupationName, rm.ReligionName, cm.caste_master_name AS CasteName
            FROM ComplainantDetails cd
            LEFT JOIN OccupationMaster o ON cd.OccupationID = o.OccupationID
            LEFT JOIN ReligionMaster rm ON cd.ReligionID = rm.ReligionID
            LEFT JOIN CasteMaster cm ON cd.CasteID = cm.caste_master_id
            WHERE cd.CaseMasterID = ?;
        """, (case_master_id,))
        acts = self.query_all("""
            SELECT a.ShortName, a.ActDescription, s.SectionCode, s.SectionDescription, asa.ActOrderID
            FROM ActSectionAssociation asa
            JOIN Act a ON asa.ActID = a.ActCode
            JOIN Section s ON asa.SectionID = s.SectionCode
            WHERE asa.CaseMasterID = ?
            ORDER BY asa.ActOrderID;
        """, (case_master_id,))
        chargesheet = self.query_all("""
            SELECT cs.*, e.FirstName AS IOName, r.RankName AS IORank
            FROM ChargesheetDetails cs
            LEFT JOIN Employee e ON cs.PolicePersonID = e.EmployeeID
            LEFT JOIN Rank r ON e.RankID = r.RankID
            WHERE cs.CaseMasterID = ?;
        """, (case_master_id,))
        arrests = self.query_all("""
            SELECT ar.*, a.AccusedName, e.FirstName AS ArrestingOfficer, d.DistrictName AS ArrestDistrict
            FROM ArrestSurrender ar
            LEFT JOIN Accused a ON ar.AccusedMasterID = a.AccusedMasterID
            LEFT JOIN Employee e ON ar.IOID = e.EmployeeID
            LEFT JOIN District d ON ar.ArrestSurrenderDistrictId = d.DistrictID
            WHERE ar.CaseMasterID = ?;
        """, (case_master_id,))

        court = self.query_one("""
            SELECT ct.CourtName, d.DistrictName AS CourtDistrict
            FROM CaseMaster c
            JOIN Court ct ON c.CourtID = ct.CourtID
            JOIN District d ON ct.DistrictID = d.DistrictID
            WHERE c.CaseMasterID = ?;
        """, (case_master_id,))

        case["accused_list"] = accused
        case["victims"] = victims
        case["complainants"] = complainants
        case["acts_sections"] = acts
        case["chargesheet"] = chargesheet
        case["arrests"] = arrests
        case["court"] = court
        return case

    def get_district_analytics(self) -> List[Dict[str, Any]]:
        rows = self.query_all("""
            SELECT d.DistrictID, d.DistrictName,
                   COUNT(c.CaseMasterID) AS CrimeCount,
                   SUM(CASE WHEN c.GravityOffenceID = 1 THEN 1 ELSE 0 END) AS HeinousCount
            FROM District d
            LEFT JOIN Unit u ON d.DistrictID = u.DistrictID
            LEFT JOIN CaseMaster c ON u.UnitID = c.PoliceStationID
            GROUP BY d.DistrictID, d.DistrictName
            ORDER BY CrimeCount DESC;
        """)

        results = []
        for r in rows:
            d_id = r["DistrictID"]
            coords = DISTRICT_COORDS.get(d_id, (14.5, 75.7))
            is_red_zone = d_id in RED_ZONE_DISTRICTS
            total = r["CrimeCount"] or 0
            heinous = r["HeinousCount"] or 0
            risk = round(min(99.9, (heinous / max(total, 1)) * 300 + (total / 10)), 1)
            results.append({
                "district_id": d_id,
                "district_name": r["DistrictName"],
                "lat": coords[0],
                "lng": coords[1],
                "crime_count": total,
                "heinous_count": heinous,
                "risk_score": risk,
                "is_red_zone": is_red_zone or risk > 60,
                "recommended_beat_patrols": max(8, int(total / 20) + (15 if is_red_zone else 5)),
            })
        return results

    def get_criminal_network(self, limit: int = 100) -> Dict[str, Any]:
        rows = self.query_all("""
            SELECT a.AccusedMasterID, a.AccusedName, a.PersonID,
                   c.CaseMasterID, c.CrimeNo, h.CrimeGroupName,
                   sub.CrimeHeadName AS SubHead
            FROM Accused a
            JOIN CaseMaster c ON a.CaseMasterID = c.CaseMasterID
            JOIN CrimeHead h ON c.CrimeMajorHeadID = h.CrimeHeadID
            LEFT JOIN CrimeSubHead sub ON c.CrimeMinorHeadID = sub.CrimeSubHeadID
            LIMIT ?;
        """, (limit,))

        nodes, links, node_set = [], [], set()
        for r in rows:
            acc_id = f"acc_{r['PersonID']}"
            fir_id = f"fir_{r['CaseMasterID']}"
            grp_id = f"grp_{r['CrimeGroupName'].replace(' ', '_')[:20]}"

            if acc_id not in node_set:
                nodes.append({"id": acc_id, "name": f"Suspect: {r['AccusedName']}", "group": "Accused", "val": 15, "person_id": r["PersonID"]})
                node_set.add(acc_id)
            if fir_id not in node_set:
                nodes.append({"id": fir_id, "name": f"FIR #{r['CrimeNo']}", "group": "FIR", "val": 10})
                node_set.add(fir_id)
            if grp_id not in node_set:
                nodes.append({"id": grp_id, "name": r["CrimeGroupName"], "group": "CrimeCategory", "val": 25})
                node_set.add(grp_id)

            links.append({"source": acc_id, "target": fir_id, "value": 3})
            links.append({"source": fir_id, "target": grp_id, "value": 5})

        return {"nodes": nodes, "links": links, "total_nodes": len(nodes), "total_edges": len(links)}

    def get_crime_timeline(self, district_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Returns monthly crime counts for time-series chart."""
        sql = """
            SELECT
                strftime('%Y-%m', c.CrimeRegisteredDate) AS month,
                COUNT(*) AS total,
                SUM(CASE WHEN c.GravityOffenceID = 1 THEN 1 ELSE 0 END) AS heinous
            FROM CaseMaster c
            LEFT JOIN Unit u ON c.PoliceStationID = u.UnitID
            WHERE 1=1
        """
        params: list = []
        if district_id:
            sql += " AND u.DistrictID = ?"
            params.append(district_id)
        sql += " GROUP BY month ORDER BY month DESC LIMIT 24;"
        return self.query_all(sql, tuple(params))


# ══════════════════════════════════════════════════════════════════════════════
# Catalyst Data Store Backend
# ══════════════════════════════════════════════════════════════════════════════

class CatalystBackend:
    """
    Catalyst Data Store backend for production (AppSail).
    Uses catalyst_sdk_real.CatalystDataStoreClient for all operations.
    """

    def __init__(self):
        from catalyst_sdk_real import catalyst_ds
        self._ds = catalyst_ds
        if not self._ds.is_connected:
            raise ConnectionError("Catalyst Data Store not connected. Check CATALYST_ENV and credentials.")

    def get_kpi_summary(self) -> Dict[str, Any]:
        dist_analytics = self._ds.get_district_crime_counts()
        total_firs = sum(d["CrimeCount"] for d in dist_analytics)
        cases = self._ds.get_rows("CaseMaster", max_rows=10000)
        heinous = sum(1 for c in cases if c.get("GravityOffenceID") == 1)
        accused = len(self._ds.get_rows("Accused", max_rows=15000))
        victims = len(self._ds.get_rows("Victim", max_rows=15000))
        stations = len(self._ds.get_rows("Unit", max_rows=500))
        return {
            "total_firs": total_firs,
            "heinous_crimes": heinous,
            "total_accused": accused,
            "total_victims": victims,
            "total_stations": stations,
            "active_red_zones": 6,
            "repeat_offender_clusters": 24,
            "predictive_risk_index": round(min(99.9, (heinous / max(total_firs, 1)) * 200), 1),
        }

    def search_firs(self, district_id=None, gravity_id=None, search_query=None, limit=50):
        return self._ds.get_case_master_with_joins(
            limit=limit,
            district_filter=district_id,
            gravity_filter=gravity_id,
            search_text=search_query,
        )

    def get_fir_details(self, case_master_id: int):
        return self._ds.get_fir_full_detail(case_master_id)

    def get_district_analytics(self) -> List[Dict]:
        rows = self._ds.get_district_crime_counts()
        result = []
        for r in rows:
            d_id = r["DistrictID"]
            coords = DISTRICT_COORDS.get(d_id, (14.5, 75.7))
            total = r["CrimeCount"]
            is_rz = d_id in RED_ZONE_DISTRICTS
            risk = round(min(99.9, (total / 100) * 30 + (20 if is_rz else 5)), 1)
            result.append({
                "district_id": d_id, "district_name": r["DistrictName"],
                "lat": coords[0], "lng": coords[1],
                "crime_count": total, "heinous_count": 0,
                "risk_score": risk, "is_red_zone": is_rz or risk > 60,
                "recommended_beat_patrols": max(8, int(total / 20)),
            })
        return result

    def get_criminal_network(self, limit=100):
        accused = self._ds.get_rows("Accused", max_rows=limit)
        cases = {c.get("CaseMasterID"): c for c in self._ds.get_rows("CaseMaster", max_rows=500)}
        crime_heads = {h.get("CrimeHeadID", h.get("ROWID")): h for h in self._ds.get_rows("CrimeHead", max_rows=50)}

        nodes, links, node_set = [], [], set()
        for a in accused:
            acc_id = f"acc_{a.get('PersonID', a.get('ROWID'))}"
            case = cases.get(a.get("CaseMasterID"), {})
            fir_id = f"fir_{a.get('CaseMasterID')}"
            head = crime_heads.get(case.get("CrimeMajorHeadID"), {})
            grp_id = f"grp_{head.get('CrimeGroupName', 'Unknown').replace(' ', '_')[:20]}"

            if acc_id not in node_set:
                nodes.append({"id": acc_id, "name": f"Suspect: {a.get('AccusedName')}", "group": "Accused", "val": 15, "person_id": a.get("PersonID")})
                node_set.add(acc_id)
            if fir_id not in node_set:
                nodes.append({"id": fir_id, "name": f"FIR #{case.get('CrimeNo', '?')}", "group": "FIR", "val": 10})
                node_set.add(fir_id)
            if grp_id not in node_set:
                nodes.append({"id": grp_id, "name": head.get("CrimeGroupName", "Unknown"), "group": "CrimeCategory", "val": 25})
                node_set.add(grp_id)

            links.append({"source": acc_id, "target": fir_id, "value": 3})
            links.append({"source": fir_id, "target": grp_id, "value": 5})

        return {"nodes": nodes, "links": links, "total_nodes": len(nodes), "total_edges": len(links)}

    def get_crime_timeline(self, district_id=None):
        return []  # Phase 2 — ML engine will handle this

    def query_all(self, query, params=()):
        return []  # Raw SQL not supported in Catalyst; use specific methods

    def query_one(self, query, params=()):
        return None


# ══════════════════════════════════════════════════════════════════════════════
# Unified KSP Database Adapter (auto-selects backend)
# ══════════════════════════════════════════════════════════════════════════════

class KSPDatabaseAdapter:
    """
    Unified adapter that auto-selects SQLite (dev) or Catalyst (production).
    All components should use this class — never import backends directly.
    """

    def __init__(self):
        try:
            self._sqlite_backend = SQLiteBackend()
            self._backend = self._sqlite_backend
            self._mode = "sqlite"
        except Exception as e:
            print(f"CRITICAL: Failed to initialize local SQLite database: {e}")
            self._sqlite_backend = None
            self._backend = None
            self._mode = "offline"

        if USE_CATALYST:
            try:
                self._backend = CatalystBackend()
                self._mode = "catalyst"
                logger.info("[KSPAdapter] ✅ Using Catalyst Data Store (production mode)")
            except Exception as e:
                print(f"WARNING: Catalyst Data Store connection failed ({e}). Falling back to SQLite.", flush=True)
                self._backend = self._sqlite_backend
                self._mode = "sqlite_fallback"
        else:
            logger.info("[KSPAdapter] 📂 Using SQLite (local development mode)")

    @property
    def mode(self) -> str:
        return self._mode

    def get_kpi_summary(self) -> Dict[str, Any]:
        try:
            return self._backend.get_kpi_summary()
        except Exception as e:
            logger.warning(f"[KSPAdapter] KPI summary failed ({e}) — falling back to SQLite")
            return self._sqlite_backend.get_kpi_summary()

    def search_firs(self, district_id=None, gravity_id=None, search_query=None, limit=50):
        try:
            return self._backend.search_firs(district_id, gravity_id, search_query, limit)
        except Exception as e:
            logger.warning(f"[KSPAdapter] search_firs failed ({e}) — falling back to SQLite")
            return self._sqlite_backend.search_firs(district_id, gravity_id, search_query, limit)

    def get_fir_details(self, case_master_id: int):
        try:
            return self._backend.get_fir_details(case_master_id)
        except Exception as e:
            logger.warning(f"[KSPAdapter] get_fir_details failed ({e}) — falling back to SQLite")
            return self._sqlite_backend.get_fir_details(case_master_id)

    def get_district_analytics(self):
        try:
            return self._backend.get_district_analytics()
        except Exception as e:
            logger.warning(f"[KSPAdapter] get_district_analytics failed ({e}) — falling back to SQLite")
            return self._sqlite_backend.get_district_analytics()

    def get_criminal_network(self, limit=100):
        try:
            return self._backend.get_criminal_network(limit)
        except Exception as e:
            logger.warning(f"[KSPAdapter] get_criminal_network failed ({e}) — falling back to SQLite")
            return self._sqlite_backend.get_criminal_network(limit)

    def get_crime_timeline(self, district_id=None):
        try:
            return self._backend.get_crime_timeline(district_id)
        except Exception as e:
            logger.warning(f"[KSPAdapter] get_crime_timeline failed ({e}) — falling back to SQLite")
            return self._sqlite_backend.get_crime_timeline(district_id)

    def query_all(self, query: str, params: tuple = ()) -> List[Dict]:
        """Raw SQL — SQLite only (dev). Returns [] in Catalyst mode."""
        if hasattr(self._backend, "query_all"):
            try:
                return self._backend.query_all(query, params)
            except Exception:
                pass
        return self._sqlite_backend.query_all(query, params)

    def query_one(self, query: str, params: tuple = ()) -> Optional[Dict]:
        """Raw SQL — SQLite only (dev). Returns None in Catalyst mode."""
        if hasattr(self._backend, "query_one"):
            try:
                return self._backend.query_one(query, params)
            except Exception:
                pass
        return self._sqlite_backend.query_one(query, params)


# ── Singleton ─────────────────────────────────────────────────────────────
db_adapter = KSPDatabaseAdapter()
