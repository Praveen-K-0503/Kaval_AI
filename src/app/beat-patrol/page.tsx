'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Target, 
  RefreshCw, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Printer, 
  Navigation,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { BEAT_CHECKPOINTS, BeatCheckpoint } from '@/lib/kspMockData';

const STATIONS = [
  { id: 'SC_PS', name: 'Bengaluru City — Subhedar Chatra PS', district: 'Bengaluru City', riskIndex: 88 },
  { id: 'BP_PS', name: 'Kalaburagi — Brahmapur PS', district: 'Kalaburagi', riskIndex: 94 },
  { id: 'PD_PS', name: 'Mangaluru — Pandeshwar PS', district: 'Mangaluru City (DK)', riskIndex: 82 },
  { id: 'LS_PS', name: 'Mysuru — Lashkar PS', district: 'Mysuru City', riskIndex: 76 }
];

export default function BeatPatrolPage() {
  const [selectedStation, setSelectedStation] = useState(STATIONS[0].id);
  const [selectedShift, setSelectedShift] = useState<'NIGHT' | 'EVENING' | 'MORNING'>('NIGHT');
  const [officerCount, setOfficerCount] = useState<number>(4);
  const [completedCPs, setCompletedCPs] = useState<string[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const activeStation = STATIONS.find(s => s.id === selectedStation) || STATIONS[0];

  const toggleCheck = (id: string) => {
    setCompletedCPs(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      
      {/* Header Bar */}
      <header className="bg-slate-900/90 border-b border-yellow-500/20 px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 bg-slate-800 hover:bg-slate-700 text-yellow-400 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-extrabold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-yellow-400" />
              Greedy Beat Patrol Route & Personnel Optimizer
            </h1>
            <p className="text-xs text-slate-400">
              Karnataka State Police — Spatiotemporal Police Dispatch & High-Risk Checkpoints
            </p>
          </div>
        </div>

        <button 
          onClick={() => setShowPrintModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-xs font-bold rounded-lg transition shadow-md glow-gold"
        >
          <Printer className="w-4 h-4" />
          <span>Print Officer Patrol Brief</span>
        </button>
      </header>

      {/* Main Grid Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Controls Bar */}
        <div className="tactical-panel p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Station Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">TARGET POLICE STATION</label>
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-yellow-400 cursor-pointer"
            >
              {STATIONS.map(st => (
                <option key={st.id} value={st.id} className="bg-slate-900 text-white">
                  {st.name} (Risk: {st.riskIndex})
                </option>
              ))}
            </select>
          </div>

          {/* Shift Selection */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">PATROL SHIFT PERIOD</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'NIGHT', label: 'Night Shift (22-06)' },
                { id: 'EVENING', label: 'Evening Shift (14-22)' },
                { id: 'MORNING', label: 'Morning Shift (06-14)' },
              ].map(sh => (
                <button
                  key={sh.id}
                  onClick={() => setSelectedShift(sh.id as any)}
                  className={`py-2 text-[11px] font-bold rounded-lg transition ${
                    selectedShift === sh.id 
                      ? 'bg-yellow-500 text-slate-950 shadow-md' 
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  {sh.label}
                </button>
              ))}
            </div>
          </div>

          {/* Officer Allocation Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300">ALLOCATED OFFICERS</label>
              <span className="text-xs font-mono font-bold text-yellow-400">{officerCount} Officers</span>
            </div>
            <input
              type="range"
              min={2}
              max={12}
              value={officerCount}
              onChange={(e) => setOfficerCount(Number(e.target.value))}
              className="w-full accent-yellow-400 cursor-pointer"
            />
          </div>

        </div>

        {/* Patrol Route Summary Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="tactical-card p-4">
            <span className="text-xs text-slate-400 block mb-1">Target Station</span>
            <span className="text-sm font-extrabold text-white">{activeStation.name}</span>
          </div>
          <div className="tactical-card p-4">
            <span className="text-xs text-slate-400 block mb-1">Station Risk Index</span>
            <span className="text-lg font-mono font-bold text-red-400">{activeStation.riskIndex} / 100</span>
          </div>
          <div className="tactical-card p-4">
            <span className="text-xs text-slate-400 block mb-1">Checkpoints Assigned</span>
            <span className="text-lg font-mono font-bold text-yellow-400">{BEAT_CHECKPOINTS.length} Waypoints</span>
          </div>
          <div className="tactical-card p-4">
            <span className="text-xs text-slate-400 block mb-1">Route Completion</span>
            <span className="text-lg font-mono font-bold text-emerald-400">
              {Math.round((completedCPs.length / BEAT_CHECKPOINTS.length) * 100)}% Completed
            </span>
          </div>
        </div>

        {/* Optimized Checkpoint Route Checklist */}
        <div className="tactical-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Navigation className="w-5 h-5 text-yellow-400" />
              <h2 className="text-base font-bold text-white tracking-wide">OPTIMIZED BEAT PATROL WAYPOINTS CHECKLIST</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Algorithm: Dijkstra Shortest Path + DBSCAN Risk Weight</span>
          </div>

          <div className="space-y-3">
            {BEAT_CHECKPOINTS.map(cp => {
              const isChecked = completedCPs.includes(cp.id);
              return (
                <div 
                  key={cp.id}
                  onClick={() => toggleCheck(cp.id)}
                  className={`tactical-card p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                    isChecked ? 'border-emerald-500/50 bg-emerald-950/10' : 'hover:border-yellow-500/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleCheck(cp.id); }}
                      className={`w-6 h-6 rounded-md flex items-center justify-center border transition mt-0.5 ${
                        isChecked ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-700 bg-slate-900 text-transparent'
                      }`}
                    >
                      ✓
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded">
                          STOP #{cp.order}
                        </span>
                        <h3 className={`text-sm font-bold ${isChecked ? 'line-through text-slate-400' : 'text-white'}`}>
                          {cp.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{cp.location}</p>
                      <p className="text-xs text-slate-300 font-mono mt-1">
                        <strong>Patrol Note:</strong> {cp.patrolInstructions}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-slate-300 font-mono">
                      ⏰ {cp.recommendedTime}
                    </span>
                    <span className={`px-2.5 py-1 rounded font-extrabold text-[11px] ${
                      cp.riskRating === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                    }`}>
                      {cp.riskRating} RISK
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Printable Officer Patrol Brief Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-yellow-500/40 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 glow-gold">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Printer className="w-5 h-5 text-yellow-400" />
                KARNATAKA STATE POLICE — OFFICER BEAT DOSSIER
              </h3>
              <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-white font-mono">✕</button>
            </div>

            <div className="space-y-2 text-xs text-slate-300 font-mono bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p><strong>STATION:</strong> {activeStation.name}</p>
              <p><strong>SHIFT:</strong> {selectedShift} SHIFT</p>
              <p><strong>OFFICERS ON DUTY:</strong> {officerCount} Constables</p>
              <p><strong>DATE:</strong> {new Date().toLocaleDateString('en-IN')}</p>
              <hr className="border-slate-800 my-2" />
              <p className="text-yellow-400 font-bold">WAYPOINTS TO COVER:</p>
              {BEAT_CHECKPOINTS.map(c => (
                <p key={c.id}>• #{c.order} {c.name} ({c.recommendedTime}) — {c.riskRating} RISK</p>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button 
                onClick={() => setShowPrintModal(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
              <button 
                onClick={() => { window.print(); setShowPrintModal(false); }}
                className="flex-1 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-xs font-bold rounded-lg shadow-md glow-gold"
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
