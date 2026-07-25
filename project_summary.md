# KaavalAI: KSP AI Command & 3D Intelligence Suite — Complete Master Handover

## 1. Project Overview & Hackathon Metadata
* **Event**: Karnataka State Police (KSP) Datathon 2026
* **Platform & Sponsor**: Powered by **Hack2skill** & **Zoho Catalyst**
* **Selected Winning Challenge**: **Challenge 02 — AI-Driven Crime Analytics & Visualization Platform**
* **Total Prize Pool**: ₹10 Lakhs (₹2.5 Lakhs Winner per challenge)
* **Target Jurisdiction**: 31 Districts & 1,100+ Police Stations across Karnataka

---

## 2. Core Problem Addressed & Strategic Value
Current law enforcement analytics rely on siloed data and manual Excel reporting. **KaavalAI** replaces legacy spreadsheets with a real-time, 3D Executive Command & Control Hub that gives the State Crime Records Bureau (SCRB) proactive spatial, predictive, and criminal network intelligence.

---

## 3. Technology Stack & Frameworks

### **Frontend Tier (Web Command Center)**
* **Framework**: Next.js 14 (App Router) + React 18 + TypeScript (Strict Mode).
* **Styling & UI**: Tailwind CSS + Custom Design System + Glassmorphism (`backdrop-filter: blur`).
* **Animations**: Framer Motion (smooth tab switches, number counters, pulsing radar keyframes).
* **3D Visual & Spatial GIS**: Three.js / React Three Fiber + Leaflet.js / Mapbox GL 3D + `3d-force-graph`.
* **Charts**: Recharts + Lucide React Icons.

### **Backend Tier (Analytics & ML Engine)**
* **Framework**: Python FastAPI (Async ASGI Server).
* **Data Science & ML**: `scikit-learn` & `xgboost` (DBSCAN spatial clustering, 30-day risk forecasting) + `networkx` (Gang ringleader centrality).
* **Protocol & Interoperability**: **Model Context Protocol (MCP)** SDK exposing JSON-RPC tools (`backend/mcp_server.py`).

### **Deployment & Infrastructure (Zoho Catalyst)**
* **Runtime**: **Zoho Catalyst AppSail** (Managed OCI Container Runtime).
* **Manifests**: `Dockerfile` + `app-service.json`.

---

## 4. The 20-Service Zoho Catalyst Integration Matrix

