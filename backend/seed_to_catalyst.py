"""
KaavalAI KSP — Catalyst Data Store Seeding Script
Phase 1: Populates all 26 KSP FIR ERD tables with 10,000+ realistic records

Usage:
  python seed_to_catalyst.py          → seeds all 26 tables
  python seed_to_catalyst.py --table CaseMaster  → seeds only one table
  python seed_to_catalyst.py --verify  → verifies row counts per table

PREREQUISITES:
  1. CATALYST_ENV=production in .env
  2. Catalyst project created and credentials set
  3. All 26 tables created in Catalyst Data Store console
  4. pip install zcatalyst-sdk python-dotenv
"""

import os
import sys
import random
import datetime
import argparse
import logging
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Force Catalyst mode for this script
os.environ["CATALYST_ENV"] = "production"

from catalyst_sdk_real import catalyst_ds, KSP_TABLES

# ── Reference Data ────────────────────────────────────────────────────────

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
    (18, "Kodagu", 12.4244, 75.7382),
    (19, "Mandya", 12.5218, 76.8951),
    (20, "Ramanagara", 12.7159, 77.2812),
    (21, "Chitradurga", 14.2251, 76.3980),
    (22, "Kolar", 13.1367, 78.1292),
    (23, "Chikkaballapura", 13.4355, 77.7275),
    (24, "Bagalkote", 16.1852, 75.6961),
    (25, "Gadag", 15.4310, 75.6322),
    (26, "Koppal", 15.3484, 76.1558),
    (27, "Haveri", 14.7946, 75.3995),
    (28, "Uttara Kannada", 14.8085, 74.1240),
    (29, "Yadgir", 16.7645, 77.1378),
    (30, "Vijayanagara", 15.2689, 76.3909),
    (31, "Chamrajnagar", 11.9261, 76.9437),
]

POLICE_STATIONS = [
    ("Jayanagar PS", 1), ("Koramangala PS", 1), ("Indiranagar PS", 1),
    ("Whitefield PS", 1), ("Hebbal PS", 1), ("Devanahalli PS", 2),
    ("Devaraja PS", 3), ("Vidyaranyapuram PS", 3), ("Subbarayanakatte PS", 3),
    ("Dharwad PS", 4), ("Hubballi North PS", 4), ("Kadri PS", 5),
    ("Pandeshwar PS", 5), ("Barke PS", 5), ("Market PS", 6),
    ("Camp PS Belagavi", 6), ("Brahampur PS", 7), ("Cowlam Bazaar PS", 8),
    ("Extension PS", 9), ("Doddatota PS", 10), ("Kyathsandra PS", 11),
    ("Town PS Vijayapura", 12), ("Bidar PS", 13), ("Raichur PS", 14),
    ("Hassan PS", 15), ("Udupi PS", 16), ("Chikkamagaluru PS", 17),
    ("Madikeri PS", 18), ("Mandya PS", 19), ("Ramanagara PS", 20),
    ("Chitradurga PS", 21), ("Kolar PS", 22), ("Chikkaballapura PS", 23),
    ("Bagalkote PS", 24), ("Gadag PS", 25), ("Koppal PS", 26),
    ("Haveri PS", 27), ("Karwar PS", 28), ("Yadgir PS", 29),
    ("Hospet PS", 30), ("Chamrajnagar PS", 31),
]

RANKS = [
    (1, "Director General of Police"), (2, "Additional Director General"),
    (3, "Inspector General of Police"), (4, "Deputy Inspector General"),
    (5, "Superintendent of Police"), (6, "Additional SP"),
    (7, "Deputy Superintendent of Police"), (8, "Inspector of Police"),
    (9, "Sub-Inspector of Police"), (10, "Assistant Sub-Inspector"),
    (11, "Head Constable"), (12, "Police Constable"),
]

