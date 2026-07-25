'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, FileText, User, MapPin, Calendar, Shield,
  Scale, Gavel, BookOpen, Users, AlertTriangle, CheckCircle,
  Printer, Download, ChevronRight
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FIRDetail {
  CaseMasterID: number;
  CrimeNo: string;
  CaseNo: string;
  CrimeRegisteredDate: string;
  IncidentFromDate: string;
  IncidentToDate: string;
  BriefFacts: string;
  latitude: number;
  longitude: number;
  DistrictName: string;
  PoliceStation: string;
  Gravity: string;
  GravityID: number;
  CrimeHead: string;
  SubHead: string;
  Category: string;
  CaseStatus: string;
  RegisteringOfficer: string;
  OfficerRank: string;
  CourtName?: string;
  accused_list: Array<{
    AccusedMasterID: number;
    AccusedName: string;
    AgeYear: number;
    GenderID: string;
    PersonID: string;
  }>;
  victims: Array<{
    VictimMasterID: number;
    VictimName: string;
    AgeYear: number;
    GenderID: string;
    VictimPolice: string;
  }>;
  complainant?: {
    ComplainantName: string;
    AgeYear: number;
    OccupationID: number;
  };
  acts_sections: Array<{
    ActCode: string;
    SectionCode: string;
    ActDescription?: string;
    SectionDescription?: string;
  }>;
  chargesheet?: {
    CSID: number;
    csdate: string;
    cstype: string;
  };
  arrests: Array<{
    ArrestSurrenderID: number;
    ArrestSurrenderDate: string;
    ArrestSurrenderTypeID: number;
  }>;
}

const Tag = ({ label, color = '#1d4ed8', bg = '#eff6ff', border = '#bfdbfe' }: any) => (
  <span style={{
    background: bg, color, border: `1px solid ${border}`,
    fontSize: '10px', fontWeight: 700, padding: '2px 10px',
    borderRadius: '20px', whiteSpace: 'nowrap',
  }}>{label}</span>
);

const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <div style={{
    background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
    overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
      background: '#f8fafc',
    }}>
      {icon}
      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{title}</span>
    </div>
    <div style={{ padding: '16px' }}>{children}</div>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value?: string | number }) => (
  <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
    <div style={{ minWidth: '160px', fontSize: '11px', color: '#94a3b8', fontWeight: 600, paddingTop: '1px' }}>{label}</div>
    <div style={{ fontSize: '12px', color: '#0f172a', fontWeight: 500, flex: 1 }}>{value || '—'}</div>
  </div>
);

