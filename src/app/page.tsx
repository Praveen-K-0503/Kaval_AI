'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldAlert, FileText, Network, MapPin, BarChart3,
  Users, AlertTriangle, TrendingUp, Activity, ChevronRight,
  Clock, Search, Printer, Radio, Flame, Sparkles, Layers, ShieldCheck
} from 'lucide-react';
import CommandHeader from '@/components/CommandHeader';
import Map3D from '@/components/Map3D';
import NetworkGraph3D from '@/components/NetworkGraph3D';
import PredictiveDashboard from '@/components/PredictiveDashboard';
import CatalystDrawer from '@/components/CatalystDrawer';
import { KSP_DISTRICTS } from '@/lib/kspMockData';
import { API_BASE_URL } from '@/lib/apiConfig';

const API = API_BASE_URL;

function MetricCard({ label, value, sublabel, icon, color, trend, trendPositive, delay }: {
  label: string; value: string | number; sublabel?: string;
  icon: React.ReactNode; color: string; trend?: string; trendPositive?: boolean; delay?: number;
}) {
  return (
    <div
      className="ksp-metric-card animate-slide-up"
      style={{
        animationDelay: `${delay || 0}ms`, opacity: 0, animationFillMode: 'forwards',
        position: 'relative', overflow: 'hidden', padding: '18px 20px',
        background: 'linear-gradient(145deg, #FFFFFF 0%, #FBF6EE 100%)',
        border: '1px solid #E8D4BA', borderRadius: '16px',
        boxShadow: '0 4px 16px rgba(139,26,26,0.04)',
        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLElement).style.boxShadow = `0 10px 25px ${color}18`;
        (e.currentTarget as HTMLElement).style.borderColor = color;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(139,26,26,0.04)';
        (e.currentTarget as HTMLElement).style.borderColor = '#E8D4BA';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '12px',
          background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
          border: `1.5px solid ${color}35`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color,
        }}>
          {icon}
        </div>
        {trend && (
          <span style={{
            fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '12px',
            background: trendPositive ? '#D1FAE5' : '#FEE2E2',
            color: trendPositive ? '#065F46' : '#991B1B',
            display: 'flex', alignItems: 'center', gap: '3px',
          }}>
            <TrendingUp size={12} style={{ transform: trendPositive ? 'none' : 'rotate(180deg)' }} />
            {trend}
          </span>
        )}
      </div>
      <div style={{ fontSize: '28px', fontWeight: 800, color: '#1C0A00', fontFamily: "'DM Mono', monospace", letterSpacing: '-0.02em' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#5C3D2E', marginTop: '4px' }}>{label}</div>
      {sublabel && <div style={{ fontSize: '11px', color: '#9B7560', marginTop: '2px', fontWeight: 500 }}>{sublabel}</div>}
    </div>
  );
}

const QuickLink = ({ href, icon, label, desc, accent, badge }: { href: string; icon: React.ReactNode; label: string; desc: string; accent: string; badge?: string }) => (
  <Link
    href={href}
    style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '16px 18px',
      background: '#ffffff',
      border: '1px solid #E8D4BA',
      borderRadius: '16px',
      textDecoration: 'none',
      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      boxShadow: '0 2px 10px rgba(139,26,26,0.04)',
      borderLeft: `5px solid ${accent}`,
      position: 'relative',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.borderColor = accent;
      (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${accent}22`;
      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.borderColor = '#E8D4BA';
      (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px rgba(139,26,26,0.04)';
      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
    }}
  >
    <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: `${accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, flexShrink: 0 }}>
      {icon}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ fontSize: '14px', fontWeight: 800, color: '#1C0A00' }}>{label}</div>
        {badge && (
          <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px', background: `${accent}15`, color: accent, borderRadius: '8px', border: `1px solid ${accent}30` }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{ fontSize: '11px', color: '#9B7560', marginTop: '2px', fontWeight: 500 }}>{desc}</div>
    </div>
    <ChevronRight size={16} style={{ color: '#D4B896', flexShrink: 0 }} />
  </Link>
);

export default function Home() {
  const [catalystOpen, setCatalystOpen] = useState(false);
  const [activeRole, setActiveRole] = useState('SCRB Director');
  const [searchQuery, setSearchQuery] = useState('');
  const [leftTab, setLeftTab] = useState<'MAP' | 'CLOCK'>('MAP');

  const kpi = {
    total_firs: 8420,
    heinous_crimes: 312,
    total_accused: 2890,
    total_stations: 108,
    active_red_zones: 5,
    repeat_offender_clusters: 28,
    predictive_risk_index: 84.6,
  };

  const districts = KSP_DISTRICTS.map(d => ({
    district_id: d.id, district_name: d.name,
    lat: d.lat, lng: d.lng,
    crime_count: d.totalFirs, risk_score: d.riskScore,
    is_red_zone: d.riskCategory === 'CRITICAL' || d.riskCategory === 'HIGH',
    recommended_beat_patrols: Math.round(d.riskScore * 0.4),
  }));

  const predictiveData = {
    forecast_period: 'Next 30 Days (FY 2025-26)',
    model: 'XGBoost + Isolation Forest (Hybrid Ensemble)',
    model_confidence: '94.8%',
    high_risk_districts: KSP_DISTRICTS.filter(d => d.riskCategory === 'CRITICAL').map(d => ({
      district: d.name,
      predicted_crimes: Math.round(d.totalFirs * 0.05),
      risk_level: `${d.riskCategory} (Red Zone)`,
      primary_threat: d.topOffence,
    })),
    anomalies: [
      { anomaly_id: 'ANO_01', district: 'Bengaluru City', severity: 'CRITICAL', description: 'Night vault robbery spike +340%', recommended_action: 'Deploy 4 Addl Patrol Vehicles', crime_count: 42, heinous_count: 8, risk_score: 94 },
      { anomaly_id: 'ANO_02', district: 'Kalaburagi', severity: 'HIGH', description: 'Arm extortion near sand transport routes', recommended_action: 'Set up Highway Checkpost', crime_count: 31, heinous_count: 5, risk_score: 91 },
      { anomaly_id: 'ANO_03', district: 'Mangaluru City (DK)', severity: 'ELEVATED', description: 'WhatsApp APK phishing mule accounts surge', recommended_action: 'Freeze Mule Accounts', crime_count: 28, heinous_count: 2, risk_score: 88 },
    ],
  };

  const catalystServices = [
    { name: 'Catalyst AppSail', status: 'Active', type: 'Managed Python & Next.js OCI Containers' },
    { name: 'Catalyst Data Store', status: 'Active', type: '24-Table KSP Case Master Schema' },
    { name: 'Catalyst Functions', status: 'Active', type: 'Nightly ML Refresh & Red-Zone Alert Handlers' },
    { name: 'Catalyst Job Scheduling', status: 'Active', type: 'Cron Scheduler for Auto Re-Training' },
    { name: 'Catalyst Zia AutoML', status: 'Active', type: 'Tabular Crime Risk & Spatiotemporal Predictor' },
    { name: 'Catalyst API Gateway', status: 'Active', type: 'CORS Shield & Rate Limiter' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#FBF6EE', display: 'flex', flexDirection: 'column', fontFamily: "'Outfit', sans-serif" }}>

      {/* Top Command Header */}
      <CommandHeader
        kpi={kpi}
        onOpenCatalyst={() => setCatalystOpen(true)}
        activeRole={activeRole}
        onRoleChange={r => setActiveRole(r)}
      />

      {/* Live State Intelligence Ticker Bar */}
      <div style={{
        background: 'linear-gradient(90deg, #8B1A1A 0%, #5C1010 100%)',
        color: '#FBF6EE',
        padding: '8px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        fontWeight: 600,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            background: '#C8960C', color: '#1C0A00', fontWeight: 800, fontSize: '10px',
            padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>
            LIVE TICKER
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F2E8D9' }}>
            <Radio size={14} className="animate-pulse" style={{ color: '#FFD700' }} />
            <span>SCRB Advisory: <strong>Peak Patrol Deployment Window 8PM–2AM</strong> — Deploy 60% officer fleet to Bengaluru City & Kalaburagi Red Zones.</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', opacity: 0.9 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={13} style={{ color: '#FFD700' }} />
            XGBoost ML Accuracy: <strong style={{ color: '#FFD700' }}>94.8%</strong>
          </span>
          <span>|</span>
          <span style={{ color: '#F2E8D9' }}>Catalyst Cloud Sync: <strong style={{ color: '#6EE7B7' }}>Connected</strong></span>
        </div>
      </div>

      {/* Page Main Workspace */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '1650px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>

        {/* Executive Action Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
          background: '#ffffff', padding: '14px 20px', borderRadius: '16px', border: '1px solid #E8D4BA',
          boxShadow: '0 2px 10px rgba(139,26,26,0.03)', marginBottom: '24px'
        }}>
          {/* Quick Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '480px', background: '#FBF6EE', padding: '8px 14px', borderRadius: '10px', border: '1px solid #E8D4BA' }}>
            <Search size={16} style={{ color: '#9B7560' }} />
            <input
              type="text"
              placeholder="Search Crime Heads, FIR Numbers, Accused Aliases, or Police Stations..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '13px', color: '#1C0A00', fontWeight: 500 }}
            />
          </div>

          {/* Action Launcher Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/firs" style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px',
              background: '#8B1A1A', color: '#ffffff', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
              textDecoration: 'none', transition: 'all 0.2s ease', boxShadow: '0 2px 8px rgba(139,26,26,0.2)'
            }}>
              <FileText size={15} /> Search FIR Vault
            </Link>

            <Link href="/beat-patrol" style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px',
              background: '#C8960C', color: '#1C0A00', borderRadius: '10px', fontSize: '12px', fontWeight: 800,
              textDecoration: 'none', transition: 'all 0.2s ease'
            }}>
              <MapPin size={15} /> Launch Patrol Optimizer
            </Link>

            <button
              onClick={() => window.print()}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px',
                background: '#F2E8D9', color: '#5C3D2E', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
                border: '1px solid #E8D4BA', cursor: 'pointer', transition: 'all 0.2s ease'
              }}
            >
              <Printer size={15} /> Executive Brief
            </button>
          </div>
        </div>

        {/* KPI Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <MetricCard label="Total FIRs Registered" value={8420} sublabel="FY 2025-26 · All 31 Districts" icon={<FileText size={20} />} color="#8B1A1A" trend="+4.2% YoY" trendPositive={false} delay={0} />
          <MetricCard label="Heinous Offences" value={312} sublabel="Active Investigations" icon={<ShieldAlert size={20} />} color="#DC2626" trend="-1.8% MoM" trendPositive={true} delay={60} />
          <MetricCard label="Active Accused" value={2890} sublabel="In 224 Active Cases" icon={<Users size={20} />} color="#C8960C" trend="289 Tagged" trendPositive={true} delay={120} />
          <MetricCard label="Police Stations" value={108} sublabel="Bengaluru City Range" icon={<MapPin size={20} />} color="#2D5016" trend="100% Operational" trendPositive={true} delay={180} />
          <MetricCard label="Active Red Zones" value={5} sublabel="CRITICAL Risk Districts" icon={<AlertTriangle size={20} />} color="#DC2626" trend="Priority 1" trendPositive={false} delay={240} />
          <MetricCard label="Predictive Risk Index" value="84.6%" sublabel="XGBoost Confidence: 94.8%" icon={<Activity size={20} />} color="#B87333" trend="Stable" trendPositive={true} delay={300} />
        </div>

        {/* Quick Navigation Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <QuickLink href="/network" icon={<Network size={20} />} label="3D Syndicate Network" desc="Organised crime linkage graph" accent="#8B1A1A" badge="3D Graph" />
          <QuickLink href="/beat-patrol" icon={<MapPin size={20} />} label="Beat Patrol Optimizer" desc="Dijkstra route & deployment" accent="#C8960C" badge="Leaflet Map" />
          <QuickLink href="/firs" icon={<FileText size={20} />} label="FIR Intelligence Vault" desc="MO search & case dossiers" accent="#2D5016" badge="24 Tables" />
          <QuickLink href="/analytics" icon={<BarChart3 size={20} />} label="SCRB Crime Analytics" desc="30-day XGBoost forecasting" accent="#B87333" badge="4 Tabs" />
        </div>

        {/* Main 2-Column Visual Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>

          {/* Left Column Panel: Spatiotemporal Risk Heatmap / Clock Toggle */}
          <div className="ksp-panel animate-slide-up" style={{ animationDelay: '100ms', opacity: 0, animationFillMode: 'forwards', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #F2E8D9' }}>
              <div>
                <div className="section-heading">Spatiotemporal Intelligence</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C0A00', marginTop: '2px' }}>31 District Crime Density & Risk Index</div>
              </div>

              {/* Toggle Selector */}
              <div style={{ display: 'flex', alignItems: 'center', background: '#FBF6EE', padding: '3px', borderRadius: '10px', border: '1px solid #E8D4BA' }}>
                <button
                  onClick={() => setLeftTab('MAP')}
                  style={{
                    padding: '4px 12px', fontSize: '11px', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: leftTab === 'MAP' ? '#8B1A1A' : 'transparent',
                    color: leftTab === 'MAP' ? '#ffffff' : '#5C3D2E',
                    transition: 'all 0.2s ease',
                  }}
                >
                  🗺️ 3D Map
                </button>
                <Link
                  href="/analytics"
                  style={{
                    padding: '4px 12px', fontSize: '11px', fontWeight: 700, borderRadius: '8px', border: 'none', textDecoration: 'none',
                    color: '#5C3D2E', display: 'flex', alignItems: 'center', gap: '4px'
                  }}
                >
                  🕐 Crime Clock
                </Link>
              </div>
            </div>

            <div style={{ flex: 1, minHeight: '380px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #F2E8D9', position: 'relative' }}>
              <Map3D districts={districts} />
            </div>
          </div>

          {/* Right Column Panel: 3D Criminal Network Preview */}
          <div className="ksp-panel animate-slide-up" style={{ animationDelay: '200ms', opacity: 0, animationFillMode: 'forwards', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #F2E8D9' }}>
              <div>
                <div className="section-heading">Criminal Syndicate Linkage</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1C0A00', marginTop: '2px' }}>3D Gang Centrality & Network Graph</div>
              </div>

              <Link href="/network" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: '#8B1A1A', textDecoration: 'none', background: '#FFF8EF', padding: '5px 12px', borderRadius: '20px', border: '1px solid #E8D4BA' }}>
                Inspect Network <ChevronRight size={12} />
              </Link>
            </div>
            <div style={{ flex: 1, minHeight: '380px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #F2E8D9', background: '#FBF6EE' }}>
              <NetworkGraph3D />
            </div>
          </div>

        </div>

        {/* Predictive Analytics Panel */}
        <div className="animate-slide-up" style={{ animationDelay: '300ms', opacity: 0, animationFillMode: 'forwards' }}>
          <PredictiveDashboard data={predictiveData} />
        </div>

      </main>

      {/* Footer */}
      <footer style={{
        background: '#fff', borderTop: '1px solid #E8D4BA',
        padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: '12px', color: '#9B7560', flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={16} style={{ color: '#8B1A1A' }} />
          <span style={{ color: '#8B1A1A', fontWeight: 700 }}>© 2026 Karnataka State Police · SCRB Intelligence Suite</span>
          <span>|</span>
          <span>Logged in as: <strong style={{ color: '#C8960C' }}>{activeRole}</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontFamily: "'DM Mono', monospace", fontSize: '11px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#065F46', fontWeight: 800 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            SYSTEM: OPERATIONAL
          </span>
          <span style={{ color: '#5C3D2E' }}>CATALYST CLOUD: CONNECTED</span>
          <span style={{ color: '#9B7560' }}>PROJECT ID: 56816000000013052</span>
        </div>
      </footer>

      {/* Catalyst Drawer */}
      <CatalystDrawer isOpen={catalystOpen} onClose={() => setCatalystOpen(false)} services={catalystServices} />
    </div>
  );
}
