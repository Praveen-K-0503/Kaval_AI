'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Brain, TrendingUp, Activity, AlertTriangle,
  BarChart2, Target, Cpu, RefreshCw, Download
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const CARD = {
  background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
  padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};

export default function AnalyticsPage() {
  const [forecast, setForecast] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any>(null);
  const [hotspots, setHotspots] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [districtId, setDistrictId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  const [activeModel, setActiveModel] = useState<'forecast' | 'anomalies' | 'hotspots' | 'timeline'>('forecast');

  useEffect(() => { fetchAll(); }, [districtId]);

  const fetchAll = async () => {
    setLoading(true);
    const distParam = districtId ? `&district_id=${districtId}` : '';
    try {
      const [f, a, h, t] = await Promise.all([
        fetch(`${API}/api/ml/forecast?days=30${distParam}`).then(r => r.json()),
        fetch(`${API}/api/ml/anomalies`).then(r => r.json()),
        fetch(`${API}/api/ml/hotspots?eps_km=5${distParam}`).then(r => r.json()),
        fetch(`${API}/api/timeline${districtId ? `?district_id=${districtId}` : ''}`).then(r => r.json()),
      ]);
      setForecast(f);
      setAnomalies(a);
      setHotspots(h);
      setTimeline(t.timeline || []);
    } catch { }
    setLoading(false);
  };

  const monthlyChart = (forecast?.monthly_predictions || []).map((m: any) => ({
    month: m.month?.slice(5) || '',
    predicted: m.predicted_total || 0,
  }));

  const dailyChart = (forecast?.daily_forecast || []).slice(0, 14).map((d: any) => ({
    date: d.date?.slice(5) || '',
    crimes: d.predicted_crimes || 0,
    risk: d.risk_level,
  }));

  const timelineChart = [...timeline].reverse().map((t: any) => ({
    month: t.month?.slice(5) || '',
    total: t.total || 0,
    heinous: t.heinous || 0,
  }));

  const hotspotChart = (hotspots?.clusters || []).slice(0, 8).map((c: any, i: number) => ({
    id: `Cluster ${c.cluster_id}`,
    firs: c.fir_count,
    heinous: c.heinous_count,
    risk: Math.round(c.risk_score),
  }));

  const featureImportanceData = Object.entries(forecast?.feature_importance || {}).map(([k, v]) => ({
    feature: k.replace('_', ' '),
    importance: Math.round((v as number) * 100),
  })).sort((a, b) => b.importance - a.importance);

  const anomalyData = (anomalies?.anomalies || []).map((a: any) => ({
    district: a.district?.slice(0, 10),
    crime_count: a.crime_count,
    risk_score: Math.round(a.risk_score),
    severity: a.severity,
  }));

  const radarData = anomalyData.slice(0, 6).map((a: any) => ({
    district: a.district,
    risk: a.risk_score,
    crimes: Math.min(a.crime_count / 10, 100),
  }));

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
            <Brain size={18} color="#1d4ed8" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>ML Analytics Deep Dive</span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={districtId}
              onChange={e => setDistrictId(e.target.value ? Number(e.target.value) : '')}
              style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px', background: '#fff' }}
            >
              <option value="">All Karnataka</option>
              <option value="1">Bengaluru Urban</option>
              <option value="3">Mysuru</option>
              <option value="4">Hubballi-Dharwad</option>
              <option value="5">Mangaluru</option>
              <option value="6">Belagavi</option>
            </select>
            <button onClick={fetchAll} style={{
              padding: '6px 12px', background: '#eff6ff', color: '#1d4ed8',
              border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer',
              fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Model Selector Tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '0' }}>
          {([
            { id: 'forecast', label: '📈 XGBoost Forecast', color: '#1d4ed8' },
            { id: 'anomalies', label: '⚠️ Isolation Forest', color: '#dc2626' },
            { id: 'hotspots', label: '🔴 DBSCAN Hotspots', color: '#d97706' },
            { id: 'timeline', label: '📊 Historical Timeline', color: '#059669' },
          ] as const).map(tab => (
            <button key={tab.id} onClick={() => setActiveModel(tab.id)} style={{
              padding: '14px 20px', border: 'none', background: 'transparent',
              borderBottom: activeModel === tab.id ? `3px solid ${tab.color}` : '3px solid transparent',
              color: activeModel === tab.id ? tab.color : '#64748b',
              fontWeight: activeModel === tab.id ? 700 : 500,
              fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* ── XGBoost Forecast ─────────────────────────────────── */}
        {activeModel === 'forecast' && forecast && (
          <>
            {/* Model info */}
            <div style={{
              ...CARD,
              background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
              color: '#fff',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.8, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Model</div>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>XGBoost Regressor v2.0</div>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                    Features: month, year, quarter, is_festive, lag_1, lag_2, lag_3 · {forecast.training_months} months training data
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {[
                    { label: 'Training Months', value: forecast.training_months },
                    { label: 'Forecast Days', value: forecast.daily_forecast?.length || 30 },
                    { label: 'Confidence', value: forecast.model_confidence },
                  ].map((s, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: 800 }}>{s.value}</div>
                      <div style={{ fontSize: '10px', opacity: 0.75 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
              {/* 14-day daily */}
              <div style={CARD}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={15} color="#059669" /> 14-Day Daily Crime Prediction
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={dailyChart}>
                    <defs>
                      <linearGradient id="fg1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(v: any) => [`${v} predicted crimes`, 'Daily']}
                    />
                    <Area type="monotone" dataKey="crimes" stroke="#1d4ed8" fill="url(#fg1)" strokeWidth={2} dot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Feature Importance */}
              <div style={CARD}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Target size={15} color="#7c3aed" /> XGBoost Feature Importance
                </div>
                {featureImportanceData.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {featureImportanceData.map((f, i) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <span style={{ fontSize: '11px', color: '#475569', fontWeight: 500, textTransform: 'capitalize' }}>{f.feature}</span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#7c3aed' }}>{f.importance}%</span>
                        </div>
                        <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${f.importance}%`,
                            background: `hsl(${260 - i * 25}, 70%, 55%)`,
                            borderRadius: '3px', transition: 'width 0.5s',
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: '#94a3b8', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
                    Feature importance not available
                  </div>
                )}
              </div>
            </div>

            {/* Monthly predictions */}
            {monthlyChart.length > 0 && (
              <div style={CARD}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
                  Monthly Crime Count Forecast (Next 3 Months)
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={monthlyChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(v: any) => [`${v} crimes`, 'Predicted']}
                    />
                    <Bar dataKey="predicted" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}

        {/* ── Isolation Forest Anomalies ────────────────────────── */}
        {activeModel === 'anomalies' && anomalies && (
          <>
            <div style={{ ...CARD, background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.8, textTransform: 'uppercase' }}>Model</div>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>Isolation Forest</div>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                    contamination=0.10 · n_estimators=200 · {anomalies.districts_analyzed} districts analyzed
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '48px', fontWeight: 800 }}>{anomalies.anomalies_detected}</div>
                  <div style={{ fontSize: '11px', opacity: 0.8 }}>Anomalies Detected</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={CARD}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
                  District Anomaly Risk Scores
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={anomalyData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <YAxis type="category" dataKey="district" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="risk_score" fill="#dc2626" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={CARD}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
                  District Risk Radar
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="district" tick={{ fontSize: 9 }} />
                    <PolarRadiusAxis tick={{ fontSize: 9 }} />
                    <Radar name="Risk Score" dataKey="risk" stroke="#dc2626" fill="#dc2626" fillOpacity={0.2} />
                    <Radar name="Crime Volume" dataKey="crimes" stroke="#1d4ed8" fill="#1d4ed8" fillOpacity={0.15} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Anomaly Detail Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(anomalies.anomalies || []).map((a: any, i: number) => (
                <div key={i} style={{
                  ...CARD, padding: '14px 16px',
                  borderLeft: `5px solid ${a.severity === 'Critical' ? '#dc2626' : a.severity === 'High' ? '#d97706' : '#059669'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                          background: a.severity === 'Critical' ? '#fef2f2' : a.severity === 'High' ? '#fffbeb' : '#f0fdf4',
                          color: a.severity === 'Critical' ? '#dc2626' : a.severity === 'High' ? '#d97706' : '#059669',
                        }}>{a.severity}</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{a.district}</span>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>· {a.anomaly_id}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569', lineHeight: '1.6', marginBottom: '8px' }}>{a.description}</div>
                      <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: 600 }}>↗ {a.recommended_action}</div>
                    </div>
                    <div style={{ marginLeft: '16px', textAlign: 'right' }}>
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#dc2626' }}>{a.crime_count}</div>
                      <div style={{ fontSize: '9px', color: '#94a3b8' }}>FIRs</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', marginTop: '4px' }}>{Math.round(a.risk_score)}</div>
                      <div style={{ fontSize: '9px', color: '#94a3b8' }}>risk score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── DBSCAN Hotspots ─────────────────────────────────────── */}
        {activeModel === 'hotspots' && hotspots && (
          <>
            <div style={{ ...CARD, background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.8, textTransform: 'uppercase' }}>Model</div>
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>DBSCAN Spatial Clustering</div>
                  <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                    eps={hotspots.parameters?.eps_km}km · min_samples={hotspots.parameters?.min_cluster_size} · Haversine metric · {hotspots.total_firs_analyzed} FIRs analyzed
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', fontWeight: 800 }}>{hotspots.clusters_detected}</div>
                    <div style={{ fontSize: '11px', opacity: 0.8 }}>Clusters Found</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', fontWeight: 800 }}>{hotspots.noise_points}</div>
                    <div style={{ fontSize: '11px', opacity: 0.8 }}>Noise Points</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cluster bar chart */}
            {hotspotChart.length > 0 && (
              <div style={CARD}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>
                  Crime Cluster Analysis (Top 8 by FIR Count)
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={hotspotChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="id" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="firs" name="Total FIRs" fill="#d97706" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="heinous" name="Heinous" fill="#dc2626" radius={[4, 4, 0, 0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Cluster detail cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {(hotspots.clusters || []).slice(0, 8).map((c: any) => (
                <div key={c.cluster_id} style={{
                  ...CARD, padding: '14px',
                  borderLeft: `4px solid ${c.risk_score > 70 ? '#dc2626' : c.risk_score > 40 ? '#d97706' : '#059669'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Cluster #{c.cluster_id}</div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: c.risk_score > 70 ? '#dc2626' : '#d97706' }}>
                      Risk: {Math.round(c.risk_score)}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginBottom: '4px' }}>
                    📍 {c.centroid_lat?.toFixed(4)}°N, {c.centroid_lng?.toFixed(4)}°E
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569' }}>
                    🔢 {c.fir_count} FIRs · {c.heinous_count} Heinous
                  </div>
                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                    ⚖️ Dominant: {c.dominant_crime_type}
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px', fontFamily: 'monospace' }}>
                    {c.sample_firs?.slice(0, 2).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Historical Timeline ─────────────────────────────────── */}
        {activeModel === 'timeline' && (
          <>
            <div style={CARD}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BarChart2 size={15} color="#059669" /> 24-Month Historical FIR Trend
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={timelineChart}>
                  <defs>
                    <linearGradient id="tlg1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="tlg2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="total" name="Total FIRs" stroke="#059669" fill="url(#tlg1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="heinous" name="Heinous" stroke="#dc2626" fill="url(#tlg2)" strokeWidth={2} />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Peak months table */}
            {timelineChart.length > 0 && (
              <div style={CARD}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                  Monthly Summary Table
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        {['Month', 'Total FIRs', 'Heinous', 'Heinous %'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: '#64748b', fontSize: '11px' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {timelineChart.slice(0, 12).map((row: any, i: number) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>{row.month}</td>
                          <td style={{ padding: '8px 12px' }}>{row.total}</td>
                          <td style={{ padding: '8px 12px', color: '#dc2626' }}>{row.heinous}</td>
                          <td style={{ padding: '8px 12px' }}>
                            <span style={{
                              fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                              background: row.total ? (row.heinous / row.total > 0.5 ? '#fef2f2' : '#f0fdf4') : '#f8fafc',
                              color: row.total ? (row.heinous / row.total > 0.5 ? '#dc2626' : '#059669') : '#64748b',
                            }}>
                              {row.total ? Math.round((row.heinous / row.total) * 100) : 0}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