CRIME_HEADS = [
    (1, "Crimes Against Body"), (2, "Crimes Against Property"),
    (3, "Crimes Against Women"), (4, "Crimes Against Children"),
    (5, "Economic Offences"), (6, "Cyber Crimes"),
    (7, "Narcotics & Drug Offences"), (8, "Public Order & Peace"),
    (9, "SC/ST Atrocities"), (10, "Traffic & Motor Vehicle"),
    (11, "Arms & Explosives"), (12, "Document & Identity Fraud"),
]

CRIME_SUB_HEADS = [
    (1, 1, "Murder"), (2, 1, "Attempt to Murder"), (3, 1, "Culpable Homicide"),
    (4, 1, "Grievous Hurt"), (5, 1, "Simple Hurt"), (6, 1, "Kidnapping"),
    (7, 2, "Robbery"), (8, 2, "Burglary (Day)"), (9, 2, "Burglary (Night)"),
    (10, 2, "Theft — Motor Vehicle"), (11, 2, "Theft — Mobile Phone"),
    (12, 2, "Theft — General"), (13, 3, "Rape"), (14, 3, "Eve Teasing"),
    (15, 3, "Domestic Violence"), (16, 3, "Dowry Harassment"),
    (17, 4, "Child Abuse"), (18, 4, "POCSO Act Offence"),
    (19, 5, "Banking Fraud"), (20, 5, "Cheating & Impersonation"),
    (21, 6, "Cyber Fraud — ATM Cloning"), (22, 6, "Online Cheating"),
    (23, 6, "Identity Theft"), (24, 7, "NDPS Act — Possession"),
    (25, 7, "NDPS Act — Trafficking"), (26, 8, "Unlawful Assembly"),
    (27, 8, "Rioting"), (28, 9, "SC/ST Prevention of Atrocities"),
]

IPC_ACTS = [
    ("IPC", "Indian Penal Code, 1860", "IPC"),
    ("CrPC", "Code of Criminal Procedure, 1973", "CrPC"),
    ("IT_ACT", "Information Technology Act, 2000", "IT Act"),
    ("NDPS", "Narcotic Drugs and Psychotropic Substances Act, 1985", "NDPS Act"),
    ("POCSO", "Protection of Children from Sexual Offences Act, 2012", "POCSO"),
    ("SC_ST", "Scheduled Castes and Tribes (Prevention of Atrocities) Act, 1989", "SC/ST Act"),
    ("DV_ACT", "Protection of Women from Domestic Violence Act, 2005", "DV Act"),
    ("ARMS", "Arms Act, 1959", "Arms Act"),
]

IPC_SECTIONS = [
    ("IPC", "302", "Murder"),
    ("IPC", "307", "Attempt to Murder"),
    ("IPC", "304A", "Causing Death by Negligence"),
    ("IPC", "325", "Voluntarily Causing Grievous Hurt"),
    ("IPC", "326", "Causing Grievous Hurt by Dangerous Weapons"),
    ("IPC", "363", "Kidnapping"),
    ("IPC", "376", "Punishment for Rape"),
    ("IPC", "379", "Punishment for Theft"),
    ("IPC", "380", "Theft in Dwelling House"),
    ("IPC", "392", "Robbery"),
    ("IPC", "395", "Dacoity"),
    ("IPC", "420", "Cheating and Dishonestly Inducing Delivery of Property"),
    ("IPC", "447", "Criminal Trespass"),
    ("IPC", "454", "Lurking House-Trespass or House-Breaking in order to commit Offence"),
    ("IPC", "498A", "Husband or Relatives of Husband of a Woman Subjecting Her to Cruelty"),
    ("IPC", "143", "Punishment for Being Member of Unlawful Assembly"),
    ("IT_ACT", "66C", "Identity Theft"),
    ("IT_ACT", "66D", "Cheating by Personation using Computer Resource"),
    ("NDPS", "20", "Punishment for Contravention in relation to Cannabis"),
    ("NDPS", "21", "Punishment for Contravention in relation to manufactured drugs"),
    ("POCSO", "4", "Punishment for Penetrative Sexual Assault"),
    ("SC_ST", "3", "Atrocities against SC/ST members"),
]

