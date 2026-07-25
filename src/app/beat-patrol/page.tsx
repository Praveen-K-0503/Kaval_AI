'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Shield, MapPin, Users, Target, RefreshCw,
  Activity, ChevronRight, AlertTriangle, CheckCircle
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const DISTRICTS = [
  { id: 1, name: 'Bengaluru Urban', lat: 12.9716, lng: 77.5946 },
  { id: 3, name: 'Mysuru', lat: 12.2958, lng: 76.6394 },
  { id: 4, name: 'Hubballi-Dharwad', lat: 15.3647, lng: 75.124 },
  { id: 5, name: 'Mangaluru', lat: 12.9141, lng: 74.856 },
  { id: 6, name: 'Belagavi', lat: 15.8497, lng: 74.4977 },
  { id: 7, name: 'Kalaburagi', lat: 17.3297, lng: 76.8343 },
];

interface DeploymentCluster {
  cluster_id: number;
  centroid_lat: number;
  centroid_lng: number;
  fir_count: number;
  heinous_count: number;
  risk_score: number;
  officers_deployed: number;
  recommended_patrol_type: string;
  dominant_crime_type: string;
  patrol_radius_km: number;
  shift_recommendation: string;
}

export default function BeatPatrolPage() {
  const [districtId, setDistrictId] = useState<number>(1);
  const [officers, setOfficers] = useState<number>(60);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchPatrol(); }, [districtId, officers]);

  const fetchPatrol = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/ml/beat-patrol/${districtId}?officers=${officers}`);
      const d = await res.json();
      setData(d);
    } catch { }
    setLoading(false);
  };

  const currentDistrict = DISTRICTS.find(d => d.id === districtId);

  const chartData = (data?.deployment_plan || []).map((c: DeploymentCluster) => ({
    id: `C${c.cluster_id}`,
    officers: c.officers_deployed,
    risk: Math.round(c.risk_score),
    firs: c.fir_count,
  }));

  const getRisk = (score: number) => {
    if (score >= 70) return { label: 'Critical', color: '#dc2626', bg: '#fef2f2' };
    if (score >= 40) return { label: 'High', color: '#d97706', bg: '#fffbeb' };
    return { label: 'Moderate', color: '#059669', bg: '#f0fdf4' };
  };

  const getPatrolTypeIcon = (type: string) => {
    if (type?.includes('Armed')) return '🛡️';
    if (type?.includes('Rapid')) return '🚔';
    if (type?.includes('Community')) return '👮';
    return '🚓';
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#f1f5f9',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>

      {/* Nav */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 24px',
        position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', height: '60px', gap: '12px' }}>
          <Link href="/" style={{ textDecoration: 'none', color: '#64748b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <span style={{ color: '#e2e8f0' }}>›</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="#059669" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Beat Patrol Optimizer</span>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '11px', color: '#94a3b8' }}>
            Algorithm: Greedy Weighted Cluster Assignment
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Controls */}
        <div style={{
          background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
          padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>District</label>
            <select
              value={districtId}
              onChange={e => setDistrictId(Number(e.target.value))}
              style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', background: '#fff', minWidth: '200px' }}
            >
              {DISTRICTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Available Officers: <span style={{ color: '#1d4ed8' }}>{officers}</span>
            </label>
            <input
              type="range" min={10} max={200} value={officers}
              onChange={e => setOfficers(Number(e.target.value))}
              style={{ width: '200px', accentColor: '#1d4ed8' }}
            />
          </div>

          <button onClick={fetchPatrol} style={{
            marginLeft: 'auto', padding: '10px 20px', background: '#059669', color: '#fff',
            border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
            fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <RefreshCw size={14} /> Optimize Deployment
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#059669', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            Computing optimal patrol allocation...
          </div>
        )}

        {data && !loading && (
          <>
            {/* Summary strip */}
            <div style={{
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              borderRadius: '12px', padding: '16px 20px',
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px',
              boxShadow: '0 4px 12px rgba(5,150,105,0.25)',
            }}>
              {[
                { label: 'District', value: currentDistrict?.name || '—' },
                { label: 'Total Officers', value: data.total_officers },
                { label: 'Clusters Covered', value: data.deployment_plan?.length || 0 },
                { label: 'Coverage', value: data.coverage_percentage ? `${data.coverage_percentage}%` : '—' },
                { label: 'Algorithm', value: data.algorithm },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: i < 2 ? '20px' : '16px', fontWeight: 800, color: '#fff' }}>{s.value}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            {chartData.length > 0 && (
              <div style={{
                background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
                padding: '16px 20px',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                  Officer Deployment by Cluster (Risk-Weighted)
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="id" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(v: any, n: string) => [v, n === 'officers' ? 'Officers Deployed' : 'Risk Score']}
                    />
                    <Bar dataKey="officers" name="officers" fill="#059669" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="risk" name="risk" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Deployment Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
              {(data.deployment_plan || []).map((c: DeploymentCluster) => {
                const risk = getRisk(c.risk_score);
                return (
                  <div key={c.cluster_id} style={{
                    background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
                    padding: '14px', borderTop: `4px solid ${risk.color}`,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                          {getPatrolTypeIcon(c.recommended_patrol_type)} Cluster #{c.cluster_id}
                        </div>
                        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                          {c.centroid_lat?.toFixed(4)}°N, {c.centroid_lng?.toFixed(4)}°E
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          background: risk.bg, color: risk.color,
                          fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                        }}>
                          Risk: {Math.round(c.risk_score)}
                        </span>
                      </div>
                    </div>

                    {/* Officers big number */}
                    <div style={{
                      background: '#f0fdf4', borderRadius: '8px', padding: '10px',
                      display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px',
                    }}>
                      <div>
                        <div style={{ fontSize: '28px', fontWeight: 800, color: '#059669', lineHeight: '1' }}>
                          {c.officers_deployed}
                        </div>
                        <div style={{ fontSize: '10px', color: '#065f46', fontWeight: 600 }}>officers deployed</div>
                      </div>
                      <div style={{ flex: 1, fontSize: '11px', color: '#047857', lineHeight: '1.6' }}>
                        <div>📡 Radius: {c.patrol_radius_km?.toFixed(1)} km</div>
                        <div>🕐 {c.shift_recommendation}</div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                      {[
                        { label: 'Total FIRs', value: c.fir_count, color: '#0f172a' },
                        { label: 'Heinous', value: c.heinous_count, color: '#dc2626' },
                      ].map((s, i) => (
                        <div key={i} style={{ background: '#f8fafc', borderRadius: '6px', padding: '6px 8px', textAlign: 'center' }}>
                          <div style={{ fontSize: '16px', fontWeight: 800, color: s.color }}>{s.value}</div>
                          <div style={{ fontSize: '9px', color: '#94a3b8' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Patrol type + crime type */}
                    <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.6' }}>
                      <div>🚔 <strong>{c.recommended_patrol_type}</strong></div>
                      <div>⚖️ {c.dominant_crime_type}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Optimization summary */}
            {data.optimization_summary && (
              <div style={{
                background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px 20px',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                  ⚡ Optimization Summary
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                  {Object.entries(data.optimization_summary).map(([k, v]: [string, any]) => (
                    <div key={k} style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                        {k.replace(/_/g, ' ')}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{String(v)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
