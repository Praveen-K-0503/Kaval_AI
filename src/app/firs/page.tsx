'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search, Filter, FileText, ChevronRight, AlertTriangle,
  Shield, MapPin, Calendar, User, RefreshCw, Download,
  ArrowLeft, TrendingUp, X
} from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FIR {
  CaseMasterID: number;
  CrimeNo: string;
  CaseNo: string;
  CrimeRegisteredDate: string;
  IncidentFromDate: string;
  latitude: number;
  longitude: number;
  BriefFacts: string;
  DistrictName: string;
  PoliceStation: string;
  Gravity: string;
  CrimeHead: string;
  SubHead: string;
  Category: string;
  CaseStatus: string;
  RegisteringOfficer: string;
  OfficerRank: string;
}

const DISTRICTS = [
  { id: 1, name: 'Bengaluru Urban' }, { id: 3, name: 'Mysuru' },
  { id: 4, name: 'Hubballi-Dharwad' }, { id: 5, name: 'Mangaluru' },
  { id: 6, name: 'Belagavi' }, { id: 7, name: 'Kalaburagi' },
  { id: 8, name: 'Ballari' }, { id: 12, name: 'Vijayapura' },
  { id: 13, name: 'Bidar' }, { id: 14, name: 'Raichur' },
];

const GRAVITY_OPTIONS = [
  { id: 1, label: '🔴 Heinous' },
  { id: 2, label: '🟡 Non-Heinous' },
];