BRIEF_FACTS_TEMPLATES = [
    "The complainant reports that on {date} at approximately {time}, the accused {accused_name} forcibly entered the complainant's residence at {location} and committed the alleged offence. The accused fled the scene before police arrived. Neighbours witnessed the incident.",
    "Complainant states that accused {accused_name} had taken a loan of Rs. {amount} from the complainant promising to repay within 3 months. The accused has been evading repayment for {days} days and is now unreachable. The documents submitted by accused were found to be forged.",
    "The victim {victim_name} aged {age} years was returning home at {time} hours when the accused {accused_name} accosted and {crime_desc} at {location}. The victim managed to raise an alarm and neighbours informed the police.",
    "As per the complaint, the accused {accused_name} accessed the complainant's bank account using cloned ATM card and siphoned Rs. {amount} on {date} from {location} ATM. Bank records confirm the unauthorized transaction.",
    "Complainant's mobile phone (IMEI: {imei}) valued at Rs. {amount} was stolen from {location} on {date} at {time} hours. The accused was identified through CCTV footage and subsequently apprehended near {location}.",
    "A quantity of {drug} weighing {weight} grams was seized from the possession of accused {accused_name} at {location} on {date}. The accused failed to produce any prescription or authorization for possessing the controlled substance.",
    "The accused {accused_name} and associates assembled unlawfully at {location} and caused public disturbance, resulting in damage to public property estimated at Rs. {amount}. Lathi charge was necessitated to disperse the mob.",
    "Victim reported that accused {accused_name} (her husband) subjected her to physical and mental cruelty including demands for additional dowry amounting to Rs. {amount}. Medical examination confirms injuries consistent with assault.",
]

LOCATIONS = [
    "Jayanagar 4th Block", "Koramangala 5th Block", "Indiranagar 12th Main",
    "Whitefield Main Road", "Hebbal Flyover", "MG Road Junction",
    "Brigade Road", "Cunningham Road", "Residency Road", "Commercial Street",
    "Rajajinagar 2nd Block", "Malleswaram 15th Cross", "Basavanagudi",
    "Bannerghatta Road", "Electronic City Phase 1", "Sarjapur Road",
    "Marathahalli Bridge", "Outer Ring Road", "NH-44 Devanahalli",
    "Mysuru Road Kengeri", "Tumakuru Highway", "Airport Road",
]

FIRST_NAMES = ["Ramesh", "Suresh", "Ganesh", "Mahesh", "Vijay", "Prakash", "Anand",
               "Sunil", "Kavitha", "Lakshmi", "Deepa", "Priya", "Manjunath",
               "Basavaraj", "Shivakumar", "Nagaraj", "Ravi", "Kumar", "Arun", "Sathish",
               "Padma", "Savitha", "Rekha", "Sunita", "Meena", "Geetha", "Usha"]
LAST_NAMES = ["Gowda", "Patil", "Shetty", "Rao", "Nair", "Kulkarni", "Hegde",
              "Bhat", "Deshmukh", "Reddy", "Hiremath", "Naik", "Verma", "Sharma",
              "Swamy", "Murthy", "Iyengar", "Patel", "Singh", "Kumar"]

OCCUPATIONS = ["Farmer", "Government Employee", "Private Employee", "Business Person",
               "Daily Wage Laborer", "Retired", "Student", "Unemployed", "Teacher",
               "Driver", "Security Guard", "Shopkeeper"]
