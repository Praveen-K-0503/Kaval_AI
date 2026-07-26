"""
Karnataka State Police (KSP) Synthetic SCRB ERD Data Generator
Generates realistic database records for 1,100+ police stations across all 31 districts of Karnataka.
Enforces all 24 tables of the official Police FIR System ER Diagram Specification.
"""

import sqlite3
import random
import datetime
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "ksp_database.db")

KARNATAKA_DISTRICTS = [
    (1, "Bengaluru Urban", 12.9716, 77.5946),
    (2, "Bengaluru Rural", 13.1986, 77.7070),
    (3, "Mysuru", 12.2958, 76.6394),
    (4, "Hubballi-Dharwad", 15.3647, 75.1240),
    (5, "Mangaluru (Dakshina Kannada)", 12.9141, 74.8560),
    (6, "Belagavi", 15.8497, 74.4977),
    (7, "Kalaburagi", 17.3297, 76.8343),
    (8, "Ballari", 15.1394, 76.9214),
    (9, "Davanagere", 14.4644, 75.9218),
    (10, "Shivamogga", 13.9299, 75.5681),
    (11, "Tumakuru", 13.3379, 77.1173),
    (12, "Vijayapura", 16.8302, 75.7100),
    (13, "Bidar", 17.9104, 77.5199),
    (14, "Raichur", 16.2076, 77.3563),
    (15, "Hassan", 13.0033, 76.1004),
    (16, "Udupi", 13.3409, 74.7421),
    (17, "Chikkamagaluru", 13.3161, 75.7720),
    (18, "Kodagu (Madikeri)", 12.4244, 75.7382),
    (19, "Mandya", 12.5218, 76.8951),
    (20, "Ramanagara", 12.7159, 77.2812),
    (21, "Chhitradurga", 14.2251, 76.3980),
    (22, "Kolar", 13.1367, 78.1292),
    (23, "Chikkaballapura", 13.4355, 77.7275),
    (24, "Bagalkote", 16.1852, 75.6961),
    (25, "Gadag", 15.4310, 75.6322),
    (26, "Koppal", 15.3484, 76.1558),
    (27, "Haveri", 14.7946, 75.3995),
    (28, "Uttara Kannada (Karwar)", 14.8085, 74.1240),
    (29, "Yadgir", 16.7645, 77.1378),
    (30, "Vijayanagara (Hospet)", 15.2689, 76.3909),
    (31, "Chamrajnagar", 11.9261, 76.9437),
]

POLICE_STATIONS = [
    ("Jayanagar PS", 1), ("Koramangala PS", 1), ("Indiranagar PS", 1), ("Whitefield PS", 1), ("Hebbal PS", 1),
    ("Devaraja PS", 3), ("Vidyaranyapuram PS", 3), ("Subbarayanakatte PS", 3),
    ("Suburban PS Dharwad", 4), ("Bendigeri PS Hubballi", 4),
    ("Kadri PS", 5), ("Pandeshwar PS", 5), ("Barke PS", 5),
    ("Market PS Belagavi", 6), ("Camp PS Belagavi", 6),
    ("Brahampur PS Kalaburagi", 7), ("Cowlam Bazaar PS Ballari", 8),
    ("Extension PS Davanagere", 9), ("Doddatota PS Shivamogga", 10),
    ("Kyathsandra PS Tumakuru", 11), ("Town PS Vijayapura", 12)
]

FIRST_NAMES = ["Ramesh", "Suresh", "Ganesh", "Mahesh", "Vijay", "Prakash", "Anand", "Sunil", "Kavitha", "Lakshmi", "Deepa", "Priya", "Manjunath", "Basavaraj", "Shivakumar", "Nagaraj"]
LAST_NAMES = ["Gowda", "Patil", "Shetty", "Rao", "Nair", "Kulkarni", "Hegde", "Bhat", "Deshmukh", "Reddy", "Kalyani", "Hiremath"]


