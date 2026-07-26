'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Clock, UserCheck, Download, Radio, Send,
  CheckCircle2, Shield, AlertTriangle, Bell
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
  const [time, setTime] = useState('');
  const [exporting, setExporting] = useState(false);
  const [selectedRole, setSelectedRole] = useState(activeRole);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [broadcastTarget, setBroadcastTarget] = useState('Bengaluru City — Subhedar Chatra PS');
  const [broadcastMessage, setBroadcastMessage] = useState('RED ZONE ALERT: High risk robbery pattern detected. Deploy 2 addl beat patrols immediately.');
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST');
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      doc.setFillColor(139, 26, 26);
      doc.rect(0, 0, 210, 38, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('KARNATAKA STATE POLICE — SCRB', 14, 16);
      doc.setFontSize(11);
      doc.text('KaavalAI Intelligence Platform — Executive Crime Brief', 14, 24);
      doc.setFontSize(9);
      doc.setTextColor(220, 180, 130);
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')} | Logged in as: ${selectedRole}`, 14, 32);

      doc.setTextColor(28, 10, 0);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('EXECUTIVE CRIME METRICS', 14, 52);

      doc.setDrawColor(200, 150, 12);
      doc.setLineWidth(0.6);
      doc.line(14, 55, 196, 55);

      const metrics = [
        ['Total Registered FIRs', `${kpi.total_firs.toLocaleString()}`],
        ['Heinous Offences Recorded', `${kpi.heinous_crimes}`],
        ['Active Accused Profiles', `${kpi.total_accused.toLocaleString()}`],
        ['Jurisdictional Police Stations', `${kpi.total_stations}`],
        ['Active Red-Zone Hotspots', `${kpi.active_red_zones}`],
        ['Predictive Risk Index (XGBoost)', `${kpi.predictive_risk_index}%`],
      ];

      let y = 65;
      metrics.forEach(([label, val]) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(92, 61, 46);
        doc.text(label, 14, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(139, 26, 26);
        doc.text(val, 155, y);
        y += 10;
      });

      doc.save(`KSP_SCRB_Executive_Brief_${Date.now()}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setShowBroadcast(false);
    }, 2200);
  };

  return (
    <>
      {/* KSP Maroon Command Header */}
      <header style={{
        background: 'linear-gradient(135deg, #8B1A1A 0%, #A52020 60%, #8B1A1A 100%)',
        borderBottom: '3px solid #C8960C',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: '64px',
        gap: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 4px 20px rgba(139,26,26,0.3)',
      }}>

        {/* Left — KSP Brand + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px', height: '40px',
            borderRadius: '50%',
            background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 3px rgba(200,150,12,0.5)',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            <Image src="/ksp-logo.jpg" alt="KSP" width={36} height={36} style={{ objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>
                KaavalAI
              </h1>
              <span style={{
                fontSize: '10px', fontWeight: 700, padding: '2px 8px',
                borderRadius: '20px', background: 'rgba(200,150,12,0.25)',
                border: '1px solid rgba(200,150,12,0.5)', color: '#F7E8B0',
                letterSpacing: '0.05em',
              }}>
                SCRB v2.4
              </span>
              <span style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                fontSize: '10px', fontWeight: 700,
                color: '#6EE7B7', background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.3)',
                padding: '2px 8px', borderRadius: '20px',
              }}>
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#34D399', display: 'inline-block',
                  boxShadow: '0 0 6px rgba(52,211,153,0.7)',
                }} />
                LIVE
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', margin: 0, fontWeight: 500 }}>
              Karnataka State Police · Predictive Intelligence Command Suite
            </p>
          </div>
        </div>

        {/* Right — Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>

          {/* IST Clock */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
            fontSize: '12px', fontFamily: "'DM Mono', monospace", color: '#F7E8B0',
          }}>
            <Clock size={13} style={{ opacity: 0.8 }} />
            {time}
          </div>

          {/* Role Selector */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(200,150,12,0.4)',
            borderRadius: '8px', padding: '5px 10px',
          }}>
            <UserCheck size={13} style={{ color: '#F7E8B0', opacity: 0.85 }} />
            <select
              value={selectedRole}
              onChange={e => {
                setSelectedRole(e.target.value);
                onRoleChange?.(e.target.value);
              }}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: '12px', fontWeight: 700, color: '#fff', cursor: 'pointer',
              }}
            >
              <option value="SCRB Director" style={{ background: '#8B1A1A', color: '#fff' }}>SCRB Director</option>
              <option value="DGP Karnataka" style={{ background: '#8B1A1A', color: '#fff' }}>DGP Karnataka</option>
              <option value="SP Bengaluru City" style={{ background: '#8B1A1A', color: '#fff' }}>SP Bengaluru City</option>
              <option value="IG (STF)" style={{ background: '#8B1A1A', color: '#fff' }}>IG (STF)</option>
            </select>
          </div>

          {/* Emergency Alert */}
          <button
            onClick={() => setShowBroadcast(true)}
            className="pulse-badge"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px',
              background: '#DC2626', color: '#fff',
              border: '1.5px solid #EF4444',
              borderRadius: '8px', fontSize: '12px', fontWeight: 800,
              cursor: 'pointer', letterSpacing: '0.02em',
              boxShadow: '0 0 16px rgba(220,38,38,0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            <Radio size={13} />
            Alert Dispatch
          </button>

          {/* Export PDF */}
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px',
              background: '#C8960C', color: '#1C0A00',
              border: 'none',
              borderRadius: '8px', fontSize: '12px', fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 12px rgba(200,150,12,0.35)',
              transition: 'all 0.2s ease',
              opacity: exporting ? 0.75 : 1,
            }}
          >
            <Download size={13} />
            {exporting ? 'Generating...' : 'Export Brief'}
          </button>

          {/* Catalyst Drawer */}
          <button
            onClick={onOpenCatalyst}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 12px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px', fontSize: '12px', fontWeight: 600,
              color: '#fff', cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Shield size={13} style={{ color: '#F7E8B0' }} />
            Catalyst Cloud
          </button>

        </div>
      </header>

      {/* Alert Ticker Bar */}
      {showAlert && (
        <div style={{
          background: '#FEF3C7',
          borderBottom: '1px solid #FDE68A',
          padding: '7px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          fontWeight: 600,
          color: '#92400E',
          gap: '10px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <AlertTriangle size={14} style={{ color: '#D97706', flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              🔴 <strong>RED ZONE ALERT:</strong> Bengaluru City (Risk: 88/100) · Kalaburagi (Risk: 85/100) · Mangaluru (Risk: 82/100) — Enhanced patrol deployment recommended
            </span>
          </div>
          <button onClick={() => setShowAlert(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#B45309', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>✕</button>
        </div>
      )}

      {/* Emergency Broadcast Modal */}
      {showBroadcast && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(28,10,0,0.55)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            background: '#fff',
            border: '2px solid #DC2626',
            borderRadius: '16px',
            padding: '28px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 24px 60px rgba(220,38,38,0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #FEE2E2', paddingBottom: '14px', marginBottom: '18px' }}>
              <div style={{ width: '36px', height: '36px', background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={18} style={{ color: '#DC2626' }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1C0A00' }}>Emergency Police Broadcast</h3>
                <p style={{ margin: 0, fontSize: '11px', color: '#9B7560' }}>Karnataka State Police — Secure Alert Dispatch</p>
              </div>
              <button onClick={() => setShowBroadcast(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#9B7560', fontSize: '18px', lineHeight: 1 }}>✕</button>
            </div>

            {broadcastSent ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <CheckCircle2 size={48} style={{ color: '#10B981', margin: '0 auto 12px' }} />
                <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 800, color: '#065F46' }}>Alert Dispatched!</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>Signal broadcast to 18 patrol vehicles via KSP Secure Command Radio.</p>
              </div>
            ) : (
              <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5C3D2E', marginBottom: '5px' }}>Target Station / Zone</label>
                  <input
                    type="text" value={broadcastTarget} onChange={e => setBroadcastTarget(e.target.value)} required
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E8D4BA', borderRadius: '8px', fontSize: '13px', color: '#1C0A00', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#5C3D2E', marginBottom: '5px' }}>Alert Message (High Priority)</label>
                  <textarea
                    value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)} required rows={3}
                    style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E8D4BA', borderRadius: '8px', fontSize: '13px', color: '#1C0A00', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', paddingTop: '6px' }}>
                  <button type="button" onClick={() => setShowBroadcast(false)} style={{ flex: 1, padding: '10px', background: '#F2E8D9', border: '1px solid #E8D4BA', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#5C3D2E', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: '10px', background: '#DC2626', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 800, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: '0 4px 14px rgba(220,38,38,0.35)' }}>
                    <Send size={14} />Dispatch Alert
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
