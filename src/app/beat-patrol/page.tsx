'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowLeft, MapPin, Shield, Printer, Navigation,
  CheckCircle2, Clock, AlertTriangle, ChevronRight, Target, Zap
} from 'lucide-react';
import { BEAT_CHECKPOINTS } from '@/lib/kspMockData';

// Dynamically load the map to avoid SSR issues
const BeatMap = dynamic(() => import('@/components/BeatMap'), { ssr: false, loading: () => (
  <div style={{ height: '100%', background: '#FBF6EE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '14px' }}>
    <div style={{ width: '40px', height: '40px', border: '4px solid #F2E8D9', borderTopColor: '#8B1A1A', borderRadius: '50%', animation: 'spinSlow 0.9s linear infinite' }} />
    <span style={{ fontSize: '12px', color: '#9B7560', fontWeight: 600 }}>Loading Patrol Route Map…</span>
  </div>
)});

const STATIONS = [
  { id: 'SC_PS', name: 'Bengaluru City — Subhedar Chatra PS', district: 'Bengaluru City',    riskIndex: 88, lat: 12.9772, lng: 77.5712 },
  { id: 'BP_PS', name: 'Kalaburagi — Brahmapur PS',           district: 'Kalaburagi',         riskIndex: 94, lat: 17.3297, lng: 76.8343 },
  { id: 'PD_PS', name: 'Mangaluru — Pandeshwar PS',           district: 'Mangaluru City (DK)', riskIndex: 82, lat: 12.8698, lng: 74.8430 },
  { id: 'LS_PS', name: 'Mysuru — Lashkar PS',                 district: 'Mysuru City',        riskIndex: 76, lat: 12.2958, lng: 76.6394 },
];

export default function BeatPatrolPage() {
  const [selectedStation, setSelectedStation] = useState(STATIONS[0].id);
  const [selectedShift, setSelectedShift] = useState<'NIGHT' | 'EVENING' | 'MORNING'>('NIGHT');
  const [officerCount, setOfficerCount] = useState(4);
  const [completedCPs, setCompletedCPs] = useState<string[]>([]);
  const [showPrint, setShowPrint] = useState(false);
  const [activeCP, setActiveCP] = useState<string | null>(null);

  const activeStation = STATIONS.find(s => s.id === selectedStation) || STATIONS[0];
  const toggleCP = (id: string) => setCompletedCPs(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  const completionPct = Math.round((completedCPs.length / BEAT_CHECKPOINTS.length) * 100);

  const RISK_BADGE: Record<string, { bg: string; color: string; border: string; dot: string }> = {
    HIGH:     { bg: '#FEE2E2', color: '#991B1B', border: '#FECACA', dot: '#DC2626' },
    MEDIUM:   { bg: '#FEF3C7', color: '#92400E', border: '#FDE68A', dot: '#F59E0B' },
    MODERATE: { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0', dot: '#10B981' },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FBF6EE', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #8B1A1A 0%, #A52020 100%)', borderBottom: '3px solid #C8960C', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '14px', minHeight: '60px', boxShadow: '0 4px 16px rgba(139,26,26,0.25)', flexWrap: 'wrap' }}>
        <Link href="/" style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none', flexShrink: 0 }}>
          <ArrowLeft size={16} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <MapPin size={18} style={{ opacity: 0.9, flexShrink: 0 }} /> Beat Patrol Route Optimizer & Live Map
          </h1>
          <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
            Dijkstra Shortest Path · DBSCAN Risk Weighting · Real-Time Checkpoint Tracker
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <span style={{ fontSize: '11px', fontFamily: "'DM Mono', monospace", color: '#FDE68A', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)', fontWeight: 700 }}>
            {completionPct}% Complete
          </span>
          <button onClick={() => setShowPrint(true)} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 14px', background: '#C8960C', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 800, color: '#1C0A00', cursor: 'pointer', boxShadow: '0 2px 12px rgba(200,150,12,0.4)', whiteSpace: 'nowrap' }}>
            <Printer size={14} /> Print Brief
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '20px 24px', maxWidth: '1500px', width: '100%', margin: '0 auto', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {/* Controls Row */}
        <div className="ksp-panel" style={{ padding: '18px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#8B1A1A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Target Police Station</label>
            <select value={selectedStation} onChange={e => setSelectedStation(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #E8D4BA', borderRadius: '8px', fontSize: '12px', color: '#1C0A00', background: '#FFF8EF', outline: 'none', fontFamily: 'inherit', fontWeight: 600, cursor: 'pointer' }}>
              {STATIONS.map(s => <option key={s.id} value={s.id}>{s.name} (Risk: {s.riskIndex})</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#8B1A1A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>Patrol Shift</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              {(['NIGHT', 'EVENING', 'MORNING'] as const).map(sh => (
                <button key={sh} onClick={() => setSelectedShift(sh)} style={{ padding: '9px 6px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', border: '1.5px solid', background: selectedShift === sh ? '#8B1A1A' : '#FFF8EF', color: selectedShift === sh ? '#fff' : '#5C3D2E', borderColor: selectedShift === sh ? '#8B1A1A' : '#E8D4BA', boxShadow: selectedShift === sh ? '0 3px 10px rgba(139,26,26,0.25)' : 'none', transition: 'all 0.2s ease' }}>
                  {sh === 'NIGHT' ? '🌙 Night' : sh === 'EVENING' ? '🌆 Evening' : '🌅 Morning'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', fontWeight: 800, color: '#8B1A1A', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Officers Allocated</label>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#C8960C', fontFamily: "'DM Mono', monospace" }}>{officerCount} Officers</span>
            </div>
            <input type="range" min={2} max={12} value={officerCount} onChange={e => setOfficerCount(Number(e.target.value))} style={{ width: '100%', accentColor: '#8B1A1A', cursor: 'pointer' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9B7560', marginTop: '4px' }}><span>Min: 2</span><span>Max: 12</span></div>
          </div>
        </div>

        {/* KPI Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {[
            { label: 'Station', value: activeStation.district, sub: 'Jurisdiction' },
            { label: 'Risk Index', value: `${activeStation.riskIndex}/100`, sub: 'Station Risk Score' },
            { label: 'Waypoints', value: `${BEAT_CHECKPOINTS.length}`, sub: 'Dijkstra Optimized' },
            { label: 'Officers', value: `${officerCount}`, sub: `${selectedShift} Shift` },
            { label: 'Progress', value: `${completionPct}%`, sub: `${completedCPs.length}/${BEAT_CHECKPOINTS.length} Done` },
          ].map((m, i) => (
            <div key={i} className="ksp-metric-card animate-slide-up" style={{ animationDelay: `${i * 70}ms`, opacity: 0, animationFillMode: 'forwards', padding: '14px 16px' }}>
              <div style={{ fontSize: '10px', color: '#9B7560', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>{m.label}</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#1C0A00', fontFamily: "'DM Mono', monospace" }}>{m.value}</div>
              <div style={{ fontSize: '10px', color: '#9B7560', marginTop: '2px' }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Main 2-column layout: Map + Checklist */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '18px', flex: 1 }}>

          {/* LEFT: Live Patrol Map */}
          <div className="ksp-panel" style={{ padding: '0', overflow: 'hidden', minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #F2E8D9', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: '#FEE2E2', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B1A1A' }}>
                <MapPin size={16} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1C0A00' }}>Live Patrol Route Map</div>
                <div style={{ fontSize: '11px', color: '#9B7560' }}>Click checkpoint markers to mark complete · Route = Dijkstra optimal path</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', fontSize: '10px', fontWeight: 700 }}>
                {[['#DC2626','HIGH RISK'], ['#F59E0B','MEDIUM'], ['#10B981','DONE']].map(([c,l]) => (
                  <span key={l} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#5C3D2E' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c, display: 'inline-block' }} />{l}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, minHeight: '460px' }}>
              <BeatMap checkpoints={BEAT_CHECKPOINTS} completedCPs={completedCPs} activeCP={activeCP} onToggle={toggleCP} stationLat={activeStation.lat} stationLng={activeStation.lng} />
            </div>
          </div>

          {/* RIGHT: Checkpoint Checklist */}
          <div className="ksp-panel" style={{ padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '620px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #F2E8D9', marginBottom: '2px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#1C0A00' }}>Waypoint Checklist</div>
                <div style={{ fontSize: '11px', color: '#9B7560', marginTop: '1px' }}>Tap to mark complete</div>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: completionPct === 100 ? '#065F46' : '#92400E', background: completionPct === 100 ? '#D1FAE5' : '#FEF3C7', padding: '4px 10px', borderRadius: '20px', border: `1px solid ${completionPct === 100 ? '#A7F3D0' : '#FDE68A'}` }}>
                {completionPct}% Done
              </div>
            </div>

            {BEAT_CHECKPOINTS.map((cp, i) => {
              const done = completedCPs.includes(cp.id);
              const riskStyle = RISK_BADGE[cp.riskRating] || RISK_BADGE.MODERATE;
              const isActive = activeCP === cp.id;
              return (
                <div
                  key={cp.id}
                  onClick={() => { toggleCP(cp.id); setActiveCP(isActive ? null : cp.id); }}
                  className="animate-slide-up"
                  style={{
                    animationDelay: `${i * 60}ms`, opacity: 0, animationFillMode: 'forwards',
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                    background: done ? '#F0FDF4' : isActive ? '#FFF8EF' : '#fff',
                    border: `1.5px solid ${done ? '#A7F3D0' : isActive ? '#C8960C' : '#E8D4BA'}`,
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 4px 12px rgba(200,150,12,0.15)' : '0 1px 4px rgba(139,26,26,0.04)',
                  }}
                >
                  {/* Check button */}
                  <div style={{ width: '22px', height: '22px', borderRadius: '6px', border: `2px solid ${done ? '#10B981' : '#D4B896'}`, background: done ? '#10B981' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', transition: 'all 0.2s ease' }}>
                    {done && <CheckCircle2 size={13} style={{ color: '#fff' }} />}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px', background: '#FFF8EF', color: '#C8960C', border: '1px solid #E8D4BA', borderRadius: '12px', fontFamily: "'DM Mono', monospace", flexShrink: 0 }}>#{cp.order}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: done ? '#6B7280' : '#1C0A00', textDecoration: done ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cp.name}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#9B7560', marginBottom: '3px' }}>{cp.location}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '10px', border: `1px solid ${riskStyle.border}`, background: riskStyle.bg, color: riskStyle.color, flexShrink: 0 }}>{cp.riskRating}</span>
                      <span style={{ fontSize: '10px', color: '#5C3D2E', fontFamily: "'DM Mono', monospace" }}>⏰ {cp.recommendedTime}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Progress bar at bottom */}
            <div style={{ paddingTop: '10px', borderTop: '1px solid #F2E8D9', marginTop: '4px' }}>
              <div style={{ fontSize: '11px', color: '#9B7560', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Patrol Progress</span><span style={{ fontWeight: 700, color: '#8B1A1A' }}>{completedCPs.length}/{BEAT_CHECKPOINTS.length} waypoints</span>
              </div>
              <div style={{ height: '8px', background: '#F2E8D9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${completionPct}%`, background: completionPct === 100 ? '#10B981' : 'linear-gradient(90deg, #8B1A1A, #C8960C)', borderRadius: '4px', transition: 'width 0.4s ease' }} />
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* Print Modal */}
      {showPrint && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(28,10,0,0.4)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ background: '#fff', border: '2px solid #C8960C', borderRadius: '16px', padding: '28px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 50px rgba(139,26,26,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #F2E8D9' }}>
              <Shield size={20} style={{ color: '#8B1A1A' }} />
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1C0A00' }}>Karnataka State Police — Officer Patrol Brief</h3>
              <button onClick={() => setShowPrint(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#9B7560', fontSize: '18px' }}>✕</button>
            </div>
            <div style={{ background: '#FBF6EE', padding: '16px', borderRadius: '10px', border: '1px solid #E8D4BA', fontSize: '11px', fontFamily: "'DM Mono', monospace", color: '#5C3D2E', lineHeight: 1.7, marginBottom: '16px' }}>
              <div><strong>STATION:</strong> {activeStation.name}</div>
              <div><strong>SHIFT:</strong> {selectedShift} SHIFT · {officerCount} Officers</div>
              <div><strong>DATE:</strong> {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              <div><strong>PROGRESS:</strong> {completionPct}% ({completedCPs.length}/{BEAT_CHECKPOINTS.length} waypoints done)</div>
              <div style={{ marginTop: '10px', borderTop: '1px solid #E8D4BA', paddingTop: '10px' }}>
                <strong>WAYPOINTS:</strong>
                {BEAT_CHECKPOINTS.map(c => (
                  <div key={c.id} style={{ textDecoration: completedCPs.includes(c.id) ? 'line-through' : 'none', color: completedCPs.includes(c.id) ? '#9B7560' : '#5C3D2E' }}>
                    {completedCPs.includes(c.id) ? '✓' : '○'} #{c.order}: {c.name} ({c.recommendedTime}) — {c.riskRating}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowPrint(false)} style={{ flex: 1, padding: '10px', background: '#F2E8D9', border: '1px solid #E8D4BA', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#5C3D2E', cursor: 'pointer' }}>Close</button>
              <button onClick={() => { window.print(); setShowPrint(false); }} style={{ flex: 1, padding: '10px', background: '#C8960C', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 800, color: '#1C0A00', cursor: 'pointer', boxShadow: '0 3px 12px rgba(200,150,12,0.35)' }}>
                🖨 Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
