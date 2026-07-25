'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  AlertTriangle, 
  FileText, 
  Clock, 
  Download, 
  Cpu,
  Activity,
  UserCheck,
  Award
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

export default function CommandHeader({ kpi, onOpenCatalyst, activeRole = 'SCRB Chief', onRoleChange }: KPIProps) {
  const [time, setTime] = useState<string>('');
  const [exporting, setExporting] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<string>(activeRole);

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
      const res = await fetch('http://localhost:8000/api/reports/pdf/1');
      if (res.ok) {
        const data = await res.json();
        if (data.pdf_base64) {
          const blob = new Blob([atob(data.pdf_base64)], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = data.pdf_filename || 'KSP_SmartBrowz_Case_Brief.txt';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setExporting(false);
          return;
        }
      }

      // Fallback PDF export
      const doc = new jsPDF('p', 'mm', 'a4');
      doc.setFillColor(248, 250, 252);
      doc.rect(0, 0, 210, 297, 'F');

      doc.setTextColor(29, 78, 216);
      doc.setFontSize(18);
      doc.text('KARNATAKA STATE POLICE (KSP)', 15, 20);
      
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.text('State Crime Records Bureau (SCRB) - Executive Briefing', 15, 28);
      
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(`Generated: ${new Date().toLocaleString()} | Role: ${selectedRole}`, 15, 36);

      doc.setDrawColor(29, 78, 216);
      doc.line(15, 40, 195, 40);

      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(`Total FIR Records Logged: ${kpi.total_firs}`, 15, 52);
      doc.text(`Heinous Offences Tracked: ${kpi.heinous_crimes}`, 15, 60);
      doc.text(`Accused Profiles Registered: ${kpi.total_accused}`, 15, 68);
      doc.text(`Police Stations Connected: ${kpi.total_stations}`, 15, 76);
      doc.text(`Active Emergency Red Zones: ${kpi.active_red_zones}`, 15, 84);
      doc.text(`Predictive Risk Score Index: ${kpi.predictive_risk_index}/100`, 15, 92);

      doc.line(15, 100, 195, 100);

      doc.setFontSize(10);
      doc.setTextColor(29, 78, 216);
      doc.text('KaavalAI Executive Intelligence — Deployed on Zoho Catalyst AppSail (SmartBrowz PDF Engine)', 15, 110);

      doc.save(`KSP_SCRB_Executive_Report_${Date.now()}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 shadow-sm">
      {/* Top Navbar Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-700 border border-blue-800 flex items-center justify-center shadow-sm">
            <Award className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">KAAVAL AI</h1>
              <span className="px-2.5 py-0.5 text-[11px] font-bold tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded uppercase">
                KSP SCRB Intelligence Hub
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Karnataka State Police • 31 Districts & 1,100+ Police Stations</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Role Switcher */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg shadow-sm">
            <UserCheck className="w-4 h-4 text-blue-700" />
            <select 
              value={selectedRole}
              onChange={handleRoleSelect}
              className="bg-transparent text-slate-800 text-xs outline-none cursor-pointer font-semibold"
            >
              <option value="SCRB Chief">Role: SCRB Chief Command</option>
              <option value="Station House Officer">Role: Station House Officer (SHO)</option>
              <option value="Investigative Analyst">Role: Crime Analyst</option>
            </select>
          </div>

          {/* Catalyst Service Status Badge */}
          <button
            onClick={onOpenCatalyst}
            className="flex items-center space-x-2 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg transition-all"
          >
            <Cpu className="w-4 h-4 text-emerald-700" />
            <span>Zoho Catalyst: 20 Services Active</span>
          </button>

          {/* Clock Badge */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono rounded-lg">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{time || '15:30:00 IST'}</span>
          </div>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center space-x-2 px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Generating PDF...' : 'Export Case Brief'}</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
        <div className="executive-light-card p-3 flex items-center space-x-3">
          <div className="p-2.5 bg-blue-100 rounded-lg text-blue-700">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Active FIRs</div>
            <div className="text-lg font-bold text-slate-900 tracking-tight">{kpi.total_firs.toLocaleString()}</div>
          </div>
        </div>

        <div className="executive-light-card p-3 flex items-center space-x-3">
          <div className="p-2.5 bg-rose-100 rounded-lg text-rose-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Heinous Offences</div>
            <div className="text-lg font-bold text-slate-900 tracking-tight">{kpi.heinous_crimes.toLocaleString()}</div>
          </div>
        </div>

        <div className="executive-light-card p-3 flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-100 rounded-lg text-indigo-700">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Accused Profiles</div>
            <div className="text-lg font-bold text-slate-900 tracking-tight">{kpi.total_accused.toLocaleString()}</div>
          </div>
        </div>

        <div className="executive-light-card p-3 flex items-center space-x-3">
          <div className="p-2.5 bg-amber-100 rounded-lg text-amber-700">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Police Stations</div>
            <div className="text-lg font-bold text-slate-900 tracking-tight">{kpi.total_stations}</div>
          </div>
        </div>

        <div className="executive-light-card p-3 flex items-center space-x-3 border-rose-300 bg-rose-50">
          <div className="p-2.5 bg-rose-200 rounded-lg text-rose-800">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-600 font-medium">Active Red Zones</div>
            <div className="text-lg font-bold text-rose-700 tracking-tight">{kpi.active_red_zones} Districts</div>
          </div>
        </div>

        <div className="executive-light-card p-3 flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-100 rounded-lg text-emerald-700">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Predictive Risk Index</div>
            <div className="text-lg font-bold text-emerald-700 tracking-tight">{kpi.predictive_risk_index}/100</div>
          </div>
        </div>
      </div>
    </header>
  );
}
