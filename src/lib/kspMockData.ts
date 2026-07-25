/**
 * KaavalAI KSP — Master Intelligence & Mock Data Engine
 * Karnataka State Police SCRB Intelligence Platform
 * Covers 31 Districts, Gang Syndicates, Beat Patrol Routes, FIR Dossiers, and ML Predictions.
 */

export interface DistrictData {
  id: number;
  name: string;
  code: string;
  zone: string;
  lat: number;
  lng: number;
  riskScore: number;
  riskCategory: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  totalFirs: number;
  heinousCount: number;
  activeHotspots: number;
  policeStationsCount: number;
  topOffence: string;
}

export interface CriminalNode {
  id: string;
  name: string;
  alias: string;
  role: 'GANG_LEADER' | 'LIEUTENANT' | 'OPERATIVE' | 'ASSOCIATE';
  syndicate: string;
  district: string;
  riskScore: number;
  activeCases: number;
  status: 'WANTED' | 'UNDER_SURVEILLANCE' | 'IN_CUSTODY' | 'BAIL';
  mo: string;
  connections: string[];
}

export interface FIRRecord {
  id: string;
  firNumber: string;
  year: number;
  district: string;
  policeStation: string;
  ipcSections: string[];
  bnsSections: string[];
  gravity: 'HEINOUS' | 'MAJOR' | 'MINOR';
  crimeCategory: string;
  incidentDate: string;
  registeredDate: string;
  status: 'UNDER_INVESTIGATION' | 'CHARGE_SHEETED' | 'UNTRACED' | 'CLOSED';
  accusedNames: string[];
  victimName: string;
  lat: number;
  lng: number;
  moDescription: string;
  riskIndex: number;
  synopsis: string;
}

export interface BeatCheckpoint {
  id: string;
  order: number;
  name: string;
  location: string;
  lat: number;
  lng: number;
  riskRating: 'HIGH' | 'MEDIUM' | 'MODERATE';
  crimeType: string;
  recommendedTime: string;
  patrolInstructions: string;
}

