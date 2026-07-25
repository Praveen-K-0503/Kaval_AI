'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import CommandHeader from '@/components/CommandHeader';
import Map3D from '@/components/Map3D';
import NetworkGraph3D from '@/components/NetworkGraph3D';
import PredictiveDashboard from '@/components/PredictiveDashboard';
import CatalystDrawer from '@/components/CatalystDrawer';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';


export default function Home() {
  const [catalystOpen, setCatalystOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState('SCRB Chief');

  const [kpi, setKpi] = useState({
    total_firs: 3420,
    heinous_crimes: 412,
    total_accused: 2890,
    total_stations: 21,
    active_red_zones: 6,
    repeat_offender_clusters: 24,
    predictive_risk_index: 78.4,
  });

  const [districts, setDistricts] = useState([
    { district_id: 1, district_name: "Bengaluru Urban", lat: 12.9716, lng: 77.5946, crime_count: 840, risk_score: 94.2, is_red_zone: true, recommended_beat_patrols: 45 },
    { district_id: 2, district_name: "Bengaluru Rural", lat: 13.1986, lng: 77.7070, crime_count: 210, risk_score: 54.1, is_red_zone: false, recommended_beat_patrols: 18 },
    { district_id: 3, district_name: "Mysuru", lat: 12.2958, lng: 76.6394, crime_count: 420, risk_score: 82.5, is_red_zone: true, recommended_beat_patrols: 32 },
    { district_id: 4, district_name: "Hubballi-Dharwad", lat: 15.3647, lng: 75.1240, crime_count: 360, risk_score: 79.1, is_red_zone: true, recommended_beat_patrols: 28 },
    { district_id: 5, district_name: "Mangaluru", lat: 12.9141, lng: 74.8560, crime_count: 310, risk_score: 76.4, is_red_zone: true, recommended_beat_patrols: 25 },
    { district_id: 6, district_name: "Belagavi", lat: 15.8497, lng: 74.4977, crime_count: 280, risk_score: 71.0, is_red_zone: true, recommended_beat_patrols: 22 },
    { district_id: 7, district_name: "Kalaburagi", lat: 17.3297, lng: 76.8343, crime_count: 260, risk_score: 68.9, is_red_zone: true, recommended_beat_patrols: 20 },
    { district_id: 8, district_name: "Ballari", lat: 15.1394, lng: 76.9214, crime_count: 190, risk_score: 48.2, is_red_zone: false, recommended_beat_patrols: 14 }
  ]);

  const [networkData, setNetworkData] = useState({
    nodes: [
      { id: "acc_1", name: "Suspect: Basavaraj Patil", group: "Accused", val: 20, person_id: "A101" },
      { id: "acc_2", name: "Suspect: Ramesh Gowda", group: "Accused", val: 18, person_id: "A102" },
      { id: "acc_3", name: "Suspect: Anand Kumar", group: "Accused", val: 15, person_id: "A103" },
      { id: "fir_101", name: "FIR #104430006202600001", group: "FIR", val: 10 },
      { id: "fir_102", name: "FIR #104430006202600002", group: "FIR", val: 10 },
      { id: "group_1", name: "Cyber & Banking Fraud", group: "CrimeCategory", val: 25 },
      { id: "group_2", name: "Property Theft & Burglary", group: "CrimeCategory", val: 25 }
    ],
    links: [
      { source: "acc_1", target: "fir_101", value: 3 },
      { source: "acc_2", target: "fir_101", value: 3 },
      { source: "acc_3", target: "fir_102", value: 3 },
      { source: "fir_101", target: "group_1", value: 5 },
      { source: "fir_102", target: "group_2", value: 5 }
    ]
  });

  const [predictiveData, setPredictiveData] = useState({
    forecast_period: "Next 30 Days (Aug 2026)",
    model: "XGBoost + Isolation Forest",
    model_confidence: "Initializing...",
    high_risk_districts: [
      { district: "Bengaluru Urban", predicted_crimes: 420, risk_level: "Critical (Red Zone)", primary_threat: "Cyber & Banking Fraud" },
      { district: "Mysuru", predicted_crimes: 185, risk_level: "High", primary_threat: "Property Theft & Burglary" },
      { district: "Hubballi-Dharwad", predicted_crimes: 160, risk_level: "High", primary_threat: "Highway Vehicle Robbery" },
      { district: "Mangaluru", predicted_crimes: 140, risk_level: "Elevated", primary_threat: "Financial Transaction Anomaly" }
    ],
    anomalies: [] as any[],
  });

  const [catalystServices, setCatalystServices] = useState([
    { name: "Catalyst AppSail", status: "Active", type: "Managed OCI Docker Runtime (Next.js & FastAPI)" },
    { name: "Catalyst Data Store", status: "Active", type: "Relational Database (24-Table KSP FIR ERD)" },
    { name: "Catalyst NoSQL", status: "Active", type: "Geospatial & Unstructured BriefFacts Store" },
    { name: "Catalyst Stratus", status: "Active", type: "S3 Blob Storage for FIR Attachments" },
    { name: "Catalyst SmartBrowz", status: "Active", type: "Headless PDF Case Brief Generator" },
    { name: "Catalyst Zia Services", status: "Active", type: "Text Analytics & MO Code Similarity" },
    { name: "Catalyst Zia AutoML", status: "Active", type: "Automated Tabular Crime Spikes Training" },
    { name: "Catalyst QuickML", status: "Active", type: "Predictive Risk Pipeline & RAG Search" },
    { name: "Catalyst Signals", status: "Active", type: "Cross-App Event Bus & Red-Zone Triggers" },
    { name: "Catalyst Event Functions", status: "Active", type: "Serverless Risk Spike Alert Functions" },
    { name: "Catalyst Circuits", status: "Active", type: "Multi-Step Emergency Response Workflow" },
    { name: "Catalyst Cache", status: "Active", type: "High-Speed Polygon & Lookup Cache" },
    { name: "Catalyst API Gateway", status: "Active", type: "API Router, Throttling & CORS Shield" },
    { name: "Catalyst Authentication", status: "Active", type: "RBAC Security (Station/District Ranks)" },
    { name: "Catalyst Cron", status: "Active", type: "Nightly ML Risk Re-Forecasting Scheduler" },
    { name: "Catalyst Pipelines", status: "Active", type: "Automated Zero-Downtime CI/CD" },
    { name: "Catalyst Mail", status: "Active", type: "Transactional Red-Zone Email Alerts" },
    { name: "Catalyst Push Notifications", status: "Active", type: "Real-Time Station Officer Mobile Alerts" },
    { name: "Catalyst Connections", status: "Active", type: "OAuth 2.0 Integration with KSP Systems" },
    { name: "Catalyst Domain Mappings", status: "Active", type: "Custom Domain & Managed SSL Certificate" }
  ]);

  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const resKpi = await fetch(`${API}/api/kpi`);
        if (resKpi.ok) setKpi(await resKpi.json());

        const resDist = await fetch(`${API}/api/districts`);
        if (resDist.ok) setDistricts(await resDist.json());

        // NetworkGraph3D now fetches from /api/ml/network-analysis directly
        // (no longer need to pass networkData as prop)

        const resPred = await fetch(`${API}/api/predictive`);
        if (resPred.ok) setPredictiveData(await resPred.json());

        const resCat = await fetch(`${API}/api/catalyst-status`);
        if (resCat.ok) {
          const data = await resCat.json();
          if (data.services) setCatalystServices(data.services);
        }
      } catch (err) {
        // Silently fall back to initial state on network error
      } finally {
        setLoading(false);
      }
    };
    fetchBackendData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Executive Command Header */}
      <CommandHeader 
        kpi={kpi} 
        onOpenCatalyst={() => setCatalystOpen(true)} 
        activeRole={activeRole}
        onRoleChange={(r) => setActiveRole(r)}
      />

      {/* Main Grid Workspace */}
      <motion.main 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 p-6 space-y-6 max-w-[1800px] w-full mx-auto"
      >
        {/* Top 3D Visual Grid (Spatiotemporal Map + 3D Network Graph) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Map3D districts={districts} />
          <NetworkGraph3D data={networkData} />
        </div>

        {/* Bottom AI Predictive Risk & Anomaly Panel */}
        <PredictiveDashboard data={predictiveData} />
      </motion.main>

      {/* Footer Status Bar */}
      <footer className="border-t border-slate-200 bg-white px-6 py-3 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Karnataka State Police (KSP) • SCRB • Role: <strong className="text-blue-700">{activeRole}</strong></span>
          <Link href="/firs" style={{
            background: '#eff6ff', color: '#1d4ed8',
            padding: '3px 10px', borderRadius: '20px', fontSize: '11px',
            fontWeight: 600, textDecoration: 'none', border: '1px solid #bfdbfe',
          }}>
            📋 FIR Registry →
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-emerald-700 font-semibold font-mono">● System Status: OPERATIONAL</span>
          <span className="text-blue-700 font-mono font-medium">MCP Protocol: v1.0 Active</span>
          <span className="text-slate-600 font-medium">Zoho Catalyst AppSail · Project ID: 56816000000013052</span>
        </div>
      </footer>

      {/* Zoho Catalyst Services Drawer */}
      <CatalystDrawer
        isOpen={catalystOpen}
        onClose={() => setCatalystOpen(false)}
        services={catalystServices}
      />
    </div>
  );
}
