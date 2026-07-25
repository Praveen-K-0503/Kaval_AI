"""
Karnataka State Police (KSP) Catalyst SDK Engine & Service Handlers
Encapsulates native Zoho Catalyst Services: SmartBrowz, Zia NLP, QuickML, Signals, Cache, Mail, and AppSail.
"""

import os
import json
import base64
import datetime
from typing import Dict, List, Any
from database_adapter import db_adapter

class CatalystServiceEngine:
    def __init__(self):
        self.app_sail_status = "Healthy (Container Runtime)"
        self.cache_store: Dict[str, Any] = {}

    def generate_smartbrowz_pdf_brief(self, case_master_id: int) -> Dict[str, Any]:
        """
        Simulates Catalyst SmartBrowz headless browser report generation.
        Returns base64 encoded PDF payload and metadata.
        """
        case = db_adapter.get_fir_details(case_master_id)
        if not case:
            return {"error": "FIR Record not found"}

        html_content = f"""
        ================================================================================
        KARNATAKA STATE POLICE — STATE CRIME RECORDS BUREAU (SCRB)
        OFFICIAL FIR CASE BRIEF & INVESTIGATIVE RECORD
        ================================================================================
        Crime Number      : {case.get('CrimeNo')}
        Case Number       : {case.get('CaseNo')}
        District          : {case.get('DistrictName')}
        Police Station    : {case.get('PoliceStation')}
        Crime Major Head  : {case.get('MajorHead')}
        Crime Minor Head  : {case.get('MinorHead')}
        Gravity           : {case.get('Gravity')}
        Registered Date   : {case.get('CrimeRegisteredDate')}
        Registering Officer: {case.get('RegisteringOfficer')} ({case.get('OfficerRank')})
        Location GPS      : Lat {case.get('latitude')}, Lng {case.get('longitude')}
        --------------------------------------------------------------------------------
        BRIEF FACTS OF THE CASE:
        {case.get('BriefFacts')}
        --------------------------------------------------------------------------------
        ACCUSED LIST ({len(case.get('accused_list', []))} Persons):
        """
        for acc in case.get('accused_list', []):
            html_content += f"  * ID: {acc.get('PersonID')} | Name: {acc.get('AccusedName')} | Age: {acc.get('AgeYear')}\n"

        html_content += "\nAPPLICABLE ACTS & SECTIONS:\n"
        for act in case.get('acts_sections', []):
            html_content += f"  * {act.get('ShortName')} Section {act.get('SectionCode')} - {act.get('SectionDescription')}\n"

        html_content += """
        ================================================================================
        GENERATED VIA ZOHO CATALYST SMARTBROWZ REPORT ENGINE
        CONFIDENTIAL — POLICE USE ONLY
        ================================================================================
        """
        b64_pdf = base64.b64encode(html_content.encode('utf-8')).decode('utf-8')
        
        return {
            "status": "success",
            "service": "Catalyst SmartBrowz",
            "crime_no": case.get('CrimeNo'),
            "case_master_id": case_master_id,
            "pdf_filename": f"KSP_FIR_{case.get('CrimeNo')}_Brief.pdf",
            "pdf_base64": b64_pdf,
            "generated_at": datetime.datetime.now().isoformat()
        }

    def zia_mo_similarity_match(self, query_text: str) -> List[Dict[str, Any]]:
        """
        Simulates Catalyst Zia Analytics / Zia NLP Modus Operandi (MO) text similarity matching over BriefFacts.
        """
        firs = db_adapter.search_firs(limit=100)
        query_words = set(query_text.lower().split())
        
        results = []
        for fir in firs:
            facts = (fir.get('BriefFacts') or "").lower()
            crime_head = (fir.get('CrimeHead') or "").lower()
            
            # Simple TF-IDF / Word Overlap Score Simulation
            facts_words = set(facts.split()).union(set(crime_head.split()))
            intersection = query_words.intersection(facts_words)
            if intersection or not query_text:
                score = round((len(intersection) / max(len(query_words), 1)) * 85.0 + (len(facts) % 15), 1)
                score = min(99.4, max(55.0, score))
                
                results.append({
                    "case_master_id": fir.get('CaseMasterID'),
                    "crime_no": fir.get('CrimeNo'),
                    "district": fir.get('DistrictName'),
                    "police_station": fir.get('PoliceStation'),
                    "crime_head": fir.get('CrimeHead'),
                    "brief_facts": fir.get('BriefFacts'),
                    "similarity_score": score,
                    "matched_mo_tokens": list(intersection) if intersection else ["general_pattern"]
                })

        results.sort(key=lambda x: x['similarity_score'], reverse=True)
        return results[:8]

    def trigger_red_zone_signal_and_mail(self, district_name: str, heinous_count: int) -> Dict[str, Any]:
        """
        Simulates Catalyst Signals + Event Functions + Catalyst Mail dispatch on Emergency Red Zone crime spike.
        """
        event_payload = {
            "event_id": f"SIG-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}",
            "event_type": "RED_ZONE_CRIME_SPIKE",
            "district": district_name,
            "heinous_crimes_count": heinous_count,
            "catalyst_services_dispatched": ["Catalyst Signals", "Catalyst Event Functions", "Catalyst Mail", "Catalyst Push Notifications"],
            "timestamp": datetime.datetime.now().isoformat(),
            "notification_status": "Dispatched to Station House Officers & District SP"
        }
        return event_payload

catalyst_engine = CatalystServiceEngine()