// ── 31 KARNATAKA DISTRICTS MASTER LIST ───────────────────────────────────────
export const KSP_DISTRICTS: DistrictData[] = [
  { id: 1, name: "Bengaluru City", code: "BLR_CITY", zone: "Bengaluru Urban", lat: 12.9716, lng: 77.5946, riskScore: 88, riskCategory: "CRITICAL", totalFirs: 8420, heinousCount: 312, activeHotspots: 14, policeStationsCount: 108, topOffence: "Cyber Fraud & Heinous Robbery" },
  { id: 2, name: "Bengaluru Rural", code: "BLR_RURAL", zone: "Central Range", lat: 13.1986, lng: 77.7070, riskScore: 62, riskCategory: "MEDIUM", totalFirs: 2150, heinousCount: 84, activeHotspots: 5, policeStationsCount: 18, topOffence: "Land Disputes & Highway Robbery" },
  { id: 3, name: "Mysuru City", code: "MYS_CITY", zone: "Southern Range", lat: 12.2958, lng: 76.6394, riskScore: 74, riskCategory: "HIGH", totalFirs: 3890, heinousCount: 142, activeHotspots: 8, policeStationsCount: 26, topOffence: "Property Theft & Burglary" },
  { id: 4, name: "Hubballi-Dharwad City", code: "HBL_DHW", zone: "Northern Range", lat: 15.3647, lng: 75.1240, riskScore: 79, riskCategory: "HIGH", totalFirs: 4120, heinousCount: 168, activeHotspots: 9, policeStationsCount: 31, topOffence: "Grievous Hurt & Organized Gambling" },
  { id: 5, name: "Mangaluru City (DK)", code: "MNG_CITY", zone: "Western Range", lat: 12.9141, lng: 74.8560, riskScore: 82, riskCategory: "CRITICAL", totalFirs: 3640, heinousCount: 195, activeHotspots: 11, policeStationsCount: 22, topOffence: "Communal Rioting & Contraband Smuggling" },
  { id: 6, name: "Belagavi District", code: "BGM_DIST", zone: "Northern Range", lat: 15.8497, lng: 74.4977, riskScore: 71, riskCategory: "HIGH", totalFirs: 3410, heinousCount: 128, activeHotspots: 7, policeStationsCount: 38, topOffence: "Border Extortion & Cattle Theft" },
  { id: 7, name: "Kalaburagi", code: "KLB_DIST", zone: "North Eastern Range", lat: 17.3297, lng: 76.8343, riskScore: 85, riskCategory: "CRITICAL", totalFirs: 4980, heinousCount: 240, activeHotspots: 12, policeStationsCount: 34, topOffence: "Armed Dacoity & Land Mafia" },
  { id: 8, name: "Ballari", code: "BLR_DIST", zone: "Eastern Range", lat: 15.1394, lng: 76.9214, riskScore: 76, riskCategory: "HIGH", totalFirs: 2890, heinousCount: 115, activeHotspots: 6, policeStationsCount: 24, topOffence: "Illegal Mining & Extortion" },
  { id: 9, name: "Davanagere", code: "DVG_DIST", zone: "Eastern Range", lat: 14.4644, lng: 75.9218, riskScore: 58, riskCategory: "MEDIUM", totalFirs: 1940, heinousCount: 62, activeHotspots: 4, policeStationsCount: 19, topOffence: "Vehicle Theft" },
  { id: 10, name: "Shivamogga", code: "SMG_DIST", zone: "Eastern Range", lat: 13.9299, lng: 75.5681, riskScore: 68, riskCategory: "MEDIUM", totalFirs: 2310, heinousCount: 89, activeHotspots: 5, policeStationsCount: 25, topOffence: "Forest Timber Smuggling" },
  { id: 11, name: "Tumakuru", code: "TMK_DIST", zone: "Central Range", lat: 13.3379, lng: 77.1173, riskScore: 64, riskCategory: "MEDIUM", totalFirs: 2680, heinousCount: 94, activeHotspots: 6, policeStationsCount: 29, topOffence: "Highway Dacoity" },
  { id: 12, name: "Vijayapura", code: "VJP_DIST", zone: "Northern Range", lat: 16.8302, lng: 75.7100, riskScore: 77, riskCategory: "HIGH", totalFirs: 3120, heinousCount: 138, activeHotspots: 8, policeStationsCount: 27, topOffence: "Illegal Firearms & Faction Feuds" },
  { id: 13, name: "Bidar", code: "BDR_DIST", zone: "North Eastern Range", lat: 17.9104, lng: 77.5199, riskScore: 73, riskCategory: "HIGH", totalFirs: 2450, heinousCount: 102, activeHotspots: 6, policeStationsCount: 20, topOffence: "Inter-State Border Smuggling" },
  { id: 14, name: "Raichur", code: "RCR_DIST", zone: "North Eastern Range", lat: 16.2076, lng: 77.3563, riskScore: 69, riskCategory: "MEDIUM", totalFirs: 2210, heinousCount: 88, activeHotspots: 5, policeStationsCount: 21, topOffence: "Agricultural Land Forgery" },
  { id: 15, name: "Hassana", code: "HSN_DIST", zone: "Southern Range", lat: 13.0033, lng: 76.1004, riskScore: 52, riskCategory: "LOW", totalFirs: 1780, heinousCount: 45, activeHotspots: 3, policeStationsCount: 22, topOffence: "Domestic Disputes & Property Theft" },
  { id: 16, name: "Udupi", code: "UDP_DIST", zone: "Western Range", lat: 13.3409, lng: 74.7421, riskScore: 49, riskCategory: "LOW", totalFirs: 1420, heinousCount: 38, activeHotspots: 2, policeStationsCount: 16, topOffence: "Cyber Phishing & Maritime Smuggling" },
  { id: 17, name: "Chikkamagaluru", code: "CKM_DIST", zone: "Western Range", lat: 13.3161, lng: 75.7720, riskScore: 45, riskCategory: "LOW", totalFirs: 1290, heinousCount: 31, activeHotspots: 2, policeStationsCount: 18, topOffence: "Illegal Coffee Estate Encroachment" },
  { id: 18, name: "Kodagu", code: "KDG_DIST", zone: "Southern Range", lat: 12.4244, lng: 75.7382, riskScore: 38, riskCategory: "LOW", totalFirs: 980, heinousCount: 22, activeHotspots: 1, policeStationsCount: 12, topOffence: "Home-stay Fraud & Timber Theft" },
  { id: 19, name: "Mandya", code: "MND_DIST", zone: "Southern Range", lat: 12.5218, lng: 76.8951, riskScore: 56, riskCategory: "MEDIUM", totalFirs: 1890, heinousCount: 54, activeHotspots: 4, policeStationsCount: 21, topOffence: "Riverbed Sand Mining" },
  { id: 20, name: "Ramanagara", code: "RMG_DIST", zone: "Central Range", lat: 12.7159, lng: 77.2812, riskScore: 67, riskCategory: "MEDIUM", totalFirs: 2040, heinousCount: 76, activeHotspots: 5, policeStationsCount: 17, topOffence: "Highway Robbery & Real Estate Extortion" },
  { id: 21, name: "Chitradurga", code: "CTA_DIST", zone: "Eastern Range", lat: 14.2251, lng: 76.3980, riskScore: 61, riskCategory: "MEDIUM", totalFirs: 1980, heinousCount: 68, activeHotspots: 4, policeStationsCount: 20, topOffence: "Windmill Cable Theft & Dacoity" },
  { id: 22, name: "Kolar", code: "KLR_DIST", zone: "Central Range", lat: 13.1367, lng: 78.1292, riskScore: 70, riskCategory: "HIGH", totalFirs: 2510, heinousCount: 98, activeHotspots: 6, policeStationsCount: 23, topOffence: "Gold Field Smuggling & Dacoity" },
  { id: 23, name: "Chikkaballapura", code: "CBP_DIST", zone: "Central Range", lat: 13.4355, lng: 77.7275, riskScore: 63, riskCategory: "MEDIUM", totalFirs: 1870, heinousCount: 65, activeHotspots: 4, policeStationsCount: 16, topOffence: "Quarry Explosives Fraud" },
  { id: 24, name: "Bagalkote", code: "BGK_DIST", zone: "Northern Range", lat: 16.1852, lng: 75.6961, riskScore: 66, riskCategory: "MEDIUM", totalFirs: 2110, heinousCount: 72, activeHotspots: 5, policeStationsCount: 22, topOffence: "Cattle Smuggling & Faction Clash" },
  { id: 25, name: "Gadag", code: "GDG_DIST", zone: "Northern Range", lat: 15.4310, lng: 75.6322, riskScore: 51, riskCategory: "LOW", totalFirs: 1350, heinousCount: 39, activeHotspots: 3, policeStationsCount: 15, topOffence: "Textile Mill Robbery" },
  { id: 26, name: "Koppala", code: "KPL_DIST", zone: "Eastern Range", lat: 15.3484, lng: 76.1558, riskScore: 55, riskCategory: "MEDIUM", totalFirs: 1560, heinousCount: 48, activeHotspots: 3, policeStationsCount: 17, topOffence: "Ancient Relic Theft" },
  { id: 27, name: "Haveri", code: "HVR_DIST", zone: "Northern Range", lat: 14.7946, lng: 75.3995, riskScore: 53, riskCategory: "LOW", totalFirs: 1480, heinousCount: 42, activeHotspots: 3, policeStationsCount: 19, topOffence: "Chilli Market Extortion" },
  { id: 28, name: "Uttara Kannada", code: "UKD_DIST", zone: "Western Range", lat: 14.8085, lng: 74.1240, riskScore: 48, riskCategory: "LOW", totalFirs: 1390, heinousCount: 36, activeHotspots: 2, policeStationsCount: 24, topOffence: "Port Smuggling & Illegal Poaching" },
  { id: 29, name: "Yadgiri", code: "YDG_DIST", zone: "North Eastern Range", lat: 16.7645, lng: 77.1378, riskScore: 72, riskCategory: "HIGH", totalFirs: 2290, heinousCount: 91, activeHotspots: 5, policeStationsCount: 16, topOffence: "Feudal Land Violence" },
  { id: 30, name: "Vijayanagara", code: "VJN_DIST", zone: "Eastern Range", lat: 15.2689, lng: 76.3909, riskScore: 65, riskCategory: "MEDIUM", totalFirs: 1920, heinousCount: 67, activeHotspots: 4, policeStationsCount: 18, topOffence: "Heritage Site Vandalism & Theft" },
  { id: 31, name: "Chamarajanagara", code: "CMR_DIST", zone: "Southern Range", lat: 11.9261, lng: 76.9437, riskScore: 59, riskCategory: "MEDIUM", totalFirs: 1640, heinousCount: 52, activeHotspots: 4, policeStationsCount: 17, topOffence: "Forest Border Poaching & Sand Mining" }
];