| # | Official Catalyst Capability | Required Catalyst Service | Technical Role in KaavalAI Architecture |
|---|---|---|---|
| **1** | Docker image deployment & Managed web app | **Catalyst AppSail** | Managed OCI Docker runtime hosting Next.js 14 Web Command Center & Python FastAPI backend. |
| **2** | Relational database & Full-text search | **Catalyst Data Store** | Relational SQL engine enforcing the official 24-table KSP FIR ERD Schema with full-text search. |
| **3** | Unstructured / semi-structured data | **Catalyst NoSQL** | Document store for high-speed spatial geospatial queries and unstructured case facts (`BriefFacts`). |
| **4** | Object / blob storage (S3-style) | **Catalyst Stratus** | Object storage for FIR evidence documents, CCTV snapshots, and victim statements. |
| **5** | PDF / report generation & headless browser | **Catalyst SmartBrowz** | Headless PDF generator exporting official police case briefs and investigative evidence logs. |
| **6** | Text Analytics & MO Code Matching | **Catalyst Zia Services** | AI text analytics engine matching repeat offender Modus Operandi (MO) codes across stations. |
| **7** | Automated model training (tabular) | **Catalyst Zia AutoML** | Automated training pipeline for station-level crime spike frequency predictions. |
| **8** | Text LLMs / RAG & No-code ML pipelines | **Catalyst QuickML** | ML pipeline for RAG-based case history search & 30-day predictive risk scoring. |
| **9** | Cross-app event bus & event routing | **Catalyst Signals** | Real-time cross-app event bus broadcasting emergency red-zone crime spike alerts. |
| **10** | Reacting to in-project events | **Catalyst Event Functions** | Serverless functions executing automated risk triggers whenever a new FIR is registered. |
| **11** | Multi-step workflow orchestration | **Catalyst Circuits** | Multi-step state machine orchestrating automated emergency dispatch and escalation. |
| **12** | Memory Cache | **Catalyst Cache** | High-speed memory cache storing district boundary polygons and lookup tables (Rank, Unit, Act/Section). |
| **13** | API routing, throttling & auth | **Catalyst API Gateway** | Secure API routing, throttling, and CORS protection in front of backend endpoints & MCP server. |
| **14** | User Auth / login / signup | **Catalyst Authentication** | Role-based authentication (RBAC) for Investigators, Analysts, Station House Officers, and SCRB Chiefs. |
| **15** | Scheduled jobs / cron | **Catalyst Cron** | Cloud-scale job scheduler executing nightly ML predictive risk re-forecasting. |
| **16** | CI/CD Automated Pipelines | **Catalyst Pipelines** | CI/CD automated deployment pipeline for zero-downtime AppSail container updates. |
| **17** | Transactional email | **Catalyst Mail** | Transactional mailer sending instant emergency alerts to Station House Officers on red-zone spikes. |
| **18** | Push notifications | **Catalyst Push Notifications** | Mobile & desktop push alerts dispatched to active duty officers when red-zone thresholds breach. |
| **19** | OAuth tokens & 3rd-party auth | **Catalyst Connections** | Secure OAuth 2.0 integration with existing Karnataka State Police IT portals. |
| **20** | Custom domain & SSL certificate | **Catalyst Domain Mappings** | Custom domain mapping with managed SSL encryption for official police command access. |

---

## 5. Official 24-Table KSP FIR Database ERD Schema

Implemented in `backend/synthetic_data_generator.py` and SQLite/PostgreSQL database:

1. **`State`**: StateID, StateName, NationalityID, Active.
2. **`District`**: DistrictID, DistrictName, StateID, Active.
3. **`UnitType`**: UnitTypeID, UnitTypeName, CityDistState, Hierarchy, Active.
4. **`Unit`**: UnitID, UnitName, TypeID, ParentUnit, NationalityID, StateID, DistrictID, Active.
5. **`Rank`**: RankID, RankName, Hierarchy, Active.
6. **`Designation`**: DesignationID, DesignationName, Active, SortOrder.
7. **`Employee`**: EmployeeID, DistrictID, UnitID, RankID, DesignationID, KGID, FirstName, EmployeeDOB, GenderID, BloodGroupID, PhysicallyChallenged, AppointmentDate.
8. **`CaseCategory`**: CaseCategoryID, LookupValue (FIR: 1, UDR: 3, PAR: 4, Zero FIR: 8).
9. **`GravityOffence`**: GravityOffenceID, LookupValue (Heinous, Non-Heinous).
10. **`CrimeHead`**: CrimeHeadID, CrimeGroupName, Active.
11. **`CrimeSubHead`**: CrimeSubHeadID, CrimeHeadID, CrimeHeadName, SeqID.
12. **`CaseStatusMaster`**: CaseStatusID, CaseStatusName.
13. **`Court`**: CourtID, CourtName, DistrictID, StateID, Active.
14. **`CaseMaster`**: CaseMasterID, CrimeNo (`104430006202600001`), CaseNo (`202600001`), CrimeRegisteredDate, PolicePersonID, PoliceStationID, CaseCategoryID, GravityOffenceID, CrimeMajorHeadID, CrimeMinorHeadID, CaseStatusID, CourtID, IncidentFromDate, IncidentToDate, InfoReceivedPSDate, latitude, longitude, BriefFacts.
15. **`OccupationMaster`**: OccupationID, OccupationName.
16. **`ReligionMaster`**: ReligionID, ReligionName.
17. **`CasteMaster`**: caste_master_id, caste_master_name.
18. **`ComplainantDetails`**: ComplainantID, CaseMasterID, ComplainantName, AgeYear, OccupationID, ReligionID, CasteID, GenderID.
19. **`Act`**: ActCode, ActDescription, ShortName, Active.
20. **`Section`**: ActCode, SectionCode, SectionDescription, Active.
21. **`ActSectionAssociation`**: CaseMasterID, ActID, SectionID, ActOrderID, SectionOrderID.
22. **`CrimeHeadActSection`**: CrimeHeadID, ActCode, SectionCode.
23. **`Victim`**: VictimMasterID, CaseMasterID, VictimName, AgeYear, GenderID, VictimPolice.
24. **`Accused`**: AccusedMasterID, CaseMasterID, AccusedName, AgeYear, GenderID, PersonID.
25. **`ArrestSurrender`**: ArrestSurrenderID, CaseMasterID, ArrestSurrenderTypeID, ArrestSurrenderDate, ArrestSurrenderStateId, ArrestSurrenderDistrictId, PoliceStationID, IOID, CourtID, AccusedMasterID, IsAccused, IsComplainantAccused.
26. **`ChargesheetDetails`**: CSID, CaseMasterID, csdate, cstype (A/B/C), PolicePersonID.

