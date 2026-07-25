'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ArrowLeft, RefreshCw, Award, Network, Search } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', color: '#94a3b8', background: '#0f172a' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #1e293b', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: '13px' }}>Loading 3D Graph Engine...</span>
    </div>
  ),
});

const NODE_COLORS: Record<string, string> = {
  Accused: '#ef4444',
  FIR: '#3b82f6',
  CrimeCategory: '#f59e0b',
};

export default function NetworkPage() {
  const graphRef = useRef<any>(null);
  const [graphData, setGraphData] = useState<any>({ nodes: [], links: [] });
  const [stats, setStats] = useState<any>(null);
  const [ringleaders, setRingleaders] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(200);

  useEffect(() => { fetchData(); }, [limit]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const d = await fetch(`${API}/api/ml/network-analysis?limit=${limit}`).then(r => r.json());
      setGraphData({
        nodes: (d.nodes || []).map((n: any) => ({
          ...n,
          color: n.is_ringleader ? '#8b5cf6' : NODE_COLORS[n.group] || '#94a3b8',
          size: n.is_ringleader ? 10 : (n.group === 'CrimeCategory' ? 7 : 4),
        })),
        links: d.links || [],
      });
      setStats(d.graph_stats);
      setRingleaders(d.top_ringleaders || []);
    } catch {}
    setLoading(false);
  };

  const handleNodeClick = useCallback((node: any) => {
    setSelected(node);
    const d = 100;
    const ratio = 1 + d / Math.hypot(node.x || 0, node.y || 0, node.z || 0);
    graphRef.current?.cameraPosition(
      { x: node.x * ratio, y: node.y * ratio, z: node.z * ratio },
      node, 1000
    );
  }, []);

  const filteredNodes = search
    ? graphData.nodes.filter((n: any) => n.name?.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div style={{ height: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', background: 'rgba(15,23,42,0.9)', borderBottom: '1px solid #1e293b', zIndex: 10, backdropFilter: 'blur(8px)' }}>
        <Link href="/" style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
          <ArrowLeft size={14} /> Dashboard
        </Link>
        <div style={{ width: '1px', height: '16px', background: '#1e293b' }} />
        <Network size={16} color="#8b5cf6" />
        <span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 700 }}>Criminal Syndicate Network — 3D</span>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'flex', gap: '12px', marginLeft: '12px' }}>
            {[
              { v: stats.total_nodes, l: 'Nodes', c: '#8b5cf6' },
              { v: stats.total_edges, l: 'Edges', c: '#3b82f6' },
              { v: stats.accused_nodes, l: 'Suspects', c: '#ef4444' },
              { v: stats.connected_components, l: 'Syndicates', c: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: '9px', color: '#64748b' }}>{s.l}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={12} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search node..."
              style={{ padding: '5px 8px 5px 24px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#e2e8f0', fontSize: '11px', width: '140px', outline: 'none' }}
            />
          </div>
          <select
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
            style={{ padding: '5px 8px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#e2e8f0', fontSize: '11px' }}
          >
            <option value={100}>100 nodes</option>
            <option value={200}>200 nodes</option>
            <option value={500}>500 nodes</option>
          </select>
          <button onClick={fetchData} style={{ padding: '5px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', color: '#94a3b8', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={11} /> Refresh
          </button>
        </div>
      </div>

      {/* Graph */}
      <div style={{ flex: 1, position: 'relative' }}>
        {!loading && graphData.nodes.length > 0 && (
          <ForceGraph3D
            ref={graphRef}
            graphData={graphData}
            nodeLabel={(n: any) => `${n.name}${n.composite_score ? ` · Score: ${n.composite_score}` : ''}`}
            nodeColor={(n: any) => n.color}
            nodeVal={(n: any) => n.size || 4}
            linkColor={() => 'rgba(148,163,184,0.3)'}
            linkWidth={(l: any) => Math.min(l.value || 1, 3)}
            backgroundColor="#0f172a"
            onNodeClick={handleNodeClick}
            showNavInfo={false}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
          />
        )}

        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #1e293b', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: '#64748b', fontSize: '13px' }}>Building criminal network graph...</span>
          </div>
        )}

        {/* Search results */}
        {search && filteredNodes.length > 0 && (
          <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15,23,42,0.95)', borderRadius: '8px', padding: '8px', maxHeight: '200px', overflowY: 'auto', minWidth: '240px', border: '1px solid #334155' }}>
            {filteredNodes.slice(0, 8).map((n: any) => (
              <div key={n.id} onClick={() => { handleNodeClick(n); setSearch(''); }}
                style={{ padding: '6px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '11px', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1e293b')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.color }} />
                {n.name}
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(15,23,42,0.85)', borderRadius: '8px', padding: '10px 14px', border: '1px solid #1e293b' }}>
          {[
            { c: '#8b5cf6', l: 'Ringleader' },
            { c: '#ef4444', l: 'Suspect' },
            { c: '#3b82f6', l: 'FIR Case' },
            { c: '#f59e0b', l: 'Crime Type' },
          ].map((i, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: i.c }} />
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>{i.l}</span>
            </div>
          ))}
        </div>

        {/* Selected node */}
        {selected && (
          <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(15,23,42,0.92)', borderRadius: '10px', padding: '14px 16px', border: '1px solid #334155', minWidth: '200px' }}>
            <div style={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>{selected.name}</div>
            <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.8' }}>
              <div>Type: <span style={{ color: '#e2e8f0' }}>{selected.group}</span></div>
              {selected.pagerank !== undefined && <div>PageRank: <span style={{ color: '#a78bfa' }}>{selected.pagerank?.toFixed(6)}</span></div>}
              {selected.betweenness !== undefined && <div>Betweenness: <span style={{ color: '#60a5fa' }}>{selected.betweenness?.toFixed(4)}</span></div>}
              {selected.composite_score !== undefined && <div>Score: <span style={{ color: '#fbbf24' }}>{selected.composite_score}</span></div>}
              {selected.is_ringleader && <div style={{ color: '#8b5cf6', fontWeight: 700, marginTop: '4px' }}>⭐ Top Ringleader</div>}
            </div>
            <button onClick={() => setSelected(null)} style={{ marginTop: '8px', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '11px' }}>✕ Close</button>
          </div>
        )}

        {/* Top Ringleaders sidebar */}
        {ringleaders.length > 0 && (
          <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'rgba(15,23,42,0.88)', borderRadius: '10px', padding: '12px', border: '1px solid #1e293b', minWidth: '220px', maxWidth: '240px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#a78bfa', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={12} /> Top Ringleaders
            </div>
            {ringleaders.slice(0, 5).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', padding: '4px 6px', borderRadius: '6px', background: i === 0 ? 'rgba(139,92,246,0.15)' : 'transparent' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: i === 0 ? '#8b5cf6' : '#334155', color: '#fff', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {r.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: '#e2e8f0' }}>{r.name}</div>
                  <div style={{ fontSize: '9px', color: '#64748b' }}>Score: {r.composite_score}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