// ── CRIMINAL SYNDICATE NETWORK NODES ─────────────────────────────────────────
export const CRIMINAL_SYNDICATE_NODES: CriminalNode[] = [
  { id: "CRIM_001", name: "Sharath 'Kingpin' Gowda", alias: "Bulls Eye Sharath", role: "GANG_LEADER", syndicate: "D-Gang South Syndicate", district: "Bengaluru City", riskScore: 96, activeCases: 14, status: "WANTED", mo: "Extortion via Encrypted VoIP, Contract Hits", connections: ["CRIM_002", "CRIM_003", "CRIM_006"] },
  { id: "CRIM_002", name: "Vicky 'Panther' Shetty", alias: "Panther Vicky", role: "LIEUTENANT", syndicate: "D-Gang South Syndicate", district: "Mangaluru City (DK)", riskScore: 89, activeCases: 9, status: "UNDER_SURVEILLANCE", mo: "Coastal Contraband Smuggling & Hawala Transfer", connections: ["CRIM_001", "CRIM_004"] },
  { id: "CRIM_003", name: "Anand 'Techno' Kulkarni", alias: "DarkWeb Anand", role: "LIEUTENANT", syndicate: "Cyber Fraud Syndicate", district: "Bengaluru City", riskScore: 92, activeCases: 11, status: "BAIL", mo: "Mule Bank Accounts & APK Ransomware Injection", connections: ["CRIM_001", "CRIM_005"] },
  { id: "CRIM_004", name: "Basavaraj 'Don' Reddy", alias: "Sand Don Basava", role: "GANG_LEADER", syndicate: "Kaveri Sand Mafia", district: "Kalaburagi", riskScore: 94, activeCases: 18, status: "WANTED", mo: "Armed Escort Sand Mining & Toll Booth Shootouts", connections: ["CRIM_002", "CRIM_007", "CRIM_008"] },
  { id: "CRIM_005", name: "Kiran 'Crypto' Kumar", alias: "Mule master Kirana", role: "OPERATIVE", syndicate: "Cyber Fraud Syndicate", district: "Hubballi-Dharwad City", riskScore: 84, activeCases: 6, status: "UNDER_SURVEILLANCE", mo: "SIM Swap Fraud & Crypto Tumblers", connections: ["CRIM_003"] },
  { id: "CRIM_006", name: "Syed 'Blade' Imran", alias: "Blade Imran", role: "OPERATIVE", syndicate: "D-Gang South Syndicate", district: "Mysuru City", riskScore: 87, activeCases: 8, status: "IN_CUSTODY", mo: "Robbery at Knife Point & Vehicle Carjacking", connections: ["CRIM_001", "CRIM_007"] },
  { id: "CRIM_007", name: "Mallikarjun 'Gun' Patil", alias: "Kattar Mallesh", role: "LIEUTENANT", syndicate: "Kaveri Sand Mafia", district: "Vijayapura", riskScore: 91, activeCases: 12, status: "WANTED", mo: "Desi Kattas Distribution & Land Grab Threat", connections: ["CRIM_004", "CRIM_006"] },
  { id: "CRIM_008", name: "Ramesh 'Chota' Nayak", alias: "Chota Ramesh", role: "ASSOCIATE", syndicate: "Kaveri Sand Mafia", district: "Ballari", riskScore: 78, activeCases: 4, status: "BAIL", mo: "Informant & Stolen Truck Transport", connections: ["CRIM_004"] }
];

