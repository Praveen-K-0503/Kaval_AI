'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  AlertTriangle, 
  Clock, 
  Download, 
  Cpu,
  Activity,
  UserCheck,
  Radio,
  Send,
  CheckCircle2,
  Bell
} from 'lucide-react';
import jsPDF from 'jspdf';

interface KPIProps {
  kpi: {
    total_firs: number;
    heinous_crimes: number;
    total_accused: number;
    total_stations: number;
    active_red_zones: number;
    repeat_offender_clusters: number;
    predictive_risk_index: number;
  };
  onOpenCatalyst: () => void;
  activeRole?: string;
  onRoleChange?: (role: string) => void;
}

export default function CommandHeader({ kpi, onOpenCatalyst, activeRole = 'SCRB Director', onRoleChange }: KPIProps) {
  const [time, setTime] = useState<string>('');
  const [exporting, setExporting] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>(activeRole);
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [broadcastTarget, setBroadcastTarget] = useState<string>('Bengaluru City - Subhedar Chatra PS');
  const [broadcastMessage, setBroadcastMessage] = useState<string>('RED ZONE ALERT: High risk robbery pattern detected. Deploy 2 addl beat patrols immediately.');
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const r = e.target.value;
    setSelectedRole(r);
    if (onRoleChange) onRoleChange(r);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      doc.setFillColor(11, 15, 25);
      doc.rect(0, 0, 210, 297, 'F');

      // Title Banner
      doc.setTextColor(234, 179, 8); // Gold
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('KARNATAKA STATE POLICE — SCRB INTELLIGENCE BRIEF', 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')} | Role: ${selectedRole}`, 14, 28);
      doc.text('Confidential — For Internal Police Officer Use Only', 14, 33);

      doc.setDrawColor(234, 179, 8);
      doc.setLineWidth(0.5);
      doc.line(14, 36, 196, 36);

      // Section: Key Stats
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('EXECUTIVE CRIME METRICS SUMMARY', 14, 45);

      const metrics = [
        [`Total Registered FIRs`, `${kpi.total_firs.toLocaleString()}`],
        [`Heinous Offences Recorded`, `${kpi.heinous_crimes}`],
        [`Active Accused Profiles`, `${kpi.total_accused.toLocaleString()}`],
        [`Jurisdictional Police Stations`, `${kpi.total_stations}`],
        [`Active Red-Zone Hotspots`, `${kpi.active_red_zones}`],
        [`Predictive Crime Risk Index`, `${kpi.predictive_risk_index}% (HIGH)`],
      ];

      let y = 54;
      metrics.forEach(([label, val]) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(203, 213, 225);
        doc.text(label, 14, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(234, 179, 8);
        doc.text(val, 140, y);
        y += 8;
      });

      doc.save(`KSP_SCRB_Executive_Brief_${Date.now()}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setShowBroadcastModal(false);
    }, 2000);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0b0f19]/90 backdrop-blur-md border-b border-yellow-500/20 px-4 lg:px-8 py-3.5 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand & Live Badge */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1e293b] border border-yellow-500/40 rounded-xl glow-gold text-yellow-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  KaavalAI <span className="text-yellow-400 font-mono text-xs px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/30">KSP v2.4</span>
                </h1>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE COMMAND
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Karnataka State Police — SCRB Intelligence & Predictive Analytics Platform
              </p>
            </div>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Live Clock */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
              <span>{time}</span>
            </div>

            {/* Officer Role Selector */}
            <div className="flex items-center gap-2 bg-slate-900 border border-yellow-500/30 rounded-lg px-2 py-1">
              <UserCheck className="w-3.5 h-3.5 text-yellow-400" />
              <select
                value={selectedRole}
                onChange={handleRoleSelect}
                className="bg-transparent text-xs font-semibold text-slate-200 outline-none cursor-pointer pr-1"
              >
                <option value="SCRB Director" className="bg-slate-900 text-white">SCRB Director</option>
                <option value="DGP Karnataka" className="bg-slate-900 text-white">DGP Karnataka</option>
                <option value="SP Bengaluru City" className="bg-slate-900 text-white">SP Bengaluru City</option>
                <option value="Inspector General (STF)" className="bg-slate-900 text-white">Inspector General (STF)</option>
              </select>
            </div>

            {/* Emergency Alert Dispatch Trigger Button */}
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/90 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition shadow-lg glow-red pulse-badge"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Broadcast Alert</span>
            </button>

            {/* Export Dossier PDF */}
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-lg text-xs transition shadow-md glow-gold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{exporting ? 'Generating...' : 'Export Dossier'}</span>
            </button>

            {/* Catalyst Backend Info Drawer trigger */}
            <button
              onClick={onOpenCatalyst}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition"
            >
              <Cpu className="w-3.5 h-3.5 text-yellow-400" />
              <span>Catalyst Cloud</span>
            </button>

          </div>
        </div>
      </header>

      {/* Emergency Broadcast Alert Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111827] border border-red-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl glow-red">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2.5 text-red-400">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
                <h3 className="text-lg font-extrabold tracking-wide text-white">EMERGENCY POLICE BROADCAST</h3>
              </div>
              <button 
                onClick={() => setShowBroadcastModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm px-2"
              >
                ✕
              </button>
            </div>

            {broadcastSent ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-lg font-bold text-white">ALERT DISPATCHED SUCCESSFULLY</h4>
                <p className="text-xs text-slate-400">
                  Signal broadcasted to 18 patrol vehicles & Control Room via Catalyst Wireless Signal.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Police Station / Zone</label>
                  <input
                    type="text"
                    value={broadcastTarget}
                    onChange={(e) => setBroadcastTarget(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-red-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Alert Message (High Priority)</label>
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-red-500 outline-none"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition shadow-lg glow-red flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Red-Zone Alert</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