RELIGIONS = ["Hindu", "Muslim", "Christian", "Jain", "Buddhist", "Sikh", "Others"]
CASTES = ["SC", "ST", "OBC", "General", "Brahmin", "Lingayat", "Vokkaliga"]
CASE_STATUS = ["Under Investigation", "Charge Sheet Filed", "FIR Pending", "Closed (True)", "Closed (False)", "Court Trial Ongoing"]
COURTS = [
    ("City Civil and Sessions Court Bengaluru", 1),
    ("Additional Sessions Court Bengaluru", 1),
    ("Sessions Court Mysuru", 3),
    ("Sessions Court Hubballi", 4),
    ("Sessions Court Mangaluru", 5),
    ("Sessions Court Belagavi", 6),
    ("Sessions Court Kalaburagi", 7),
    ("Sessions Court Ballari", 8),
    ("Sessions Court Davanagere", 9),
    ("Sessions Court Shivamogga", 10),
]


def random_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"


def random_date(start_year=2023, end_year=2026):
    start = datetime.date(start_year, 1, 1)
    end = datetime.date(end_year, 7, 31)
    delta = (end - start).days
    return start + datetime.timedelta(days=random.randint(0, delta))


def gen_crime_no(category_code, district_id, station_id, year, serial):
    return f"{category_code}{district_id:04d}{station_id:04d}{year}{serial:05d}"


def gen_brief_facts(accused_name, victim_name=None):
    template = random.choice(BRIEF_FACTS_TEMPLATES)
    return template.format(
        date=str(random_date()),
        time=f"{random.randint(0,23):02d}:{random.randint(0,59):02d}",
        accused_name=accused_name,
        victim_name=victim_name or random_name(),
        location=random.choice(LOCATIONS),
        amount=random.choice([5000, 10000, 25000, 50000, 100000, 250000, 500000]),
        days=random.randint(30, 365),
        age=random.randint(18, 65),
        crime_desc="assaulted and robbed",
        imei=f"3{random.randint(10000000000000, 99999999999999)}",
        drug=random.choice(["Ganja", "Heroin", "Cocaine", "Meth"]),
        weight=round(random.uniform(5, 500), 1),
    )


# ── Seeder Functions ───────────────────────────────────────────────────────

