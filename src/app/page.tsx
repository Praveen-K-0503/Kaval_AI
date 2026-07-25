'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Network, 
  MapPin, 
  FileText, 
  BarChart3, 
  ShieldAlert, 
  Radio, 
  Sparkles,
  ChevronRight,
  Database,
  Layers,
  Activity
} from 'lucide-react';
import CommandHeader from '@/components/CommandHeader';
import Map3D from '@/components/Map3D';
import NetworkGraph3D from '@/components/NetworkGraph3D';
import PredictiveDashboard from '@/components/PredictiveDashboard';
import CatalystDrawer from '@/components/CatalystDrawer';
import { KSP_DISTRICTS, CRIMINAL_SYNDICATE_NODES, RECENT_FIRS } from '@/lib/kspMockData';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://kaavalai-backend-50044342834.development.catalystappsail.in';

export default function Home() {
  const [catalystOpen, setCatalystOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState('SCRB Director');

  const [kpi, setKpi] = useState({
    total_firs: 8420,
    heinous_crimes: 312,
    total_accused: 2890,
    total_stations: 108,
    active_red_zones: 5,
    repeat_offender_clusters: 28,
    predictive_risk_index: 84.6,
  });

  const [districts, setDistricts] = useState(
    KSP_DISTRICTS.map(d => ({
      district_id: d.id,
      district_name: d.name,
      lat: d.lat,
      lng: d.lng,
      crime_count: d.totalFirs,
      risk_score: d.riskScore,
      is_red_zone: d.riskCategory === 'CRITICAL' || d.riskCategory === 'HIGH',
      recommended_beat_patrols: Math.round(d.riskScore * 0.4)
    }))
  );

  const [predictiveData, setPredictiveData] = useState({
    forecast_period: "Next 30 Days (Aug 2026)",
    model: "XGBoost + Isolation Forest (Hybrid Ensemble)",
    model_confidence: "94.8%",
    high_risk_districts: KSP_DISTRICTS.filter(d => d.riskCategory === 'CRITICAL').map(d => ({
      district: d.name,
      predicted_crimes: Math.round(d.totalFirs * 0.05),
      risk_level: `${d.riskCategory} (Red Zone)`,
      primary_threat: d.topOffence
    })),
    anomalies: [
      { anomaly_id: "ANO_01", district: "Bengaluru City", severity: "CRITICAL", description: "Unusual spike in night vault robbery patterns (+340%)", recommended_action: "Deploy 4 Addl Patrol Vehicles", crime_count: 42, heinous_count: 8, risk_score: 94 },
      { anomaly_id: "ANO_02", district: "Kalaburagi", severity: "HIGH", description: "Arm extortion cluster around river sand transport routes", recommended_action: "Set up Highway Checkpost", crime_count: 31, heinous_count: 5, risk_score: 91 },
      { anomaly_id: "ANO_03", district: "Mangaluru City (DK)", severity: "ELEVATED", description: "Rapid multiplication of WhatsApp APK phishing mule accounts", recommended_action: "Freeze Target Mule Accounts", crime_count: 28, heinous_count: 2, risk_score: 88 }
    ]
  });

  const [catalystServices, setCatalystServices] = useState([
    { name: "Catalyst AppSail", status: "Active", type: "Managed Python & Next.js OCI Containers" },
    { name: "Catalyst Data Store", status: "Active", type: "Relational 24-Table KSP Case Master Schema" },
    { name: "Catalyst Functions", status: "Active", type: "Nightly ML Refresh & Red-Zone Alert Handlers" },
    { name: "Catalyst Job Scheduling", status: "Active", type: "Cron Scheduler for Automatic Re-Training" },
    { name: "Catalyst SmartBrowz", status: "Active", type: "Headless PDF Dossier & Case Brief Engine" },
    { name: "Catalyst Zia AutoML", status: "Active", type: "Tabular Crime Risk & Spatiotemporal Predictor" },
    { name: "Catalyst Signals", status: "Active", type: "Cross-District Emergency Response Bus" },
    { name: "Catalyst API Gateway", status: "Active", type: "CORS Shield & Rate Limiter" }
  ]);

  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const resKpi = await fetch(`${API}/api/kpi`, { signal: AbortSignal.timeout(3000) });
        if (resKpi.ok) setKpi(await resKpi.json());

        const resDist = await fetch(`${API}/api/districts`, { signal: AbortSignal.timeout(3000) });
        if (resDist.ok) {
          const rawDist = await resDist.json();
          if (Array.isArray(rawDist) && rawDist.length > 0) setDistricts(rawDist);
        }
      } catch (err) {
        // Smooth client-side fallback
      } finally {
        setLoading(false);
      }
    };
    fetchBackendData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-yellow-500 selection:text-slate-950">
      
      {/* Executive Command Header */}
      <CommandHeader 
        kpi={kpi} 
        onOpenCatalyst={() => setCatalystOpen(true)} 
        activeRole={activeRole}
        onRoleChange={(r) => setActiveRole(r)}
      />

      {/* Quick Navigation Toolbar */}
      <div className="bg-slate-900/80 border-b border-slate-800/80 px-4 lg:px-8 py-2.5 shadow-md backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-2 font-mono text-slate-400">
            <Activity className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
            <span>COMMAND MODULES:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link 
              href="/network"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg font-semibold transition"
            >
              <Network className="w-3.5 h-3.5" />
              <span>3D Criminal Syndicate Graph</span>
              <ChevronRight className="w-3 h-3" />
            </Link>

            <Link 
              href="/beat-patrol"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg font-semibold transition"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Beat Patrol Optimizer</span>
              <ChevronRight className="w-3 h-3" />
            </Link>

            <Link 
              href="/firs"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg font-semibold transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>FIR Intelligence Vault</span>
              <ChevronRight className="w-3 h-3" />
            </Link>

            <Link 
              href="/analytics"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg font-semibold transition"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>SCRB Forecast Analytics</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

        </div>
      </div>

      {/* Main Grid Workspace */}
      <motion.main 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 p-4 lg:p-8 space-y-6 max-w-[1800px] w-full mx-auto"
      >
        {/* Top 3D Visual Grid (Spatiotemporal Map + 3D Network Graph) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="tactical-panel p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-yellow-400" />
                <h2 className="text-sm font-bold text-slate-100 tracking-wide">31 DISTRICT SPATIOTEMPORAL RISK MAP</h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Layer: Heatmap + Red Zones</span>
            </div>
            <div className="flex-1 min-h-[380px] rounded-xl overflow-hidden border border-slate-800">
              <Map3D districts={districts} />
            </div>
          </div>

          <div className="tactical-panel p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-yellow-400" />
                <h2 className="text-sm font-bold text-slate-100 tracking-wide">CRIMINAL SYNDICATE NETWORK GRAPH</h2>
              </div>
              <Link href="/network" className="text-xs text-yellow-400 hover:underline font-semibold flex items-center gap-1">
                <span>Expand Full Screen</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex-1 min-h-[380px] rounded-xl overflow-hidden border border-slate-800">
              <NetworkGraph3D />
            </div>
          </div>
        </div>

        {/* Bottom AI Predictive Risk & Anomaly Panel */}
        <PredictiveDashboard data={predictiveData} />
      </motion.main>

      {/* Tactical Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0f172a] px-6 py-3.5 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-semibold text-slate-300">
            <ShieldAlert className="w-4 h-4 text-yellow-400" />
            Karnataka State Police (KSP) SCRB Platform
          </span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span>Logged in as: <strong className="text-yellow-400">{activeRole}</strong></span>
        </div>

        <div className="flex flex-wrap items-center gap-4 font-mono text-[11px]">
          <span className="text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            SYSTEM: ONLINE
          </span>
          <span className="text-blue-400">CATALYST CLOUD: CONNECTED</span>
          <span className="text-slate-500">PROJECT ID: 56816000000013052</span>
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
