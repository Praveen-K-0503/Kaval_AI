'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Search, FileText, ChevronRight,
  AlertTriangle, Shield, Sparkles, RefreshCw
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/apiConfig';

const API = API_BASE_URL;

interface LiveFIR {
  CaseMasterID: number;
  CrimeNo: string;
  CaseNo: string;
  CrimeRegisteredDate: string;
  IncidentFromDate: string;
  DistrictName: string;
  PoliceStation: string;
  Gravity: string;
  GravityID: number;
  CrimeHead: string;
  SubHead?: string;
  CaseStatus: string;
  BriefFacts: string;
  accused_names?: string[];
  act_sections?: Array<{ ActCode: string; SectionCode: string }>;
  latitude?: number;
  longitude?: number;
}

interface MOResult {
  case_master_id: number;
  crime_no: string;
  district: string;
  police_station: string;
  crime_head: string;
  brief_facts: string;
  similarity_score: number;
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', border: '1.5px solid #E8D4BA', borderRadius: '12px', padding: '18px 20px', borderLeft: '4px solid #E8D4BA' }}>
      {[100, 60, 80].map((w, i) => (
        <div key={i} style={{ height: '12px', background: '#F2E8D9', borderRadius: '6px', width: `${w}%`, marginBottom: '10px' }} />
      ))}
    </div>
  );
}

const gravityColor = (g: string) =>
  g?.toLowerCase().includes('heinous') ? '#8B1A1A' : g?.toLowerCase().includes('non') ? '#2D5016' : '#C8960C';
const gravityBg = (g: string) =>
  g?.toLowerCase().includes('heinous') ? '#FEE2E2' : g?.toLowerCase().includes('non') ? '#D1FAE5' : '#FEF3C7';