def seed_reference_tables():
    """Seed all reference/lookup tables."""
    logger.info("=== Seeding Reference Tables ===")

    # State
    catalyst_ds.insert_row("State", {"StateID": 1, "StateName": "Karnataka", "NationalityID": 1, "Active": 1})
    catalyst_ds.insert_row("State", {"StateID": 2, "StateName": "Telangana", "NationalityID": 1, "Active": 1})
    catalyst_ds.insert_row("State", {"StateID": 3, "StateName": "Tamil Nadu", "NationalityID": 1, "Active": 1})
    logger.info("✅ State (3 records)")

    # UnitType
    for ut in [(1, "Police Station", "City", 3), (2, "Circle Office", "District", 2), (3, "District HQ", "District", 1), (4, "Commissionerate", "City", 1)]:
        catalyst_ds.insert_row("UnitType", {"UnitTypeID": ut[0], "UnitTypeName": ut[1], "CityDistState": ut[2], "Hierarchy": ut[3], "Active": 1})
    logger.info("✅ UnitType (4 records)")

    # Rank
    for r in RANKS:
        catalyst_ds.insert_row("Rank", {"RankID": r[0], "RankName": r[1], "Hierarchy": r[0], "Active": 1})
    logger.info(f"✅ Rank ({len(RANKS)} records)")

    # Designation
    for i, d in enumerate(["Investigating Officer", "Station House Officer", "SCRB Analyst", "Scene of Offence Officer", "IO Supervisor"], 1):
        catalyst_ds.insert_row("Designation", {"DesignationID": i, "DesignationName": d, "Active": 1, "SortOrder": i})
    logger.info("✅ Designation (5 records)")

    # CaseCategory
    for cc in [(1, "FIR"), (3, "UDR"), (4, "PAR"), (8, "Zero FIR")]:
        catalyst_ds.insert_row("CaseCategory", {"CaseCategoryID": cc[0], "LookupValue": cc[1]})
    logger.info("✅ CaseCategory (4 records)")

    # GravityOffence
    catalyst_ds.insert_row("GravityOffence", {"GravityOffenceID": 1, "LookupValue": "Heinous"})
    catalyst_ds.insert_row("GravityOffence", {"GravityOffenceID": 2, "LookupValue": "Non-Heinous"})
    logger.info("✅ GravityOffence (2 records)")

    # CrimeHead
    for h in CRIME_HEADS:
        catalyst_ds.insert_row("CrimeHead", {"CrimeHeadID": h[0], "CrimeGroupName": h[1], "Active": 1})
    logger.info(f"✅ CrimeHead ({len(CRIME_HEADS)} records)")

    # CrimeSubHead
    for s in CRIME_SUB_HEADS:
        catalyst_ds.insert_row("CrimeSubHead", {"CrimeSubHeadID": s[0], "CrimeHeadID": s[1], "CrimeHeadName": s[2], "SeqID": s[0]})
    logger.info(f"✅ CrimeSubHead ({len(CRIME_SUB_HEADS)} records)")

    # CaseStatusMaster
    for i, s in enumerate(CASE_STATUS, 1):
        catalyst_ds.insert_row("CaseStatusMaster", {"CaseStatusID": i, "CaseStatusName": s})
    logger.info(f"✅ CaseStatusMaster ({len(CASE_STATUS)} records)")

    # OccupationMaster
    for i, o in enumerate(OCCUPATIONS, 1):
        catalyst_ds.insert_row("OccupationMaster", {"OccupationID": i, "OccupationName": o})
    logger.info(f"✅ OccupationMaster ({len(OCCUPATIONS)} records)")

    # ReligionMaster
    for i, r in enumerate(RELIGIONS, 1):
        catalyst_ds.insert_row("ReligionMaster", {"ReligionID": i, "ReligionName": r})
    logger.info(f"✅ ReligionMaster ({len(RELIGIONS)} records)")

    # CasteMaster
    for i, c in enumerate(CASTES, 1):
        catalyst_ds.insert_row("CasteMaster", {"caste_master_id": i, "caste_master_name": c})
    logger.info(f"✅ CasteMaster ({len(CASTES)} records)")

    # Act
    for act in IPC_ACTS:
        catalyst_ds.insert_row("Act", {"ActCode": act[0], "ActDescription": act[1], "ShortName": act[2], "Active": 1})
    logger.info(f"✅ Act ({len(IPC_ACTS)} records)")

    # Section
    for sec in IPC_SECTIONS:
        catalyst_ds.insert_row("Section", {"ActCode": sec[0], "SectionCode": sec[1], "SectionDescription": sec[2], "Active": 1})
    logger.info(f"✅ Section ({len(IPC_SECTIONS)} records)")

    # CrimeHeadActSection
    mappings = [(1,"IPC","302"),(1,"IPC","307"),(2,"IPC","379"),(2,"IPC","392"),(3,"IPC","376"),(3,"IPC","498A"),(6,"IT_ACT","66C"),(6,"IT_ACT","66D"),(7,"NDPS","20")]
    for m in mappings:
        catalyst_ds.insert_row("CrimeHeadActSection", {"CrimeHeadID": m[0], "ActCode": m[1], "SectionCode": m[2]})
    logger.info(f"✅ CrimeHeadActSection ({len(mappings)} records)")