export default function FIRDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [fir, setFir] = useState<FIRDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/api/firs/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('FIR not found');
        return r.json();
      })
      .then(d => { setFir(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [id]);

  const formatDate = (d?: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const gravityColors = fir?.Gravity === 'Heinous'
    ? { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' }
    : { color: '#d97706', bg: '#fffbeb', border: '#fde68a' };

  const statusColors = (() => {
    const s = fir?.CaseStatus?.toLowerCase() || '';
    if (s.includes('charge')) return { color: '#1d4ed8', bg: '#eff6ff' };
    if (s.includes('closed')) return { color: '#059669', bg: '#f0fdf4' };
    if (s.includes('trial')) return { color: '#7c3aed', bg: '#fdf4ff' };
    if (s.includes('pending')) return { color: '#d97706', bg: '#fffbeb' };
    return { color: '#64748b', bg: '#f8fafc' };
  })();

  return (
    <div style={{
      minHeight: '100vh', background: '#f1f5f9',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>

      {/* Nav */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px', height: '60px' }}>
          <Link href="/firs" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px' }}>
            <ArrowLeft size={16} /> FIR Registry
          </Link>
          <ChevronRight size={14} color="#94a3b8" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
            {fir?.CrimeNo || `FIR #${id}`}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            {fir && (
              <>
                <Tag label={fir.Gravity} color={gravityColors.color} bg={gravityColors.bg} border={gravityColors.border} />
                <Tag label={fir.CaseStatus} color={statusColors.color} bg={statusColors.bg} />
              </>
            )}
            <button onClick={() => window.print()} style={{
              padding: '6px 12px', background: '#f8fafc', color: '#64748b',
              border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer',
              fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <Printer size={13} /> Print
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
            <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#1d4ed8', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <div>Loading FIR details...</div>
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#dc2626' }}>
            <AlertTriangle size={24} style={{ marginBottom: '8px' }} />
            <div style={{ fontWeight: 600 }}>{error}</div>
            <Link href="/firs" style={{ color: '#1d4ed8', fontSize: '13px', textDecoration: 'none', marginTop: '8px', display: 'inline-block' }}>
              ← Back to FIR Registry
            </Link>
          </div>
        )}

        {fir && !loading && (
          <>
            {/* Case Summary Header */}
            <div style={{
              background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
              borderRadius: '12px', padding: '20px 24px',
              boxShadow: '0 4px 12px rgba(29,78,216,0.3)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: 600, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {fir.Category} · Case ID {fir.CaseMasterID}
                  </div>
                  <div style={{ color: '#fff', fontSize: '20px', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '-0.5px', marginBottom: '8px' }}>
                    {fir.CrimeNo}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontWeight: 600 }}>
                    {fir.CrimeHead}{fir.SubHead ? ` — ${fir.SubHead}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 14px',
                    color: '#fff', fontSize: '12px', fontWeight: 600,
                  }}>
                    📍 {fir.DistrictName} · {fir.PoliceStation}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
                    Registered: {new Date(fir.CrimeRegisteredDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            {/* Two-column layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>

              {/* Left column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Brief Facts */}
                <Section icon={<BookOpen size={16} color="#1d4ed8" />} title="Brief Facts of the Case">
                  <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                    {fir.BriefFacts || 'No brief facts recorded.'}
                  </div>
                </Section>

                {/* Accused */}
                <Section icon={<User size={16} color="#dc2626" />} title={`Accused Persons (${fir.accused_list?.length || 0})`}>
                  {(fir.accused_list || []).length === 0 ? (
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>No accused recorded</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {fir.accused_list.map((a, i) => (
                        <div key={a.AccusedMasterID} style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '10px 12px', background: '#f8fafc', borderRadius: '8px',
                          border: '1px solid #f1f5f9',
                        }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <User size={16} color="#dc2626" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{a.AccusedName}</div>
                            <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                              Age: {a.AgeYear} · Gender: {a.GenderID === 'M' ? 'Male' : 'Female'} · ID: {a.PersonID}
                            </div>
                          </div>
                          <span style={{
                            fontSize: '10px', fontWeight: 700, padding: '2px 8px',
                            borderRadius: '20px', background: '#fef2f2', color: '#dc2626',
                          }}>Accused #{i + 1}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                {/* Victims */}
                <Section icon={<Users size={16} color="#d97706" />} title={`Victim Details (${fir.victims?.length || 0})`}>
                  {(fir.victims || []).length === 0 ? (
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>No victims recorded</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {fir.victims.map((v, i) => (
                        <div key={v.VictimMasterID} style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '10px 12px', background: '#fffbeb', borderRadius: '8px',
                          border: '1px solid #fde68a',
                        }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={16} color="#d97706" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{v.VictimName}</div>
                            <div style={{ fontSize: '10px', color: '#92400e' }}>
                              Age: {v.AgeYear} · Gender: {v.GenderID === 'M' ? 'Male' : 'Female'}
                              {v.VictimPolice === '1' && ' · 🚔 Police Personnel'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                {/* Arrests */}
                {(fir.arrests || []).length > 0 && (
                  <Section icon={<Shield size={16} color="#7c3aed" />} title={`Arrest / Surrender Records (${fir.arrests.length})`}>
                    {fir.arrests.map((a, i) => (
                      <div key={a.ArrestSurrenderID} style={{
                        padding: '10px 12px', background: '#fdf4ff', borderRadius: '8px',
                        border: '1px solid #e9d5ff', marginBottom: i < fir.arrests.length - 1 ? '6px' : 0,
                      }}>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#7c3aed' }}>
                          {a.ArrestSurrenderTypeID === 1 ? '🚔 Arrested' : '🤝 Surrendered'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                          Date: {formatDate(a.ArrestSurrenderDate)}
                        </div>
                      </div>
                    ))}
                  </Section>
                )}
              </div>

              {/* Right column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Case Info */}
                <Section icon={<FileText size={16} color="#059669" />} title="Case Information">
                  <InfoRow label="Case No" value={fir.CaseNo} />
                  <InfoRow label="Crime Number" value={fir.CrimeNo} />
                  <InfoRow label="Category" value={fir.Category} />
                  <InfoRow label="Gravity" value={fir.Gravity} />
                  <InfoRow label="Crime Head" value={fir.CrimeHead} />
                  <InfoRow label="Sub Head" value={fir.SubHead} />
                  <InfoRow label="Status" value={fir.CaseStatus} />
                  <InfoRow label="Registered" value={formatDate(fir.CrimeRegisteredDate)} />
                  <InfoRow label="Incident From" value={formatDate(fir.IncidentFromDate)} />
                  <InfoRow label="Incident To" value={formatDate(fir.IncidentToDate)} />
                </Section>

                {/* Location */}
                <Section icon={<MapPin size={16} color="#d97706" />} title="Location">
                  <InfoRow label="District" value={fir.DistrictName} />
                  <InfoRow label="Police Station" value={fir.PoliceStation} />
                  <InfoRow label="Coordinates" value={`${fir.latitude?.toFixed(5)}, ${fir.longitude?.toFixed(5)}`} />
                  {fir.latitude && fir.longitude && (
                    <a
                      href={`https://maps.google.com/maps?q=${fir.latitude},${fir.longitude}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        color: '#1d4ed8', fontSize: '11px', textDecoration: 'none',
                        marginTop: '6px', fontWeight: 600,
                      }}
                    >
                      <MapPin size={12} /> View on Google Maps
                    </a>
                  )}
                </Section>

                {/* Officer */}
                <Section icon={<Shield size={16} color="#1d4ed8" />} title="Registering Officer">
                  <InfoRow label="Name" value={fir.RegisteringOfficer} />
                  <InfoRow label="Rank" value={fir.OfficerRank} />
                  <InfoRow label="Police Station" value={fir.PoliceStation} />
                </Section>

                {/* Acts & Sections */}
                <Section icon={<Scale size={16} color="#7c3aed" />} title={`Acts & Sections (${fir.acts_sections?.length || 0})`}>
                  {(fir.acts_sections || []).length === 0 ? (
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>None recorded</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {fir.acts_sections.map((s, i) => (
                        <div key={i} style={{
                          padding: '8px 10px', background: '#fdf4ff',
                          borderRadius: '6px', border: '1px solid #e9d5ff',
                        }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed', fontFamily: 'monospace' }}>
                            {s.ActCode} § {s.SectionCode}
                          </div>
                          <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                            {s.SectionDescription || s.ActDescription || '—'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>

                {/* Chargesheet */}
                {fir.chargesheet && (
                  <Section icon={<Gavel size={16} color="#059669" />} title="Chargesheet">
                    <InfoRow label="CS ID" value={String(fir.chargesheet.CSID)} />
                    <InfoRow label="Filed On" value={formatDate(fir.chargesheet.csdate)} />
                    <InfoRow label="CS Type" value={fir.chargesheet.cstype} />
                    {fir.CourtName && <InfoRow label="Court" value={fir.CourtName} />}
                  </Section>
                )}

                {/* Complainant */}
                {fir.complainant && (
                  <Section icon={<User size={16} color="#475569" />} title="Complainant">
                    <InfoRow label="Name" value={fir.complainant.ComplainantName} />
                    <InfoRow label="Age" value={String(fir.complainant.AgeYear)} />
                  </Section>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print { nav, button { display: none !important; } }
      `}</style>
    </div>
  );
}