const gravityStyle = (g: string) => {
  if (g === 'Heinous') return { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
  return { color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
};

const statusStyle = (s: string) => {
  if (!s) return { color: '#94a3b8', bg: '#f8fafc' };
  if (s.toLowerCase().includes('charge')) return { color: '#1d4ed8', bg: '#eff6ff' };
  if (s.toLowerCase().includes('closed')) return { color: '#059669', bg: '#f0fdf4' };
  if (s.toLowerCase().includes('trial')) return { color: '#7c3aed', bg: '#fdf4ff' };
  return { color: '#64748b', bg: '#f8fafc' };
};

export default function FIRRegistryPage() {
  const [firs, setFirs] = useState<FIR[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState<number | ''>('');
  const [gravityFilter, setGravityFilter] = useState<number | ''>('');
  const [totalShown, setTotalShown] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const fetchFIRs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '60' });
    if (districtFilter) params.append('district_id', String(districtFilter));
    if (gravityFilter) params.append('gravity_id', String(gravityFilter));
    if (searchQuery.trim()) params.append('q', searchQuery.trim());

    try {
      const res = await fetch(`${API}/api/firs?${params}`);
      const data = await res.json();
      setFirs(Array.isArray(data) ? data : []);
      setTotalShown(Array.isArray(data) ? data.length : 0);
    } catch {
      setFirs([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, districtFilter, gravityFilter]);

  useEffect(() => { fetchFIRs(); }, [districtFilter, gravityFilter]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchFIRs(); };

  const clearFilters = () => {
    setSearchQuery('');
    setDistrictFilter('');
    setGravityFilter('');
  };

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>

      {/* ── Top Nav ──────────────────────────────────────────────── */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px', height: '60px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '13px' }}>
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <div style={{ width: '1px', height: '20px', background: '#e2e8f0' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#eff6ff', borderRadius: '6px', padding: '6px' }}>
              <FileText size={16} color="#1d4ed8" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>FIR Registry</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Karnataka State Police · SCRB Intelligence Platform</div>
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <span style={{
              background: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0',
              borderRadius: '20px', padding: '4px 12px', fontSize: '11px', fontWeight: 600,
            }}>
              {totalShown} records
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px' }}>

        {/* Search + Filter Bar */}
        <div style={{
          background: '#fff', borderRadius: '12px', padding: '16px 20px',
          border: '1px solid #e2e8f0', marginBottom: '16px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by Crime No, BriefFacts, Crime Type (e.g. 'murder', 'ATM robbery', 'cybercrime')..."
                style={{
                  width: '100%', padding: '10px 12px 10px 38px',
                  border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px',
                  outline: 'none', color: '#0f172a', background: '#f8fafc',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <button type="submit" style={{
              padding: '10px 20px', background: '#1d4ed8', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <Search size={14} /> Search
            </button>
            <button type="button" onClick={() => setShowFilters(!showFilters)} style={{
              padding: '10px 16px', background: showFilters ? '#eff6ff' : '#f8fafc',
              color: showFilters ? '#1d4ed8' : '#64748b',
              border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer',
              fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <Filter size={14} /> Filters
            </button>
          </form>

          {showFilters && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
              <select
                value={districtFilter}
                onChange={e => setDistrictFilter(e.target.value ? Number(e.target.value) : '')}
                style={{
                  padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px',
                  fontSize: '12px', color: '#0f172a', background: '#fff', cursor: 'pointer',
                }}
              >
                <option value="">All Districts</option>
                {DISTRICTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>

              <select
                value={gravityFilter}
                onChange={e => setGravityFilter(e.target.value ? Number(e.target.value) : '')}
                style={{
                  padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px',
                  fontSize: '12px', color: '#0f172a', background: '#fff', cursor: 'pointer',
                }}
              >
                <option value="">All Gravity</option>
                {GRAVITY_OPTIONS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
              </select>

              {(districtFilter || gravityFilter || searchQuery) && (
                <button onClick={clearFilters} style={{
                  padding: '8px 12px', background: '#fef2f2', color: '#dc2626',
                  border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <X size={12} /> Clear All
                </button>
              )}
            </div>
          )}
        </div>

        {/* FIR Table */}
        <div style={{
          background: '#fff', borderRadius: '12px', overflow: 'hidden',
          border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '160px 1fr 130px 100px 110px 110px 50px',
            padding: '10px 16px', background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            fontSize: '11px', fontWeight: 700, color: '#64748b',
            textTransform: 'uppercase', letterSpacing: '0.05em',
          }}>
            <div>Crime Number</div>
            <div>Case Details</div>
            <div>District / PS</div>
            <div>Gravity</div>
            <div>Date</div>
            <div>Status</div>
            <div></div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
              <div style={{
                width: '32px', height: '32px', border: '3px solid #e2e8f0',
                borderTopColor: '#1d4ed8', borderRadius: '50%',
                animation: 'spin 1s linear infinite', margin: '0 auto 12px',
              }} />
              <div style={{ fontSize: '13px' }}>Searching FIR records...</div>
            </div>
          )}

          {/* Empty state */}
          {!loading && firs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
              <FileText size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>No FIRs found</div>
              <div style={{ fontSize: '12px' }}>Try adjusting your search or filters</div>
            </div>
          )}

          {/* FIR Rows */}
          {!loading && firs.map((fir, i) => {
            const gStyle = gravityStyle(fir.Gravity);
            const sStyle = statusStyle(fir.CaseStatus);
            return (
              <div
                key={fir.CaseMasterID}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr 130px 100px 110px 110px 50px',
                  padding: '12px 16px', alignItems: 'center',
                  borderBottom: i < firs.length - 1 ? '1px solid #f1f5f9' : 'none',
                  transition: 'background 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
              >
                {/* Crime No */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8', fontFamily: 'monospace', letterSpacing: '-0.5px' }}>
                    {fir.CrimeNo || '—'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                    FIR #{fir.CaseMasterID}
                  </div>
                </div>

                {/* Case Details */}
                <div style={{ paddingRight: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', marginBottom: '2px' }}>
                    {fir.CrimeHead || '—'}{fir.SubHead ? ` · ${fir.SubHead}` : ''}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '340px' }}>
                    {fir.BriefFacts || '—'}
                  </div>
                  {fir.RegisteringOfficer && (
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                      IO: {fir.OfficerRank} {fir.RegisteringOfficer}
                    </div>
                  )}
                </div>

                {/* District */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#0f172a' }}>{fir.DistrictName || '—'}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{fir.PoliceStation || '—'}</div>
                </div>

                {/* Gravity */}
                <div>
                  <span style={{
                    background: gStyle.bg, color: gStyle.color,
                    border: `1px solid ${gStyle.border}`,
                    fontSize: '10px', fontWeight: 700,
                    padding: '2px 8px', borderRadius: '20px',
                    whiteSpace: 'nowrap',
                  }}>
                    {fir.Gravity || '—'}
                  </span>
                </div>

                {/* Date */}
                <div style={{ fontSize: '11px', color: '#475569' }}>
                  {formatDate(fir.CrimeRegisteredDate)}
                </div>

                {/* Status */}
                <div>
                  <span style={{
                    background: sStyle.bg, color: sStyle.color,
                    fontSize: '10px', fontWeight: 600,
                    padding: '2px 8px', borderRadius: '20px',
                    whiteSpace: 'nowrap',
                  }}>
                    {fir.CaseStatus || 'Unknown'}
                  </span>
                </div>

                {/* Action */}
                <div>
                  <Link href={`/firs/${fir.CaseMasterID}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '28px', height: '28px',
                    background: '#eff6ff', color: '#1d4ed8',
                    borderRadius: '6px', textDecoration: 'none',
                  }}>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  );
}