def seed_location_tables():
    """Seed District, Court, Unit, Employee tables."""
    logger.info("=== Seeding Location & Unit Tables ===")

    # District
    for d in KARNATAKA_DISTRICTS:
        catalyst_ds.insert_row("District", {"DistrictID": d[0], "DistrictName": d[1], "StateID": 1, "Active": 1})
    logger.info(f"✅ District (31 records)")

    # Court
    for i, c in enumerate(COURTS, 1):
        catalyst_ds.insert_row("Court", {"CourtID": i, "CourtName": c[0], "DistrictID": c[1], "StateID": 1, "Active": 1})
    logger.info(f"✅ Court ({len(COURTS)} records)")

    # Unit (Police Stations)
    for i, ps in enumerate(POLICE_STATIONS, 1):
        catalyst_ds.insert_row("Unit", {"UnitID": i, "UnitName": ps[0], "TypeID": 1, "ParentUnit": None, "NationalityID": 1, "StateID": 1, "DistrictID": ps[1], "Active": 1})
    logger.info(f"✅ Unit ({len(POLICE_STATIONS)} police stations)")

    # Employee (500 officers)
    emp_rows = []
    for i in range(1, 501):
        ps_id = random.randint(1, len(POLICE_STATIONS))
        dist_id = POLICE_STATIONS[ps_id - 1][1]
        emp_rows.append({
            "EmployeeID": i,
            "DistrictID": dist_id,
            "UnitID": ps_id,
            "RankID": random.randint(8, 12),
            "DesignationID": random.randint(1, 5),
            "KGID": f"KG{i:06d}",
            "FirstName": random_name(),
            "EmployeeDOB": str(datetime.date(random.randint(1970, 1995), random.randint(1, 12), random.randint(1, 28))),
            "GenderID": random.choice([1, 1, 1, 2]),
            "BloodGroupID": random.randint(1, 8),
            "PhysicallyChallenged": 0,
            "AppointmentDate": str(datetime.date(random.randint(1995, 2020), random.randint(1, 12), 1)),
        })
    catalyst_ds.insert_rows_batch("Employee", emp_rows)
    logger.info(f"✅ Employee (500 records)")