export default function FIRRegistryPage() {
  const [searchQuery, setSearchQuery]         = useState('');
  const [selectedGravity, setSelectedGravity] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [firs, setFirs]                       = useState<LiveFIR[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [total, setTotal]                     = useState(0);
  const [moQuery, setMoQuery]                 = useState('');
  const [moResults, setMoResults]             = useState<MOResult[]>([]);
  const [moSearching, setMoSearching]         = useState(false);
  const [moOpen, setMoOpen]                   = useState(false);
  const [districts, setDistricts]             = useState<string[]>([]);

  const fetchFIRs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (selectedGravity === 'HEINOUS') params.set('gravity_id', '1');
      else if (selectedGravity === 'NON-HEINOUS') params.set('gravity_id', '2');
      if (selectedDistrict !== 'ALL') params.set('q', selectedDistrict);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      const res = await fetch(`${API}/api/firs?${params}`);
      const d = await res.json();
      const rows: LiveFIR[] = d.firs ?? d;
      setFirs(rows);
      setTotal(d.total ?? rows.length);
    } catch { setFirs([]); }
    finally { setLoading(false); }
  }, [searchQuery, selectedGravity, selectedDistrict]);

  useEffect(() => {
    const t = setTimeout(fetchFIRs, 350);
    return () => clearTimeout(t);
  }, [fetchFIRs]);

  useEffect(() => {
    fetch(`${API}/api/districts`)
      .then(r => r.json())
      .then(d => {
        const rows: any[] = d.districts ?? d;
        setDistricts(rows.map((r: any) => r.district_name ?? r.DistrictName ?? r.name).filter(Boolean));
      })
      .catch(() => {});
  }, []);

  const handleMoSearch = async () => {
    if (!moQuery.trim()) return;
    setMoSearching(true);
    try {
      const res = await fetch(`${API}/api/ml/mo-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: moQuery, top_k: 10 }),
      });
      const d = await res.json();
      setMoResults(d.results ?? d);
      setMoOpen(true);
    } catch { setMoResults([]); }
    finally { setMoSearching(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FBF6EE', color: '#1C0A00', display: 'flex', flexDirection: 'column' }}>

      <header style={{ background: 'linear-gradient(135deg, #8B1A1A 0%, #A52020 100%)', borderBottom: '3px solid #C8960C', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '60px', boxShadow: '0 4px 16px rgba(139,26,26,0.25)', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href="/" style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} style={{ opacity: 0.9 }} /> FIR Intelligence Vault & MO Similarity Search
            </h1>
            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
              Karnataka State Police SCRB — 24-Table Case Master Registry · {total.toLocaleString()} Live Records
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text" placeholder="MO query: e.g. night robbery vault…" value={moQuery}
            onChange={e => setMoQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleMoSearch()}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px', outline: 'none', width: '200px' }}
          />
          <button onClick={handleMoSearch} disabled={moSearching || !moQuery.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 14px', background: '#C8960C', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 800, color: '#1C0A00', cursor: 'pointer', opacity: (moSearching || !moQuery.trim()) ? 0.65 : 1 }}>
            <Sparkles size={14} />{moSearching ? 'Searching…' : 'MO Search'}
          </button>
        </div>
      </header>

      <div style={{ flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>

        <div className="ksp-panel" style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9B7560' }} />
            <input type="text" placeholder="Search FIR number, accused name, crime head, or BriefFacts keyword…" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '32px', paddingRight: '10px', paddingTop: '9px', paddingBottom: '9px', border: '1.5px solid #E8D4BA', borderRadius: '8px', fontSize: '12px', color: '#1C0A00', background: '#FFF8EF', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              onFocus={e => (e.target.style.borderColor = '#8B1A1A')} onBlur={e => (e.target.style.borderColor = '#E8D4BA')}
            />
          </div>
          <select value={selectedGravity} onChange={e => setSelectedGravity(e.target.value)}
            style={{ padding: '9px 12px', border: '1.5px solid #E8D4BA', borderRadius: '8px', fontSize: '12px', color: '#1C0A00', background: '#FFF8EF', outline: 'none', cursor: 'pointer', fontWeight: 600 }}>
            <option value="ALL">All Gravity</option>
            <option value="HEINOUS">🔴 Heinous</option>
            <option value="NON-HEINOUS">🟢 Non-Heinous</option>
          </select>
          <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)}
            style={{ padding: '9px 12px', border: '1.5px solid #E8D4BA', borderRadius: '8px', fontSize: '12px', color: '#1C0A00', background: '#FFF8EF', outline: 'none', cursor: 'pointer', fontWeight: 600, maxWidth: '180px' }}>
            <option value="ALL">All 31 Districts</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <button onClick={fetchFIRs}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '9px 14px', background: '#F2E8D9', border: '1.5px solid #E8D4BA', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: '#5C3D2E', cursor: 'pointer' }}>
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#9B7560', fontFamily: "'DM Mono', monospace", padding: '0 2px' }}>
          <span>{loading ? 'Loading live FIR records…' : <><strong style={{ color: '#8B1A1A' }}>{firs.length}</strong> of <strong style={{ color: '#8B1A1A' }}>{total.toLocaleString()}</strong> records</>}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#065F46', fontWeight: 700 }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
            LIVE · Catalyst DataStore
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : firs.length === 0
              ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#9B7560', fontSize: '14px' }}>
                  <FileText size={36} style={{ margin: '0 auto 12px', opacity: 0.3, display: 'block' }} />
                  No FIR records match your filters.
                </div>
              )
              : firs.map((fir, i) => {
                  const g = fir.Gravity ?? '';
                  const sections = (fir.act_sections ?? []).slice(0, 3);
                  return (
                    <Link key={fir.CaseMasterID} href={`/firs/${fir.CaseMasterID}`} style={{ textDecoration: 'none' }}>
                      <div className="animate-slide-up" style={{ animationDelay: `${i * 40}ms`, opacity: 0, animationFillMode: 'forwards', background: '#fff', border: '1.5px solid #E8D4BA', borderRadius: '12px', padding: '18px 20px', cursor: 'pointer', transition: 'all 0.2s ease', borderLeft: `4px solid ${gravityColor(g)}`, boxShadow: '0 2px 8px rgba(139,26,26,0.05)' }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#C8960C'; el.style.boxShadow = '0 6px 20px rgba(200,150,12,0.12)'; el.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#E8D4BA'; el.style.boxShadow = '0 2px 8px rgba(139,26,26,0.05)'; el.style.transform = 'translateY(0)'; }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid #F2E8D9', paddingBottom: '12px', marginBottom: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '11px', fontFamily: "'DM Mono', monospace", fontWeight: 800, color: '#C8960C', background: '#FEF9EC', border: '1px solid #FDE68A', padding: '4px 10px', borderRadius: '6px' }}>{fir.CrimeNo}</span>
                            <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1C0A00', margin: 0 }}>{fir.CrimeHead}</h3>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: gravityBg(g), color: gravityColor(g) }}>{g}</span>
                            <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: '#F2E8D9', color: '#6B4226' }}>{fir.CaseStatus}</span>
                            <ChevronRight size={14} style={{ color: '#D4B896' }} />
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '12px', marginBottom: '10px' }}>
                          <div>
                            <span style={{ color: '#9B7560', display: 'block', marginBottom: '2px' }}>District & Station:</span>
                            <span style={{ color: '#1C0A00', fontWeight: 600 }}>{fir.DistrictName} — {fir.PoliceStation}</span>
                          </div>
                          <div>
                            <span style={{ color: '#9B7560', display: 'block', marginBottom: '4px' }}>Act/Sections:</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {sections.length > 0 ? sections.map((s, si) => (
                                <span key={si} style={{ background: '#F2E8D9', border: '1px solid #E8D4BA', color: '#5C3D2E', padding: '2px 7px', borderRadius: '4px', fontSize: '10px', fontFamily: "'DM Mono', monospace" }}>{s.ActCode}/{s.SectionCode}</span>
                              )) : <span style={{ fontSize: '10px', color: '#9B7560' }}>—</span>}
                            </div>
                          </div>
                          <div>
                            <span style={{ color: '#9B7560', display: 'block', marginBottom: '2px' }}>Incident Date:</span>
                            <span style={{ color: '#1C0A00', fontWeight: 600, fontFamily: "'DM Mono', monospace", fontSize: '11px' }}>
                              {fir.IncidentFromDate ? new Date(fir.IncidentFromDate).toLocaleDateString('en-IN') : '—'}
                            </span>
                          </div>
                        </div>
                        {fir.BriefFacts && (
                          <div style={{ background: '#FBF6EE', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E8D4BA', fontSize: '11px', color: '#5C3D2E', fontFamily: "'DM Mono', monospace", lineHeight: 1.5 }}>
                            <strong style={{ color: '#C8960C' }}>BriefFacts:</strong> {fir.BriefFacts.slice(0, 180)}{fir.BriefFacts.length > 180 ? '…' : ''}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })
          }
        </div>
      </div>

      {moOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(28,10,0,0.5)', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#fff', border: '2px solid #C8960C', borderRadius: '16px', padding: '24px', maxWidth: '720px', width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(139,26,26,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #F2E8D9' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1C0A00', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} style={{ color: '#C8960C' }} /> TF-IDF MO Cosine Similarity Results
                </div>
                <div style={{ fontSize: '11px', color: '#9B7560', marginTop: '2px' }}>Query: "{moQuery}" · {moResults.length} matches</div>
              </div>
              <button onClick={() => setMoOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9B7560', fontSize: '20px' }}>✕</button>
            </div>
            {moResults.length === 0
              ? <div style={{ textAlign: 'center', padding: '32px', color: '#9B7560' }}>No similar MO patterns found. Try different keywords.</div>
              : moResults.map((r, i) => (
                <Link key={i} href={`/firs/${r.case_master_id}`} onClick={() => setMoOpen(false)} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '14px', border: '1px solid #E8D4BA', borderRadius: '10px', marginBottom: '10px', cursor: 'pointer', background: '#FBF6EE' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = '#C8960C')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = '#E8D4BA')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '12px', color: '#1C0A00' }}>{r.crime_no} — {r.crime_head}</span>
                      <span style={{ fontSize: '11px', fontFamily: "'DM Mono',monospace", fontWeight: 800, color: '#C8960C', background: '#FEF3C7', padding: '2px 8px', borderRadius: '8px' }}>{(r.similarity_score * 100).toFixed(1)}% match</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#5C3D2E', marginBottom: '4px' }}>{r.district} — {r.police_station}</div>
                    <div style={{ fontSize: '11px', color: '#9B7560', fontFamily: "'DM Mono',monospace", lineHeight: 1.5 }}>{r.brief_facts?.slice(0, 120)}…</div>
                  </div>
                </Link>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}
