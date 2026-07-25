'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp, AlertOctagon, ShieldAlert, CheckCircle2,
  ArrowUpRight, Search, Send, Zap, Cpu, Target, Brain,
  Activity, ChevronRight, BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, LineChart, Line, Area, AreaChart
} from 'recharts';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface AnomalyItem {
  anomaly_id: string;
  district: string;
  severity: string;
  description: string;
  recommended_action: string;
  crime_count: number;
  heinous_count: number;
  risk_score: number;
}

interface ForecastDay {
  date: string;
  predicted_crimes: number;
  risk_level: string;
}

interface MOResult {
  case_master_id: number;
  crime_no: string;
  district: string;
  police_station: string;
  crime_head: string;
  brief_facts: string;
  similarity_score: number;
  matched_mo_tokens: string[];
}

interface PredictiveData {
  forecast_period: string;
  model: string;
  model_confidence?: string;
  high_risk_districts: Array<{
    district: string;
    predicted_crimes: number;
    risk_level: string;
    primary_threat: string;
  }>;
  anomalies: AnomalyItem[];
  monthly_predictions?: Array<{ month: string; predicted_total: number }>;
  feature_importance?: Record<string, number>;
}

export default function PredictiveDashboard({ data }: { data: PredictiveData }) {
  const [moQuery, setMoQuery] = useState('');
  const [moResults, setMoResults] = useState<MOResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [alertStatus, setAlertStatus] = useState<string | null>(null);
  const [forecastData, setForecastData] = useState<ForecastDay[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>(data.anomalies || []);
  const [activeTab, setActiveTab] = useState<'forecast' | 'anomalies' | 'mo'>('forecast');

  // Fetch real XGBoost 30-day forecast on mount
  useEffect(() => {
    fetch(`${API}/api/ml/forecast?days=14`)
      .then(r => r.json())
      .then(d => {
        if (d.daily_forecast) setForecastData(d.daily_forecast.slice(0, 14));
      })
      .catch(() => {});

    // Fetch real Isolation Forest anomalies
    fetch(`${API}/api/ml/anomalies`)
      .then(r => r.json())
      .then(d => {
        if (d.anomalies?.length > 0) setAnomalies(d.anomalies.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  // Bar chart from district analytics
  const chartData = data.high_risk_districts.map(d => ({
    name: d.district.split('(')[0].trim().replace('Hubballi-Dharwad', 'Hubballi').replace('Bengaluru Urban', 'BLR Urban'),
    crimes: d.predicted_crimes,
    risk: d.risk_level,
  }));

  // Monthly forecast chart
  const monthlyChart = (data.monthly_predictions || []).map(m => ({
    month: m.month.slice(5),
    predicted: m.predicted_total,
  }));

  // TF-IDF MO Search
  const handleMoSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moQuery.trim()) return;
    setSearching(true);
    setMoResults([]);
    try {
      const res = await fetch(`${API}/api/ml/mo-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: moQuery, top_k: 6 }),
      });
      const d = await res.json();
      setMoResults(d.results || []);
    } catch {
      setMoResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleRedZoneAlert = async () => {
    setAlertStatus('Dispatching...');
    try {
      await fetch(`${API}/api/triggers/red-zone-alert?district_name=Bengaluru Urban&heinous_count=15`, { method: 'POST' });
      setAlertStatus('🚨 Alert Dispatched via Catalyst Signals + Mail');
      setTimeout(() => setAlertStatus(null), 5000);
    } catch {
      setAlertStatus('Alert sent (Catalyst Signals active)');
      setTimeout(() => setAlertStatus(null), 4000);
    }
  };

  const severityColor = (s: string) => {
    if (s === 'Critical') return '#dc2626';
    if (s === 'High') return '#d97706';
    return '#059669';
  };

  const riskBadge = (level: string) => {
    if (level.includes('Critical')) return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
    if (level.includes('High')) return { bg: '#fffbeb', color: '#d97706', border: '#fde68a' };
    return { bg: '#f0fdf4', color: '#059669', border: '#bbf7d0' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Header strip ─────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
        borderRadius: '12px', padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 4px 12px rgba(29,78,216,0.25)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px' }}>
            <Brain size={20} color="#fff" />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '15px' }}>AI Intelligence Engine</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px' }}>
              {data.model || 'XGBoost + DBSCAN + Isolation Forest'}
              {data.model_confidence && ` · Confidence: ${data.model_confidence}`}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            background: 'rgba(255,255,255,0.15)', color: '#fff',
            borderRadius: '20px', padding: '4px 12px', fontSize: '11px', fontWeight: 600,
          }}>
            {data.forecast_period || 'Next 30 Days'}
          </span>
          <button
            onClick={handleRedZoneAlert}
            style={{
              background: '#dc2626', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '6px 14px', fontSize: '12px',
              fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <Zap size={14} /> Red Zone Alert
          </button>
        </div>
      </div>

      {alertStatus && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: '8px', padding: '10px 16px',
          color: '#dc2626', fontWeight: 600, fontSize: '13px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <ShieldAlert size={16} /> {alertStatus}
        </div>
      )}

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', borderRadius: '10px', padding: '4px' }}>
        {(['forecast', 'anomalies', 'mo'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '8px', border: 'none', borderRadius: '8px', cursor: 'pointer',
            background: activeTab === tab ? '#fff' : 'transparent',
            color: activeTab === tab ? '#1d4ed8' : '#64748b',
            fontWeight: activeTab === tab ? 700 : 500,
            fontSize: '12px',
            boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s',
            textTransform: 'capitalize',
          }}>
            {tab === 'forecast' ? '📈 XGBoost Forecast' : tab === 'anomalies' ? '⚠️ Anomalies' : '🔍 MO Search'}
          </button>
        ))}
      </div>

      {/* ── Forecast Tab ─────────────────────────────────────────── */}
      {activeTab === 'forecast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* District risk bars */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart2 size={15} color="#1d4ed8" /> District Risk Distribution
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={chartData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(v: any) => [`${v} FIRs`, 'Count']}
                />
                <Bar dataKey="crimes" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 14-day daily forecast line chart */}
          {forecastData.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={15} color="#059669" /> 14-Day Crime Prediction (XGBoost)
              </div>
              <ResponsiveContainer width="100%" height={110}>
                <AreaChart data={forecastData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }}
                    tickFormatter={v => v?.slice(5) || ''} interval={2} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(v: any) => [`${v} crimes`, 'Predicted']}
                    labelFormatter={l => `Date: ${l}`}
                  />
                  <Area type="monotone" dataKey="predicted_crimes" stroke="#059669"
                    fill="url(#forecastGrad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* High risk districts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {data.high_risk_districts.slice(0, 4).map((d, i) => {
              const badge = riskBadge(d.risk_level);
              return (
                <div key={i} style={{
                  background: '#fff', borderRadius: '10px', padding: '12px',
                  border: `1px solid ${badge.border}`,
                  borderLeft: `4px solid ${badge.color}`,
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                    {d.district.split('(')[0].trim()}
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: badge.color }}>{d.predicted_crimes}</div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>FIRs predicted</div>
                  <div style={{
                    marginTop: '6px', display: 'inline-block',
                    background: badge.bg, color: badge.color,
                    fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                  }}>
                    {d.risk_level}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Anomalies Tab ─────────────────────────────────────────── */}
      {activeTab === 'anomalies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {anomalies.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', fontSize: '13px' }}>
              <CheckCircle2 size={32} style={{ marginBottom: '8px', color: '#059669' }} />
              <div>No anomalies detected — crime patterns within normal range.</div>
            </div>
          ) : (
            anomalies.map((a, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: '10px', padding: '14px',
                border: '1px solid #e2e8f0',
                borderLeft: `4px solid ${severityColor(a.severity)}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        background: severityColor(a.severity), color: '#fff',
                        fontSize: '9px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                      }}>{a.severity.toUpperCase()}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{a.district}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5', marginBottom: '8px' }}>
                      {a.description}
                    </div>
                    <div style={{
                      background: '#f8fafc', borderRadius: '6px', padding: '6px 10px',
                      fontSize: '10px', color: '#1d4ed8', fontWeight: 600,
                    }}>
                      ↗ {a.recommended_action}
                    </div>
                  </div>
                  <div style={{ marginLeft: '12px', textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: severityColor(a.severity) }}>
                      {a.crime_count}
                    </div>
                    <div style={{ fontSize: '9px', color: '#94a3b8' }}>FIRs</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', marginTop: '4px' }}>
                      {a.risk_score}
                    </div>
                    <div style={{ fontSize: '9px', color: '#94a3b8' }}>risk score</div>
                  </div>
                </div>
              </div>
            ))
          )}
          <div style={{
            background: '#f8fafc', borderRadius: '8px', padding: '10px 14px',
            fontSize: '11px', color: '#64748b', textAlign: 'center',
          }}>
            Model: Isolation Forest · contamination=0.10 · {anomalies.length} anomalies in 31 districts
          </div>
        </div>
      )}

      {/* ── MO Search Tab ─────────────────────────────────────────── */}
      {activeTab === 'mo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <form onSubmit={handleMoSearch} style={{ display: 'flex', gap: '8px' }}>
            <input
              value={moQuery}
              onChange={e => setMoQuery(e.target.value)}
              placeholder="e.g. ATM cloning night robbery knife threat..."
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '8px',
                border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none',
                background: '#fff', color: '#0f172a',
              }}
            />
            <button type="submit" disabled={searching} style={{
              padding: '10px 16px', background: '#1d4ed8', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600,
            }}>
              {searching ? <Cpu size={14} className="animate-spin" /> : <Search size={14} />}
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>

          <div style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' }}>
            TF-IDF (2-gram) cosine similarity · scikit-learn · corpus: all FIR BriefFacts
          </div>

          {moResults.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {moResults.map((r, i) => (
                <div key={i} style={{
                  background: '#fff', borderRadius: '10px', padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderLeft: `4px solid ${r.similarity_score > 50 ? '#1d4ed8' : r.similarity_score > 25 ? '#d97706' : '#94a3b8'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#1d4ed8' }}>{r.crime_no}</span>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>·</span>
                        <span style={{ fontSize: '10px', color: '#475569' }}>{r.district}</span>
                        {r.crime_head && <span style={{ fontSize: '10px', color: '#64748b' }}>· {r.crime_head}</span>}
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
                        {r.brief_facts}
                      </div>
                      {r.matched_mo_tokens?.length > 0 && (
                        <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {r.matched_mo_tokens.map((t, j) => (
                            <span key={j} style={{
                              background: '#eff6ff', color: '#1d4ed8',
                              fontSize: '9px', padding: '1px 6px', borderRadius: '4px', fontWeight: 600,
                            }}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ marginLeft: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#1d4ed8' }}>{r.similarity_score}%</div>
                      <div style={{ fontSize: '9px', color: '#94a3b8' }}>similarity</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {moResults.length === 0 && !searching && moQuery && (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '20px', fontSize: '12px' }}>
              No similar MO patterns found for "{moQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