// ── REALISTIC FIR RECORDS MASTER LIST ───────────────────────────────────────
export const RECENT_FIRS: FIRRecord[] = [
  {
    id: "FIR_2026_0984",
    firNumber: "FIR/00984/2026",
    year: 2026,
    district: "Bengaluru City",
    policeStation: "Subhedar Chatra PS",
    ipcSections: ["IPC 395 (Dacoity)", "IPC 307 (Attempt to Murder)", "IPC 120B (Criminal Conspiracy)"],
    bnsSections: ["BNS 310 (Robbery with Intent)", "BNS 111 (Organized Crime)"],
    gravity: "HEINOUS",
    crimeCategory: "Armed Robbery & Gang Violent Extortion",
    incidentDate: "2026-07-21T02:15:00",
    registeredDate: "2026-07-21T04:30:00",
    status: "UNDER_INVESTIGATION",
    accusedNames: ["Sharath 'Kingpin' Gowda", "Syed 'Blade' Imran"],
    victimName: "Apex Digital Financial Services Pvt Ltd",
    lat: 12.9780,
    lng: 77.5900,
    moDescription: "Accused masked in black hoodies disabled CCTV cameras using high-power laser devices, used cutter tools on vault door, and fired warning shots in the air before escaping in an unnumbered black SUV.",
    riskIndex: 94,
    synopsis: "High-value commercial robbery involving active criminal syndicate members. Special Task Force (STF) assigned."
  },
  {
    id: "FIR_2026_0985",
    firNumber: "FIR/00985/2026",
    year: 2026,
    district: "Kalaburagi",
    policeStation: "Brahmapur PS",
    ipcSections: ["IPC 302 (Murder)", "IPC 384 (Extortion)", "Arms Act 25"],
    bnsSections: ["BNS 103 (Murder)", "BNS 308 (Extortion)"],
    gravity: "HEINOUS",
    crimeCategory: "Homicide & Syndicate Feud",
    incidentDate: "2026-07-22T21:40:00",
    registeredDate: "2026-07-22T23:00:00",
    status: "CHARGE_SHEETED",
    accusedNames: ["Basavaraj 'Don' Reddy", "Mallikarjun 'Gun' Patil"],
    victimName: "Sharanappa (Mining Contractor)",
    lat: 17.3310,
    lng: 76.8390,
    moDescription: "Target ambushed near river bridge while travelling in SUV. Country-made pistol (Desi Katta) utilized at point-blank range following non-payment of protection money.",
    riskIndex: 96,
    synopsis: "Fatal gang shoot-out over river sand mining lease rights. Chargesheet filed under BNS 111 against syndicate leadership."
  },
  {
    id: "FIR_2026_0986",
    firNumber: "FIR/00986/2026",
    year: 2026,
    district: "Mangaluru City (DK)",
    policeStation: "Pandeshwar PS",
    ipcSections: ["IPC 420 (Cheating)", "IT Act Section 66D"],
    bnsSections: ["BNS 318 (Cheating by Impersonation)"],
    gravity: "MAJOR",
    crimeCategory: "Cyber Banking Fraud & SIM Swap",
    incidentDate: "2026-07-23T11:20:00",
    registeredDate: "2026-07-23T14:15:00",
    status: "UNDER_INVESTIGATION",
    accusedNames: ["Anand 'Techno' Kulkarni", "Kiran 'Crypto' Kumar"],
    victimName: "Dr. K. Srinivas Rao",
    lat: 12.8650,
    lng: 74.8420,
    moDescription: "Victim received fraudulent APK installation link via WhatsApp posing as KSEB electricity bill update. Rs 42 Lakhs siphoned across 18 mule bank accounts within 45 minutes.",
    riskIndex: 88,
    synopsis: "Sophisticated mobile phishing attack linked to interstate cyber fraud network operating out of mule accounts."
  },
  {
    id: "FIR_2026_0987",
    firNumber: "FIR/00987/2026",
    year: 2026,
    district: "Mysuru City",
    policeStation: "Lashkar PS",
    ipcSections: ["IPC 379 (Theft)", "IPC 457 (Lurking House Trespass)"],
    bnsSections: ["BNS 303 (Theft)", "BNS 331 (House Trespass)"],
    gravity: "MAJOR",
    crimeCategory: "Night Burglary & Jewelry Heist",
    incidentDate: "2026-07-24T03:00:00",
    registeredDate: "2026-07-24T07:30:00",
    status: "UNDER_INVESTIGATION",
    accusedNames: ["Syed 'Blade' Imran"],
    victimName: "Sowmya Gold Jewelers",
    lat: 12.3010,
    lng: 76.6520,
    moDescription: "Bypassed rear shutter locks using hydraulic jack tool. Targeted 2.4 kg gold ornaments and cash. Left fingerprint traces on glass display counter.",
    riskIndex: 76,
    synopsis: "Precision night burglary with specific tool marks matching past habitual offender Modus Operandi."
  }
];