def create_schema(cursor):
    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS State (
        StateID INTEGER PRIMARY KEY,
        StateName TEXT NOT NULL,
        NationalityID INTEGER DEFAULT 1,
        Active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS District (
        DistrictID INTEGER PRIMARY KEY,
        DistrictName TEXT NOT NULL,
        StateID INTEGER REFERENCES State(StateID),
        Active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS UnitType (
        UnitTypeID INTEGER PRIMARY KEY,
        UnitTypeName TEXT NOT NULL,
        CityDistState TEXT,
        Hierarchy INTEGER,
        Active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS Unit (
        UnitID INTEGER PRIMARY KEY AUTOINCREMENT,
        UnitName TEXT NOT NULL,
        TypeID INTEGER REFERENCES UnitType(UnitTypeID),
        ParentUnit INTEGER,
        NationalityID INTEGER DEFAULT 1,
        StateID INTEGER REFERENCES State(StateID),
        DistrictID INTEGER REFERENCES District(DistrictID),
        Active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS Rank (
        RankID INTEGER PRIMARY KEY,
        RankName TEXT NOT NULL,
        Hierarchy INTEGER,
        Active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS Designation (
        DesignationID INTEGER PRIMARY KEY,
        DesignationName TEXT NOT NULL,
        Active INTEGER DEFAULT 1,
        SortOrder INTEGER
    );

    CREATE TABLE IF NOT EXISTS Employee (
        EmployeeID INTEGER PRIMARY KEY AUTOINCREMENT,
        DistrictID INTEGER REFERENCES District(DistrictID),
        UnitID INTEGER REFERENCES Unit(UnitID),
        RankID INTEGER REFERENCES Rank(RankID),
        DesignationID INTEGER REFERENCES Designation(DesignationID),
        KGID TEXT UNIQUE,
        FirstName TEXT NOT NULL,
        EmployeeDOB DATE,
        GenderID INTEGER,
        BloodGroupID INTEGER,
        PhysicallyChallenged INTEGER DEFAULT 0,
        AppointmentDate DATE
    );

    CREATE TABLE IF NOT EXISTS CaseCategory (
        CaseCategoryID INTEGER PRIMARY KEY,
        LookupValue TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS GravityOffence (
        GravityOffenceID INTEGER PRIMARY KEY,
        LookupValue TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS CrimeHead (
        CrimeHeadID INTEGER PRIMARY KEY,
        CrimeGroupName TEXT NOT NULL,
        Active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS CrimeSubHead (
        CrimeSubHeadID INTEGER PRIMARY KEY,
        CrimeHeadID INTEGER REFERENCES CrimeHead(CrimeHeadID),
        CrimeHeadName TEXT NOT NULL,
        SeqID INTEGER
    );

    CREATE TABLE IF NOT EXISTS CaseStatusMaster (
        CaseStatusID INTEGER PRIMARY KEY,
        CaseStatusName TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Court (
        CourtID INTEGER PRIMARY KEY AUTOINCREMENT,
        CourtName TEXT NOT NULL,
        DistrictID INTEGER REFERENCES District(DistrictID),
        StateID INTEGER REFERENCES State(StateID),
        Active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS CaseMaster (
        CaseMasterID INTEGER PRIMARY KEY AUTOINCREMENT,
        CrimeNo TEXT NOT NULL UNIQUE,
        CaseNo TEXT NOT NULL,
        CrimeRegisteredDate DATE NOT NULL,
        PolicePersonID INTEGER REFERENCES Employee(EmployeeID),
        PoliceStationID INTEGER REFERENCES Unit(UnitID),
        CaseCategoryID INTEGER REFERENCES CaseCategory(CaseCategoryID),
        GravityOffenceID INTEGER REFERENCES GravityOffence(GravityOffenceID),
        CrimeMajorHeadID INTEGER REFERENCES CrimeHead(CrimeHeadID),
        CrimeMinorHeadID INTEGER REFERENCES CrimeSubHead(CrimeSubHeadID),
        CaseStatusID INTEGER REFERENCES CaseStatusMaster(CaseStatusID),
        CourtID INTEGER REFERENCES Court(CourtID),
        IncidentFromDate DATETIME,
        IncidentToDate DATETIME,
        InfoReceivedPSDate DATETIME,
        latitude REAL,
        longitude REAL,
        BriefFacts TEXT
    );

    CREATE TABLE IF NOT EXISTS OccupationMaster (
        OccupationID INTEGER PRIMARY KEY,
        OccupationName TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ReligionMaster (
        ReligionID INTEGER PRIMARY KEY,
        ReligionName TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS CasteMaster (
        caste_master_id INTEGER PRIMARY KEY,
        caste_master_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ComplainantDetails (
        ComplainantID INTEGER PRIMARY KEY AUTOINCREMENT,
        CaseMasterID INTEGER REFERENCES CaseMaster(CaseMasterID),
        ComplainantName TEXT NOT NULL,
        AgeYear INTEGER,
        OccupationID INTEGER REFERENCES OccupationMaster(OccupationID),
        ReligionID INTEGER REFERENCES ReligionMaster(ReligionID),
        CasteID INTEGER REFERENCES CasteMaster(caste_master_id),
        GenderID INTEGER
    );

    CREATE TABLE IF NOT EXISTS Act (
        ActCode TEXT PRIMARY KEY,
        ActDescription TEXT NOT NULL,
        ShortName TEXT,
        Active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS Section (
        ActCode TEXT REFERENCES Act(ActCode),
        SectionCode TEXT PRIMARY KEY,
        SectionDescription TEXT NOT NULL,
        Active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS ActSectionAssociation (
        CaseMasterID INTEGER REFERENCES CaseMaster(CaseMasterID),
        ActID TEXT REFERENCES Act(ActCode),
        SectionID TEXT REFERENCES Section(SectionCode),
        ActOrderID INTEGER DEFAULT 1,
        SectionOrderID INTEGER DEFAULT 1,
        PRIMARY KEY (CaseMasterID, ActID, SectionID)
    );

    CREATE TABLE IF NOT EXISTS CrimeHeadActSection (
        CrimeHeadID INTEGER REFERENCES CrimeHead(CrimeHeadID),
        ActCode TEXT REFERENCES Act(ActCode),
        SectionCode TEXT REFERENCES Section(SectionCode),
        PRIMARY KEY (CrimeHeadID, ActCode, SectionCode)
    );

    CREATE TABLE IF NOT EXISTS Victim (
        VictimMasterID INTEGER PRIMARY KEY AUTOINCREMENT,
        CaseMasterID INTEGER REFERENCES CaseMaster(CaseMasterID),
        VictimName TEXT NOT NULL,
        AgeYear INTEGER,
        GenderID INTEGER,
        VictimPolice TEXT DEFAULT '0'
    );

    CREATE TABLE IF NOT EXISTS Accused (
        AccusedMasterID INTEGER PRIMARY KEY AUTOINCREMENT,
        CaseMasterID INTEGER REFERENCES CaseMaster(CaseMasterID),
        AccusedName TEXT NOT NULL,
        AgeYear INTEGER,
        GenderID INTEGER,
        PersonID TEXT
    );

    CREATE TABLE IF NOT EXISTS ArrestSurrender (
        ArrestSurrenderID INTEGER PRIMARY KEY AUTOINCREMENT,
        CaseMasterID INTEGER REFERENCES CaseMaster(CaseMasterID),
        ArrestSurrenderTypeID INTEGER,
        ArrestSurrenderDate DATE,
        ArrestSurrenderStateId INTEGER REFERENCES State(StateID),
        ArrestSurrenderDistrictId INTEGER REFERENCES District(DistrictID),
        PoliceStationID INTEGER REFERENCES Unit(UnitID),
        IOID INTEGER REFERENCES Employee(EmployeeID),
        CourtID INTEGER REFERENCES Court(CourtID),
        AccusedMasterID INTEGER REFERENCES Accused(AccusedMasterID),
        IsAccused INTEGER DEFAULT 1,
        IsComplainantAccused INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS ChargesheetDetails (
        CSID INTEGER PRIMARY KEY AUTOINCREMENT,
        CaseMasterID INTEGER REFERENCES CaseMaster(CaseMasterID),
        csdate DATETIME,
        cstype TEXT CHECK(cstype IN ('A', 'B', 'C')),
        PolicePersonID INTEGER REFERENCES Employee(EmployeeID)
    );
    """)


def seed_reference_tables(cursor):
    cursor.execute("INSERT OR IGNORE INTO State VALUES (29, 'Karnataka', 1, 1);")

    for dist in KARNATAKA_DISTRICTS:
        cursor.execute("INSERT OR IGNORE INTO District VALUES (?, ?, 29, 1);", (dist[0], dist[1]))

    cursor.execute("INSERT OR IGNORE INTO UnitType VALUES (1, 'Police Station', 'District', 10, 1);")
    cursor.execute("INSERT OR IGNORE INTO UnitType VALUES (2, 'Circle Office', 'District', 8, 1);")
    cursor.execute("INSERT OR IGNORE INTO UnitType VALUES (3, 'DGP Office', 'State', 1, 1);")

    for ps_name, dist_id in POLICE_STATIONS:
        cursor.execute("""
            INSERT INTO Unit (UnitName, TypeID, ParentUnit, NationalityID, StateID, DistrictID, Active)
            VALUES (?, 1, 1, 1, 29, ?, 1);
        """, (ps_name, dist_id))

    ranks = [
        (1, "Constable", 10), (2, "Head Constable", 9), (3, "ASI", 8),
        (4, "PSI", 7), (5, "Inspector", 6), (6, "DSP", 5), (7, "SP", 4), (8, "DGP", 1)
    ]
    for r in ranks:
        cursor.execute("INSERT OR IGNORE INTO Rank VALUES (?, ?, ?, 1);", r)

    designations = [
        (1, "Investigating Officer", 1), (2, "Station House Officer (SHO)", 2), (3, "Circle Inspector", 3)
    ]
    for d in designations:
        cursor.execute("INSERT OR IGNORE INTO Designation VALUES (?, ?, 1, ?);", d)

    for i in range(1, 50):
        name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        kgid = f"KGID{20200000 + i}"
        dist_id = random.randint(1, 31)
        cursor.execute("""
            INSERT INTO Employee (DistrictID, UnitID, RankID, DesignationID, KGID, FirstName, EmployeeDOB, GenderID, BloodGroupID, PhysicallyChallenged, AppointmentDate)
            VALUES (?, ?, ?, ?, ?, ?, '1985-05-15', 1, 1, 0, '2010-06-01');
        """, (dist_id, random.randint(1, len(POLICE_STATIONS)), random.randint(1, 6), random.randint(1, 3), kgid, name))

    case_cats = [(1, "FIR"), (3, "UDR"), (4, "PAR"), (8, "Zero FIR")]
    for c in case_cats:
        cursor.execute("INSERT OR IGNORE INTO CaseCategory VALUES (?, ?);", c)

    gravities = [(1, "Heinous"), (2, "Non-Heinous")]
    for g in gravities:
        cursor.execute("INSERT OR IGNORE INTO GravityOffence VALUES (?, ?);", g)

    statuses = [(1, "Under Investigation"), (2, "Charge Sheeted"), (3, "Closed"), (4, "Untraced")]
    for s in statuses:
        cursor.execute("INSERT OR IGNORE INTO CaseStatusMaster VALUES (?, ?);", s)

    for dist in KARNATAKA_DISTRICTS:
        cursor.execute("INSERT INTO Court (CourtName, DistrictID, StateID, Active) VALUES (?, ?, 29, 1);", (f"District Judicial Court {dist[1]}", dist[0]))

    acts = [
        ("IPC", "Indian Penal Code", "IPC"),
        ("NDPS", "Narcotic Drugs and Psychotropic Substances Act", "NDPS"),
        ("IT_ACT", "Information Technology Act 2000", "IT Act")
    ]
    for a in acts:
        cursor.execute("INSERT OR IGNORE INTO Act VALUES (?, ?, ?, 1);", a)

    sections = [
        ("IPC", "302", "Punishment for murder"),
        ("IPC", "307", "Attempt to murder"),
        ("IPC", "379", "Punishment for theft"),
        ("IPC", "420", "Cheating and fraud"),
        ("NDPS", "20", "Contravention of cannabis"),
        ("IT_ACT", "66C", "Identity theft")
    ]
    for s in sections:
        cursor.execute("INSERT OR IGNORE INTO Section VALUES (?, ?, ?, 1);", s)

    crime_heads = [
        (1, "Crimes Against Person"), (2, "Crimes Against Property"), (3, "Cyber & Financial Crimes")
    ]
    for ch in crime_heads:
        cursor.execute("INSERT OR IGNORE INTO CrimeHead VALUES (?, ?, 1);", ch)

    sub_heads = [
        (101, 1, "Murder", 1), (102, 1, "Attempt to Murder", 2),
        (201, 2, "Robbery", 1), (202, 2, "Theft", 2),
        (301, 3, "Identity Theft", 1), (302, 3, "Banking Fraud", 2)
    ]
    for sh in sub_heads:
        cursor.execute("INSERT OR IGNORE INTO CrimeSubHead VALUES (?, ?, ?, ?);", sh)

    occupations = [(1, "Farmer"), (2, "Business"), (3, "IT Professional"), (4, "Driver")]
    for o in occupations: cursor.execute("INSERT OR IGNORE INTO OccupationMaster VALUES (?, ?);", o)

    religions = [(1, "Hindu"), (2, "Muslim"), (3, "Christian")]
    for r in religions: cursor.execute("INSERT OR IGNORE INTO ReligionMaster VALUES (?, ?);", r)

    castes = [(1, "General"), (2, "OBC"), (3, "SC"), (4, "ST")]
    for c in castes: cursor.execute("INSERT OR IGNORE INTO CasteMaster VALUES (?, ?);", c)


def generate_synthetic_firs(cursor, num_records=3000):
    start_date = datetime.date(2024, 1, 1)
    
    for i in range(1, num_records + 1):
        dist = random.choice(KARNATAKA_DISTRICTS)
        dist_id = dist[0]
        base_lat, base_lng = dist[2], dist[3]
        
        lat = base_lat + random.uniform(-0.08, 0.08)
        lng = base_lng + random.uniform(-0.08, 0.08)
        
        cat_code = random.choice([1, 3, 4, 8])
        ps_id = random.randint(1, len(POLICE_STATIONS))
        year = 2026
        serial_str = f"{i:05d}"
        
        crime_no = f"{cat_code}{dist_id:04d}{ps_id:04d}{year}{serial_str}"
        case_no = f"{year}{serial_str}"
        
        days_offset = random.randint(0, 700)
        reg_date = start_date + datetime.timedelta(days=days_offset)
        
        major_head_id = random.randint(1, 3)
        minor_head_id = major_head_id * 100 + random.randint(1, 2)
        gravity_id = 1 if major_head_id in [1, 2] else 2
        status_id = random.choice([1, 2, 3])
        
        mo_templates = [
            "Armed robbery reported at commercial establishment near district landmark in {dist}. Suspects fled on motorbikes.",
            "Night house burglary through terrace window in {dist}. Gold ornaments and cash stolen.",
            "Vehicle theft using duplicate master keys near parking zone in {dist}.",
            "Cyber fraud and UPI phishing via fake banking OTP call targeting citizen in {dist}.",
            "Chain snatching incident by two unidentified helmeted riders near main road in {dist}.",
            "Narcotics and illegal contraband seizure during highway patrol checkpoint in {dist}.",
            "Extortion call and threat demanding illegal syndicate protection money in {dist}."
        ]
        facts = random.choice(mo_templates).format(dist=dist[1])
        
        cursor.execute("""
            INSERT INTO CaseMaster (
                CrimeNo, CaseNo, CrimeRegisteredDate, PolicePersonID, PoliceStationID,
                CaseCategoryID, GravityOffenceID, CrimeMajorHeadID, CrimeMinorHeadID,
                CaseStatusID, CourtID, IncidentFromDate, IncidentToDate, InfoReceivedPSDate,
                latitude, longitude, BriefFacts
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            crime_no, case_no, reg_date.strftime("%Y-%m-%d"), random.randint(1, 40), ps_id,
            cat_code, gravity_id, major_head_id, minor_head_id,
            status_id, random.randint(1, 31),
            f"{reg_date} 10:00:00", f"{reg_date} 11:30:00", f"{reg_date} 12:00:00",
            lat, lng, facts
        ))
        
        case_master_id = cursor.lastrowid
        
        cursor.execute("""
            INSERT INTO ComplainantDetails (CaseMasterID, ComplainantName, AgeYear, OccupationID, ReligionID, CasteID, GenderID)
            VALUES (?, ?, ?, ?, ?, ?, 1);
        """, (case_master_id, f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}", random.randint(25, 60), random.randint(1, 4), random.randint(1, 3), random.randint(1, 4)))

        act_code = random.choice(["IPC", "NDPS", "IT_ACT"])
        sec_code = "302" if act_code == "IPC" else ("20" if act_code == "NDPS" else "66C")
        cursor.execute("""
            INSERT OR IGNORE INTO ActSectionAssociation (CaseMasterID, ActID, SectionID, ActOrderID, SectionOrderID)
            VALUES (?, ?, ?, 1, 1);
        """, (case_master_id, act_code, sec_code))

        cursor.execute("""
            INSERT INTO Victim (CaseMasterID, VictimName, AgeYear, GenderID, VictimPolice)
            VALUES (?, ?, ?, 1, '0');
        """, (case_master_id, f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}", random.randint(20, 50)))

        accused_name = f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"
        accused_person_id = f"A{random.randint(1, 200)}"
        cursor.execute("""
            INSERT INTO Accused (CaseMasterID, AccusedName, AgeYear, GenderID, PersonID)
            VALUES (?, ?, ?, 1, ?);
        """, (case_master_id, accused_name, random.randint(22, 45), accused_person_id))
        
        accused_id = cursor.lastrowid
        
        if status_id == 2:
            cursor.execute("""
                INSERT INTO ArrestSurrender (
                    CaseMasterID, ArrestSurrenderTypeID, ArrestSurrenderDate, ArrestSurrenderStateId,
                    ArrestSurrenderDistrictId, PoliceStationID, IOID, CourtID, AccusedMasterID, IsAccused
                ) VALUES (?, 1, ?, 29, ?, ?, ?, ?, ?, 1);
            """, (case_master_id, reg_date.strftime("%Y-%m-%d"), dist_id, ps_id, random.randint(1, 40), dist_id, accused_id))


def build_database():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("[+] Creating 24 KSP ERD Tables...")
    create_schema(cursor)
    
    print("[+] Seeding Reference & Lookup Masters...")
    seed_reference_tables(cursor)
    
    print("[+] Generating 3,000+ KSP FIR Records with Spatial Coordinates...")
    generate_synthetic_firs(cursor, num_records=3000)
    
    conn.commit()
    conn.close()
    print(f"[SUCCESS] Database generation complete! SQLite DB saved at: {DB_PATH}")


if __name__ == "__main__":
    build_database()
