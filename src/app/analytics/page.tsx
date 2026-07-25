'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Brain, 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  BarChart2, 
  Target, 
  Cpu, 
  RefreshCw, 
  Download,
  Layers,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { KSP_DISTRICTS } from '@/lib/kspMockData';

const FORECAST_SERIES = [
  { day: 'Day 1', predicted: 24, baseline: 20 },
  { day: 'Day 4', predicted: 28, baseline: 21 },
  { day: 'Day 7', predicted: 35, baseline: 22 },
  { day: 'Day 10', predicted: 31, baseline: 20 },
  { day: 'Day 13', predicted: 42, baseline: 23 },
  { day: 'Day 16', predicted: 48, baseline: 25 },
  { day: 'Day 19', predicted: 39, baseline: 24 },
  { day: 'Day 22', predicted: 30, baseline: 22 },
  { day: 'Day 25', predicted: 26, baseline: 21 },
  { day: 'Day 28', predicted: 33, baseline: 23 },
  { day: 'Day 30', predicted: 29, baseline: 20 },
];

const CATEGORY_BREAKDOWN = [
  { category: 'Cyber & Banking Fraud', count: 3420, risk: 92 },
  { category: 'Property Theft & Robbery', count: 2150, risk: 84 },
  { category: 'Heinous Homicide / Feud', count: 1420, risk: 88 },
  { category: 'Sand & Mineral Mafia', count: 980, risk: 79 },
  { category: 'Narcotics & Contraband', count: 740, risk: 75 },
];

export default function AnalyticsPage() {
  const [selectedSort, setSelectedSort] = useState<'RISK' | 'FIRS' | 'HEINOUS'>('RISK');

  const sortedDistricts = React.useMemo(() => {
    return [...KSP_DISTRICTS].sort((a, b) => {
      if (selectedSort === 'RISK') return b.riskScore - a.riskScore;
      if (selectedSort === 'FIRS') return b.totalFirs - a.totalFirs;
      return b.heinousCount - a.heinousCount;
    });
  }, [selectedSort]);

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
              <Brain className="w-5 h-5 text-yellow-400" />
              SCRB Crime Analytics & 30-Day Predictive Forecasting
            </h1>
            <p className="text-xs text-slate-400">
              XGBoost Predictive Pipeline + Isolation Forest Anomaly Detection Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
            Model Confidence: 94.8% (Ensemble)
          </span>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Top 30-Day Forecast Area Chart */}
        <div className="tactical-panel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              <h2 className="text-base font-bold text-white tracking-wide">30-DAY CRIME SPIKE PREDICTIVE FORECAST (XGBoost)</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">Interval: Aug 2026 Prediction Horizon</span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={FORECAST_SERIES}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#eab308', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="predicted" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#goldGradient)" name="XGBoost Predicted Crimes" />
                <Area type="monotone" dataKey="baseline" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" fill="none" name="Historical Baseline" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown & Leaderboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Crime Category Risk Bar Chart */}
          <div className="tactical-panel p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-yellow-400" />
                <h3 className="text-sm font-bold text-white">IPC / BNS CATEGORY BREAKDOWN</h3>
              </div>
            </div>

            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CATEGORY_BREAKDOWN} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="category" type="category" stroke="#94a3b8" tick={{ fontSize: 10 }} width={140} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#eab308', borderRadius: '8px', fontSize: '12px', color: '#fff' }} />
                  <Bar dataKey="count" fill="#eab308" radius={[0, 6, 6, 0]} name="Total FIRs" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 31 Districts Risk Leaderboard */}
          <div className="tactical-panel p-6 space-y-4 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-yellow-400" />
                <h3 className="text-sm font-bold text-white">31 KARNATAKA DISTRICT RISK RANKING</h3>
              </div>
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px]">
                <button
                  onClick={() => setSelectedSort('RISK')}
                  className={`px-2 py-0.5 rounded font-bold transition ${selectedSort === 'RISK' ? 'bg-yellow-500 text-slate-950' : 'text-slate-400'}`}
                >
                  By Risk
                </button>
                <button
                  onClick={() => setSelectedSort('FIRS')}
                  className={`px-2 py-0.5 rounded font-bold transition ${selectedSort === 'FIRS' ? 'bg-yellow-500 text-slate-950' : 'text-slate-400'}`}
                >
                  By FIRs
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[260px] space-y-2 pr-1">
              {sortedDistricts.map((dist, idx) => (
                <div 
                  key={dist.id}
                  className="tactical-card p-3 flex items-center justify-between gap-3 hover:border-yellow-500/40 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center font-mono font-bold text-yellow-400 text-[11px]">
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-white">{dist.name}</h4>
                      <span className="text-[10px] text-slate-400">{dist.zone} Range</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 font-mono">
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">FIRs</span>
                      <span className="text-slate-200 font-semibold">{dist.totalFirs}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Risk Score</span>
                      <span className={`font-bold ${
                        dist.riskScore >= 80 ? 'text-red-400' : dist.riskScore >= 65 ? 'text-yellow-400' : 'text-emerald-400'
                      }`}>
                        {dist.riskScore}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
