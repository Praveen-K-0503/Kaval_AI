'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  FileText, 
  ChevronRight, 
  AlertTriangle, 
  Shield, 
  MapPin, 
  Calendar, 
  User, 
  Sparkles,
  Download,
  X
} from 'lucide-react';
import { RECENT_FIRS, FIRRecord } from '@/lib/kspMockData';

export default function FIRRegistryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGravity, setSelectedGravity] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedFir, setSelectedFir] = useState<FIRRecord | null>(null);
  const [moMatching, setMoMatching] = useState(false);

  const filteredFirs = RECENT_FIRS.filter(fir => {
    if (selectedGravity !== 'ALL' && fir.gravity !== selectedGravity) return false;
    if (selectedDistrict !== 'ALL' && fir.district !== selectedDistrict) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        fir.firNumber.toLowerCase().includes(q) ||
        fir.district.toLowerCase().includes(q) ||
        fir.crimeCategory.toLowerCase().includes(q) ||
        fir.accusedNames.some(a => a.toLowerCase().includes(q)) ||
        fir.moDescription.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSimulateMoSearch = () => {
    setMoMatching(true);
    setTimeout(() => {
      setMoMatching(false);
      if (filteredFirs.length > 0) setSelectedFir(filteredFirs[0]);
    }, 800);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FBF6EE', color: '#1C0A00', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header Bar */}
      <header style={{ background: 'linear-gradient(135deg, #8B1A1A 0%, #A52020 100%)', borderBottom: '3px solid #C8960C', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '60px', boxShadow: '0 4px 16px rgba(139,26,26,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href="/" style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} style={{ opacity: 0.9 }} /> FIR Intelligence Vault & MO Similarity Search
            </h1>
            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
              Karnataka State Police SCRB — 24-Table Case Master Registry · NLP-Powered MO Analysis
            </p>
          </div>
        </div>

        <button
          onClick={handleSimulateMoSearch}
          disabled={moMatching}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 16px', background: '#C8960C', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 800, color: '#1C0A00', cursor: 'pointer', boxShadow: '0 2px 12px rgba(200,150,12,0.4)', transition: 'all 0.2s ease', opacity: moMatching ? 0.75 : 1 }}
        >
          <Sparkles size={14} />
          {moMatching ? 'Analyzing MO Cosine Vectors...' : 'Run MO Similarity Match'}
        </button>
      </header>

      {/* Main Grid Content */}
      <div style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
        
        {/* Search & Filter Bar */}
        <div className="ksp-panel" style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '14px', alignItems: 'end' }}>
          
          {/* Keyword Search */}
          <div style={{ position: 'relative', gridColumn: '1 / 2' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9B7560' }} />
            <input
              type="text"
              placeholder="Search FIR number, accused name, crime section, or MO description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '32px', paddingRight: '10px', paddingTop: '9px', paddingBottom: '9px', border: '1.5px solid #E8D4BA', borderRadius: '8px', fontSize: '12px', color: '#1C0A00', background: '#FFF8EF', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e => (e.target.style.borderColor = '#8B1A1A')}
              onBlur={e => (e.target.style.borderColor = '#E8D4BA')}
            />
          </div>

          {/* Gravity Filter */}
          <div>
            <select
              value={selectedGravity}
              onChange={(e) => setSelectedGravity(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E8D4BA', borderRadius: '8px', fontSize: '12px', color: '#1C0A00', background: '#FFF8EF', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600 }}
            >
              <option value="ALL">All Gravity Levels</option>
              <option value="HEINOUS">🔴 Heinous Crimes</option>
              <option value="MAJOR">🟡 Major Crimes</option>
              <option value="MINOR">🟢 Minor Crimes</option>
            </select>
          </div>

          {/* District Filter */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E8D4BA', borderRadius: '8px', fontSize: '12px', color: '#1C0A00', background: '#FFF8EF', outline: 'none', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600 }}
            >
              <option value="ALL">All 31 Districts</option>
              <option value="Bengaluru City">Bengaluru City</option>
              <option value="Kalaburagi">Kalaburagi</option>
              <option value="Mangaluru City (DK)">Mangaluru City (DK)</option>
              <option value="Mysuru City">Mysuru City</option>
            </select>
          </div>

        </div>

        {/* FIR Cards Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#9B7560', fontFamily: "'DM Mono', monospace", padding: '0 2px' }}>
            <span>Showing <strong style={{ color: '#8B1A1A' }}>{filteredFirs.length}</strong> Recorded Case Files</span>
            <span>Sorted by Incident Date (Latest)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredFirs.map((fir, i) => (
              <div
                key={fir.id}
                onClick={() => setSelectedFir(fir)}
                className="animate-slide-up"
                style={{
                  animationDelay: `${i * 50}ms`, opacity: 0, animationFillMode: 'forwards',
                  background: '#fff', border: '1.5px solid #E8D4BA',
                  borderRadius: '12px', padding: '18px 20px',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  borderLeft: `4px solid ${fir.gravity === 'HEINOUS' ? '#8B1A1A' : fir.gravity === 'MAJOR' ? '#C8960C' : '#2D5016'}`,
                  boxShadow: '0 2px 8px rgba(139,26,26,0.05)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C8960C'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(200,150,12,0.12)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E8D4BA'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(139,26,26,0.05)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #F2E8D9', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', fontFamily: "'DM Mono', monospace", fontWeight: 800, color: '#C8960C', background: '#FEF9EC', border: '1px solid #FDE68A', padding: '4px 10px', borderRadius: '6px' }}>
                      {fir.firNumber}
                    </span>
                    <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1C0A00', margin: 0 }}>{fir.crimeCategory}</h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
                      background: fir.gravity === 'HEINOUS' ? '#FEE2E2' : fir.gravity === 'MAJOR' ? '#FEF3C7' : '#D1FAE5',
                      color: fir.gravity === 'HEINOUS' ? '#991B1B' : fir.gravity === 'MAJOR' ? '#92400E' : '#065F46',
                      border: `1px solid ${fir.gravity === 'HEINOUS' ? '#FECACA' : fir.gravity === 'MAJOR' ? '#FDE68A' : '#A7F3D0'}`,
                    }}>
                      {fir.gravity}
                    </span>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: '#F2E8D9', color: '#6B4226', border: '1px solid #E8D4BA' }}>
                      {fir.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '12px', marginBottom: '12px' }}>
                  <div>
                    <span style={{ color: '#9B7560', display: 'block', marginBottom: '2px' }}>Jurisdiction & PS:</span>
                    <span style={{ color: '#1C0A00', fontWeight: 600 }}>{fir.district} — {fir.policeStation}</span>
                  </div>

                  <div>
                    <span style={{ color: '#9B7560', display: 'block', marginBottom: '4px' }}>Applicable Legal Acts:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {fir.ipcSections.map(sec => (
                        <span key={sec} style={{ background: '#F2E8D9', border: '1px solid #E8D4BA', color: '#5C3D2E', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontFamily: "'DM Mono', monospace" }}>
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: '#9B7560', display: 'block', marginBottom: '2px' }}>Primary Accused:</span>
                    <span style={{ color: '#8B1A1A', fontWeight: 700 }}>{fir.accusedNames.join(', ')}</span>
                  </div>
                </div>

                <div style={{ background: '#FBF6EE', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E8D4BA', fontSize: '12px', color: '#5C3D2E', fontFamily: "'DM Mono', monospace", lineHeight: 1.5 }}>
                  <strong style={{ color: '#C8960C' }}>Modus Operandi:</strong> {fir.moDescription}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Case Dossier Detail Modal */}
      {selectedFir && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(28,10,0,0.45)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ background: '#fff', border: '2px solid #C8960C', borderRadius: '16px', padding: '28px', maxWidth: '700px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(139,26,26,0.25)' }}>

            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F2E8D9', paddingBottom: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', background: '#FEF3C7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C8960C' }}>
                  <Shield size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#1C0A00' }}>CASE MASTER DOSSIER — {selectedFir.firNumber}</h3>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9B7560' }}>Karnataka State Police SCRB · 24-Table Case Master Schema</p>
                </div>
              </div>
              <button onClick={() => setSelectedFir(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9B7560', fontSize: '20px', lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '12px' }}>

              {/* ── CASE MASTER CORE ── */}
              <div style={{ background: '#FBF6EE', padding: '16px', borderRadius: '12px', border: '1px solid #E8D4BA' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#8B1A1A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>📋 CaseMaster Table Fields</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <p style={{ margin: 0 }}><span style={{ color: '#9B7560' }}>CrimeNo: </span><strong style={{ color: '#1C0A00', fontFamily: "'DM Mono',monospace" }}>{selectedFir.firNumber}</strong></p>
                  <p style={{ margin: 0 }}><span style={{ color: '#9B7560' }}>PoliceStation: </span><strong style={{ color: '#1C0A00' }}>{selectedFir.policeStation}</strong></p>
                  <p style={{ margin: 0 }}><span style={{ color: '#9B7560' }}>District: </span><strong style={{ color: '#1C0A00' }}>{selectedFir.district}</strong></p>
                  <p style={{ margin: 0 }}><span style={{ color: '#9B7560' }}>IncidentFromDate: </span><strong style={{ color: '#1C0A00', fontFamily: "'DM Mono',monospace" }}>{new Date(selectedFir.incidentDate).toLocaleString('en-IN')}</strong></p>
                  <p style={{ margin: 0 }}><span style={{ color: '#9B7560' }}>GravityOffence: </span>
                    <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, background: selectedFir.gravity === 'HEINOUS' ? '#FEE2E2' : selectedFir.gravity === 'MAJOR' ? '#FEF3C7' : '#D1FAE5', color: selectedFir.gravity === 'HEINOUS' ? '#991B1B' : selectedFir.gravity === 'MAJOR' ? '#92400E' : '#065F46' }}>{selectedFir.gravity}</span>
                  </p>
                  <p style={{ margin: 0 }}><span style={{ color: '#9B7560' }}>CaseStatus: </span><strong style={{ color: '#C8960C' }}>{selectedFir.status.replace(/_/g, ' ')}</strong></p>
                  <p style={{ margin: 0 }}><span style={{ color: '#9B7560' }}>GPS Coordinates: </span><strong style={{ color: '#1C0A00', fontFamily: "'DM Mono',monospace" }}>{selectedFir.lat.toFixed(4)}, {selectedFir.lng.toFixed(4)}</strong></p>
                  <p style={{ margin: 0 }}><span style={{ color: '#9B7560' }}>RiskIndex: </span><strong style={{ color: selectedFir.riskIndex >= 80 ? '#DC2626' : '#C8960C', fontFamily: "'DM Mono',monospace" }}>{selectedFir.riskIndex} / 100</strong></p>
                </div>
              </div>

              {/* ── ACT / SECTION ── */}
              <div style={{ background: '#FFF8EF', padding: '14px', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>⚖️ ActSectionAssociation → Act + Section Tables</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', color: '#9B7560', fontWeight: 700, marginRight: '4px' }}>IPC Sections:</span>
                  {selectedFir.ipcSections.map(sec => (
                    <span key={sec} style={{ background: '#F2E8D9', border: '1px solid #C8960C', color: '#5C3D2E', padding: '3px 8px', borderRadius: '5px', fontSize: '11px', fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{sec}</span>
                  ))}
                </div>
                {selectedFir.bnsSections?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: '#9B7560', fontWeight: 700, marginRight: '4px' }}>BNS Sections:</span>
                    {selectedFir.bnsSections.map(sec => (
                      <span key={sec} style={{ background: '#EDE9FE', border: '1px solid #7C3AED', color: '#4C1D95', padding: '3px 8px', borderRadius: '5px', fontSize: '11px', fontFamily: "'DM Mono',monospace", fontWeight: 700 }}>{sec}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* ── COMPLAINANT PROFILE ── */}
              <div style={{ background: '#F0FDF4', padding: '14px', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>👤 ComplainantDetails + OccupationMaster + ReligionMaster + CasteMaster</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  {[
                    { label: 'Complainant Name', val: selectedFir.victimName.split(' ')[0] + ' (Complainant)' },
                    { label: 'OccupationMaster', val: ['Farmer', 'Daily Labour', 'Business', 'Govt Service', 'Student'][Math.abs(selectedFir.riskIndex) % 5] },
                    { label: 'ReligionMaster', val: ['Hindu', 'Muslim', 'Christian', 'Other'][Math.abs(selectedFir.riskIndex) % 4] },
                    { label: 'CasteMaster', val: ['General', 'OBC', 'SC', 'ST'][Math.abs(selectedFir.riskIndex) % 4] },
                    { label: 'AgeYear', val: `${28 + (selectedFir.riskIndex % 35)} years` },
                    { label: 'GenderID', val: selectedFir.riskIndex % 3 === 0 ? 'Female' : 'Male' },
                  ].map((item, i) => (
                    <div key={i} style={{ background: '#fff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #A7F3D0' }}>
                      <div style={{ fontSize: '9px', color: '#9B7560', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>{item.label}</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#1C0A00' }}>{item.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── VICTIM + ACCUSED ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#FEF2F2', padding: '14px', borderRadius: '10px', border: '1px solid #FECACA' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#991B1B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>🎯 Victim Table</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div><span style={{ color: '#9B7560' }}>VictimName: </span><strong style={{ color: '#8B1A1A' }}>{selectedFir.victimName}</strong></div>
                    <div><span style={{ color: '#9B7560' }}>AgeYear: </span><strong>{20 + (selectedFir.riskIndex % 40)}</strong></div>
                    <div><span style={{ color: '#9B7560' }}>GenderID: </span><strong>{selectedFir.riskIndex % 2 === 0 ? 'Female (F)' : 'Male (M)'}</strong></div>
                    <div><span style={{ color: '#9B7560' }}>VictimPolice: </span><strong style={{ color: selectedFir.riskIndex > 85 ? '#DC2626' : '#16A34A' }}>{selectedFir.riskIndex > 85 ? 'Yes (1)' : 'No (0)'}</strong></div>
                  </div>
                </div>
                <div style={{ background: '#FEF9EC', padding: '14px', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>🚨 Accused Table (PersonID)</div>
                  {selectedFir.accusedNames.map((name, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ background: '#8B1A1A', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 800, fontFamily: "'DM Mono',monospace", flexShrink: 0 }}>A{i + 1}</span>
                      <span style={{ fontWeight: 700, color: '#1C0A00', fontSize: '11px' }}>{name}</span>
                      <span style={{ fontSize: '10px', color: '#9B7560', fontFamily: "'DM Mono',monospace" }}>Age: {28 + (i * 7) + (selectedFir.riskIndex % 15)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── ARREST / CHARGESHEET TIMELINE ── */}
              <div style={{ background: '#fff', padding: '14px', borderRadius: '10px', border: '1px solid #E8D4BA' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, color: '#8B1A1A', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>📅 ArrestSurrender + ChargesheetDetails — Case Timeline</div>
                <div style={{ position: 'relative', paddingLeft: '24px' }}>
                  <div style={{ position: 'absolute', left: '7px', top: 0, bottom: 0, width: '2px', background: '#F2E8D9' }} />
                  {[
                    { date: selectedFir.incidentDate, event: 'Incident Occurred', detail: `${selectedFir.crimeCategory} at ${selectedFir.policeStation} jurisdiction`, color: '#8B1A1A', dot: '#DC2626' },
                    { date: selectedFir.registeredDate, event: 'FIR Registered', detail: `CrimeNo: ${selectedFir.firNumber} · GravityOffence: ${selectedFir.gravity}`, color: '#C8960C', dot: '#F59E0B' },
                    { date: new Date(new Date(selectedFir.registeredDate).getTime() + 3 * 86400000).toISOString(), event: 'Arrest / Surrender', detail: `AccusedMasterID: A1 · ${selectedFir.accusedNames[0]} · ArrestSurrenderType: Arrest`, color: '#2D5016', dot: '#16A34A' },
                    ...(selectedFir.status === 'CHARGE_SHEETED' ? [{
                      date: new Date(new Date(selectedFir.registeredDate).getTime() + 30 * 86400000).toISOString(),
                      event: 'Chargesheet Filed', detail: `ChargesheetDetails.cstype = A · IO: ${selectedFir.policeStation} SHO`, color: '#4B6CB7', dot: '#6366F1'
                    }] : []),
                    ...(selectedFir.status === 'CLOSED' ? [{
                      date: new Date(new Date(selectedFir.registeredDate).getTime() + 60 * 86400000).toISOString(),
                      event: 'Case Disposed / Closed', detail: 'Final Report submitted · CaseStatus: CLOSED', color: '#9B7560', dot: '#9CA3AF'
                    }] : []),
                  ].map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px', position: 'relative' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: step.dot, border: '2px solid #fff', outline: `2px solid ${step.dot}`, flexShrink: 0, marginTop: '2px', position: 'absolute', left: '-19px' }} />
                      <div style={{ background: '#FBF6EE', padding: '8px 12px', borderRadius: '8px', border: `1px solid ${step.color}30`, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: step.color }}>{step.event}</span>
                          <span style={{ fontSize: '10px', fontFamily: "'DM Mono',monospace", color: '#9B7560' }}>{new Date(step.date).toLocaleDateString('en-IN')}</span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#5C3D2E' }}>{step.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── MO DESCRIPTION ── */}
              <div>
                <h4 style={{ fontWeight: 700, color: '#1C0A00', marginBottom: '8px', fontSize: '12px' }}>Modus Operandi (BriefFacts / MO Text):</h4>
                <div style={{ background: '#FFF8EF', padding: '12px 14px', borderRadius: '10px', border: '1px solid #FDE68A', color: '#92400E', fontFamily: "'DM Mono',monospace", lineHeight: 1.7, fontSize: '11px' }}>
                  {selectedFir.moDescription}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', marginTop: '14px', borderTop: '1px solid #F2E8D9' }}>
              <span style={{ fontSize: '11px', color: '#9B7560', fontFamily: "'DM Mono',monospace" }}>Risk Index: <strong style={{ color: '#8B1A1A', fontSize: '14px' }}>{selectedFir.riskIndex} / 100</strong></span>
              <button
                onClick={() => { alert(`Exporting Case Brief for ${selectedFir.firNumber}...`); setSelectedFir(null); }}
                style={{ padding: '10px 18px', background: '#C8960C', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 800, color: '#1C0A00', cursor: 'pointer', boxShadow: '0 3px 12px rgba(200,150,12,0.35)', display: 'flex', alignItems: 'center', gap: '7px' }}
              >
                <Download size={14} /> Download Smart Case Brief (PDF)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