---

## 6. Key Application Modules & File Structure

```
e:\Datathon\
├── Dockerfile                         # Zoho Catalyst AppSail OCI container build configuration
├── app-service.json                   # Zoho Catalyst AppSail service manifest
├── package.json                       # Next.js 14, Tailwind, Three.js, Leaflet dependencies
├── tsconfig.json                      # TypeScript configuration
├── tailwind.config.js                 # Custom dark command center theme
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with dark mode background
│   │   ├── globals.css                # Custom glassmorphism & map styles
│   │   └── page.tsx                   # Main 3D Command & Intelligence Center dashboard
│   └── components/
│       ├── CommandHeader.tsx          # Executive status bar, RBAC role switcher, PDF export
│       ├── Map3D.tsx                  # 3D spatial map with pulsing red-zone radar pulses
│       ├── NetworkGraph3D.tsx         # 3D force-directed criminal syndicate web
│       ├── PredictiveDashboard.tsx    # ML risk forecasting, Zia MO NLP search & Signal alerts
│       └── CatalystDrawer.tsx         # Slide-out drawer showcasing 20 Catalyst services
└── backend/
    ├── ksp_database.db                # SQLite database populated with 3,000+ KSP FIR records
    ├── synthetic_data_generator.py    # Python script seeding all 24 KSP ERD tables
    ├── database_adapter.py            # Unified SQLite & Catalyst Data Store abstraction layer
    ├── catalyst_client.py             # Catalyst Services SDK client (SmartBrowz, Zia, Signals)
    ├── main.py                        # FastAPI server exposing REST API endpoints
    └── mcp_server.py                  # Model Context Protocol (MCP) server integration
```

---

## 7. Verification & Production Build Status
* **Synthetic Database**: Generated 3,000+ FIR records across 24 ERD tables (`[SUCCESS] Database generation complete!`).
* **FastAPI Backend**: Verified query execution (`{'total_firs': 3000, 'heinous_crimes': 1991, 'total_accused': 3000, 'total_stations': 21, 'active_red_zones': 6}`).
* **Next.js Production Build**: `npm run build` passed 100% cleanly (`✓ Compiled successfully`, `✓ Generating static pages (4/4)`).

---

## 8. Summary Prompt to Share with Any AI Assistant

> *"We are building KaavalAI, a 3D AI Crime Analytics & Visualization Platform for Challenge 02 of the Karnataka State Police (KSP) Datathon 2026. The stack uses Next.js 14, TypeScript, Tailwind CSS, Three.js, React-Leaflet, and Framer Motion on the frontend, with a Python FastAPI backend running Scikit-Learn (DBSCAN), XGBoost, NetworkX graph centrality, and a native Model Context Protocol (MCP) server. It features an official 24-table KSP FIR ERD database seeded with 3,000+ realistic records across 31 districts, and is configured for deployment on Zoho Catalyst AppSail integrating 14 Zoho Catalyst services."*