def seed_case_tables(total_cases: int = 10000):
    """Seed CaseMaster and related tables (10,000+ FIR records)."""
    logger.info(f"=== Seeding {total_cases} FIR Cases (this will take several minutes) ===")

    case_master_rows = []
    accused_rows = []
    victim_rows = []
    complainant_rows = []
    act_section_rows = []
    chargesheet_rows = []
    arrest_rows = []

    accused_counter = 1
    victim_counter = 1
    complainant_counter = 1
    arrest_counter = 1
    chargesheet_counter = 1

    # District-weighted distribution (Bengaluru Urban gets 30% of cases)
    district_weights = [30, 5, 10, 7, 6, 6, 5, 4, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    station_by_district = {}
    for i, ps in enumerate(POLICE_STATIONS, 1):
        d = ps[1]
        if d not in station_by_district:
            station_by_district[d] = []
        station_by_district[d].append(i)

    for case_id in range(1, total_cases + 1):
        # Weighted district selection
        dist = random.choices(range(1, 32), weights=district_weights, k=1)[0]
        stations_in_dist = station_by_district.get(dist, [1])
        ps_id = random.choice(stations_in_dist)

        crime_head_id = random.randint(1, len(CRIME_HEADS))
        crime_sub_heads_for_head = [s for s in CRIME_SUB_HEADS if s[1] == crime_head_id]
        sub_head = random.choice(crime_sub_heads_for_head) if crime_sub_heads_for_head else CRIME_SUB_HEADS[0]

        gravity_id = 1 if crime_head_id in (1, 2, 3, 4, 7, 9) else 2
        cat_id = random.choice([1, 1, 1, 3, 4, 8])  # FIR most common
        registered_date = random_date(2023, 2026)
        incident_date = registered_date - datetime.timedelta(days=random.randint(0, 30))
        emp_id = random.randint(1, 500)
        year = registered_date.year
        crime_no = gen_crime_no(cat_id, dist, ps_id, year, case_id)
        case_no = f"{year}{case_id:05d}"
        accused_name = random_name()
        status_id = random.choices([1, 2, 3, 4, 5, 6], weights=[30, 25, 15, 10, 10, 10])[0]
        court_id = random.randint(1, len(COURTS)) if status_id in (2, 6) else None
        lat_base, lng_base = [(12.9, 77.5), (13.2, 77.7), (12.3, 76.6), (15.3, 75.1), (12.9, 74.8), (15.8, 74.4)][min(dist-1, 5)]

        case_master_rows.append({
            "CaseMasterID": case_id,
            "CrimeNo": crime_no,
            "CaseNo": case_no,
            "CrimeRegisteredDate": str(registered_date),
            "PolicePersonID": emp_id,
            "PoliceStationID": ps_id,
            "CaseCategoryID": cat_id,
            "GravityOffenceID": gravity_id,
            "CrimeMajorHeadID": crime_head_id,
            "CrimeMinorHeadID": sub_head[0],
            "CaseStatusID": status_id,
            "CourtID": court_id,
            "IncidentFromDate": str(datetime.datetime.combine(incident_date, datetime.time(random.randint(0,23), 0))),
            "IncidentToDate": str(datetime.datetime.combine(incident_date, datetime.time(random.randint(0,23), 59))),
            "InfoReceivedPSDate": str(registered_date),
            "latitude": round(lat_base + random.uniform(-0.5, 0.5), 6),
            "longitude": round(lng_base + random.uniform(-0.5, 0.5), 6),
            "BriefFacts": gen_brief_facts(accused_name),
        })

        # Accused (1-3 per case)
        num_accused = random.choices([1, 2, 3], weights=[70, 20, 10])[0]
        for j in range(num_accused):
            acc_name = accused_name if j == 0 else random_name()
            accused_rows.append({
                "AccusedMasterID": accused_counter,
                "CaseMasterID": case_id,
                "AccusedName": acc_name,
                "AgeYear": random.randint(18, 55),
                "GenderID": random.choice(["M", "M", "M", "F"]),
                "PersonID": f"A{accused_counter}",
            })
            accused_counter += 1

            # Arrest record (60% of accused are arrested)
            if random.random() < 0.6:
                arrest_rows.append({
                    "ArrestSurrenderID": arrest_counter,
                    "CaseMasterID": case_id,
                    "ArrestSurrenderTypeID": random.choice([1, 2]),
                    "ArrestSurrenderDate": str(registered_date + datetime.timedelta(days=random.randint(0, 30))),
                    "ArrestSurrenderStateId": 1,
                    "ArrestSurrenderDistrictId": dist,
                    "PoliceStationID": ps_id,
                    "IOID": emp_id,
                    "CourtID": court_id,
                    "AccusedMasterID": accused_counter - 1,
                    "IsAccused": 1,
                    "IsComplainantAccused": 0,
                })
                arrest_counter += 1

        # Victim (0-2 per case)
        num_victims = random.choices([0, 1, 2], weights=[10, 75, 15])[0]
        for _ in range(num_victims):
            victim_rows.append({
                "VictimMasterID": victim_counter,
                "CaseMasterID": case_id,
                "VictimName": random_name(),
                "AgeYear": random.randint(5, 75),
                "GenderID": random.choice(["M", "F", "F"]),
                "VictimPolice": random.choice(["0", "0", "0", "1"]),
            })
            victim_counter += 1

        # Complainant (1 per case)
        complainant_rows.append({
            "ComplainantID": complainant_counter,
            "CaseMasterID": case_id,
            "ComplainantName": random_name(),
            "AgeYear": random.randint(20, 70),
            "OccupationID": random.randint(1, len(OCCUPATIONS)),
            "ReligionID": random.randint(1, len(RELIGIONS)),
            "CasteID": random.randint(1, len(CASTES)),
            "GenderID": random.choice([1, 2]),
        })
        complainant_counter += 1

        # Acts & Sections (1-3 per case)
        applicable_sections = [s for s in IPC_SECTIONS if True]
        chosen_sections = random.sample(applicable_sections, min(random.randint(1, 3), len(applicable_sections)))
        for order, sec in enumerate(chosen_sections, 1):
            act_section_rows.append({
                "CaseMasterID": case_id,
                "ActID": sec[0],
                "SectionID": sec[1],
                "ActOrderID": order,
                "SectionOrderID": order,
            })

        # Chargesheet (40% of cases)
        if status_id in (2, 6) and random.random() < 0.8:
            cs_types = ["A", "A", "B", "C"]
            chargesheet_rows.append({
                "CSID": chargesheet_counter,
                "CaseMasterID": case_id,
                "csdate": str(registered_date + datetime.timedelta(days=random.randint(30, 180))),
                "cstype": random.choice(cs_types),
                "PolicePersonID": emp_id,
            })
            chargesheet_counter += 1

        if case_id % 500 == 0:
            logger.info(f"  Prepared {case_id}/{total_cases} cases...")

    # Batch insert all tables
    logger.info("Inserting CaseMaster rows to Catalyst...")
    catalyst_ds.insert_rows_batch("CaseMaster", case_master_rows)
    logger.info(f"✅ CaseMaster ({len(case_master_rows)} records)")

    logger.info("Inserting Accused rows...")
    catalyst_ds.insert_rows_batch("Accused", accused_rows)
    logger.info(f"✅ Accused ({len(accused_rows)} records)")

    logger.info("Inserting Victim rows...")
    catalyst_ds.insert_rows_batch("Victim", victim_rows)
    logger.info(f"✅ Victim ({len(victim_rows)} records)")

    logger.info("Inserting ComplainantDetails rows...")
    catalyst_ds.insert_rows_batch("ComplainantDetails", complainant_rows)
    logger.info(f"✅ ComplainantDetails ({len(complainant_rows)} records)")

    logger.info("Inserting ActSectionAssociation rows...")
    catalyst_ds.insert_rows_batch("ActSectionAssociation", act_section_rows)
    logger.info(f"✅ ActSectionAssociation ({len(act_section_rows)} records)")

    logger.info("Inserting ChargesheetDetails rows...")
    catalyst_ds.insert_rows_batch("ChargesheetDetails", chargesheet_rows)
    logger.info(f"✅ ChargesheetDetails ({len(chargesheet_rows)} records)")

    logger.info("Inserting ArrestSurrender rows...")
    catalyst_ds.insert_rows_batch("ArrestSurrender", arrest_rows)
    logger.info(f"✅ ArrestSurrender ({len(arrest_rows)} records)")


def verify_tables():
    """Print row counts for all seeded tables."""
    logger.info("=== Verifying Table Row Counts ===")
    for table in KSP_TABLES:
        try:
            rows = catalyst_ds.get_rows(table, max_rows=1)
            # Fetch full count
            all_rows = catalyst_ds.get_rows(table, max_rows=20000)
            logger.info(f"  {table:<30} → {len(all_rows)} rows")
        except Exception as e:
            logger.error(f"  {table:<30} → ERROR: {e}")


# ── Entry Point ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="KaavalAI KSP Catalyst Data Store Seeder")
    parser.add_argument("--table", help="Seed only a specific table")
    parser.add_argument("--verify", action="store_true", help="Only verify row counts")
    parser.add_argument("--cases", type=int, default=10000, help="Number of FIR cases to generate (default: 10000)")
    args = parser.parse_args()

    if not catalyst_ds.is_connected:
        logger.error("❌ Catalyst Data Store not connected. Set CATALYST_ENV=production and ensure credentials are configured.")
        sys.exit(1)

    if args.verify:
        verify_tables()
    elif args.table:
        logger.info(f"Seeding only table: {args.table}")
        if args.table in ("State", "CaseCategory", "GravityOffence", "Rank", "CrimeHead"):
            seed_reference_tables()
        elif args.table in ("District", "Unit", "Court", "Employee"):
            seed_location_tables()
        else:
            seed_case_tables(args.cases)
    else:
        logger.info("🚀 Starting full KaavalAI KSP Catalyst Data Store seeding...")
        logger.info(f"Target: {args.cases} FIR cases + all reference tables")
        seed_reference_tables()
        seed_location_tables()
        seed_case_tables(args.cases)
        logger.info("🎉 Seeding complete! Running verification...")
        verify_tables()