// ── BEAT PATROL CHECKPOINTS FOR SUBHEDAR CHATRA PS ─────────────────────────
export const BEAT_CHECKPOINTS: BeatCheckpoint[] = [
  { id: "CP_01", order: 1, name: "Subhedar Chatra Railway Station Gate #2", location: "Majestic South Entrance", lat: 12.9772, lng: 77.5712, riskRating: "HIGH", crimeType: "Pickpocketing & Snatching", recommendedTime: "01:30 - 03:00 AM", patrolInstructions: "Inspect night passengers, verify auto-rickshaw driver IDs, search suspicious baggage." },
  { id: "CP_02", order: 2, name: "Ananda Rao Circle Flyover Underpass", location: "Race Course Rd Junction", lat: 12.9810, lng: 77.5790, riskRating: "HIGH", crimeType: "Grievous Hurt & Drug Peddling", recommendedTime: "03:15 - 04:30 AM", patrolInstructions: "Patrol poorly lit underpass area. Check parked commercial trucks for illicit contraband." },
  { id: "CP_03", order: 3, name: "Gandhi Nagar Commercial Vault Zone", location: "3rd Main Rd Banking Hub", lat: 12.9795, lng: 77.5840, riskRating: "MEDIUM", crimeType: "Night Burglary & Vault Theft", recommendedTime: "04:45 - 05:30 AM", patrolInstructions: "Conduct physical check on rear security shutters of gold jewelers and ATM outer kiosks." },
  { id: "CP_04", order: 4, name: "Freedom Park Outer Perimeter", location: "Sheshadri Road Junction", lat: 12.9835, lng: 77.5815, riskRating: "MODERATE", crimeType: "Vehicle Theft & Vandalism", recommendedTime: "05:45 - 06:30 AM", patrolInstructions: "Verify registration numbers of two-wheelers parked overnight." }
];
