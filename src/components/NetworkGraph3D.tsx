'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Network, Users, Link2, Award, RefreshCw, Maximize2, Info } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Dynamically import ForceGraph3D — no SSR (uses WebGL)
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '12px', color: '#64748b',
    }}>
      <div style={{
        width: '40px', height: '40px', border: '3px solid #e2e8f0',
        borderTopColor: '#1d4ed8', borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <span style={{ fontSize: '13px' }}>Loading 3D Graph Engine...</span>
    </div>
  ),
});

interface GraphNode {
  id: string;
  name: string;
  group: string;
  val: number;
  pagerank?: number;
  composite_score?: number;
  is_ringleader?: boolean;
  person_id?: string;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
}

interface NetworkData {
  nodes: GraphNode[];
  links: GraphLink[];
  graph_stats?: {
    total_nodes: number;
    total_edges: number;
    accused_nodes: number;
    fir_nodes: number;
    density: number;
    connected_components: number;
  };
  top_ringleaders?: Array<{
    rank: number;
    name: string;
    person_id: string;
    composite_score: number;
    pagerank: number;
  }>;
  model?: string;
}

const NODE_COLORS: Record<string, string> = {
  Accused: '#dc2626',       // Red for suspects
  FIR: '#1d4ed8',           // Blue for cases
  CrimeCategory: '#d97706', // Amber for crime types
};

const NODE_COLORS_RINGLEADER = '#7c3aed'; // Purple for top ringleaders

export default function NetworkGraph3D({ data }: { data: any }) {
  const graphRef = useRef<any>(null);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] } | null>(null);
  const [stats, setStats] = useState<NetworkData['graph_stats'] | null>(null);
  const [ringleaders, setRingleaders] = useState<NetworkData['top_ringleaders']>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [loading, setLoading] = useState(true);
  const [model, setModel] = useState('');
  const [is3D, setIs3D] = useState(true);

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/ml/network-analysis?limit=150`);
      const d: NetworkData = await res.json();

      // Build graph data for react-force-graph-3d
      const nodes = (d.nodes || []).map(n => ({
        ...n,
        id: n.id,
        color: n.is_ringleader ? NODE_COLORS_RINGLEADER : NODE_COLORS[n.group] || '#94a3b8',
        size: n.is_ringleader ? 8 : (n.group === 'CrimeCategory' ? 6 : 4),
      }));

      const links = (d.links || []).map(l => ({
        source: l.source,
        target: l.target,
        value: l.value || 1,
      }));

      setGraphData({ nodes, links });
      setStats(d.graph_stats || null);
      setRingleaders(d.top_ringleaders || []);
      setModel(d.model || 'NetworkX');
    } catch (err) {
      // Fallback to legacy /api/network endpoint
      try {
        const res = await fetch(`${API}/api/network`);
        const d = await res.json();
        const nodes = (d.nodes || []).map((n: any) => ({
          ...n,
          color: NODE_COLORS[n.group] || '#94a3b8',
        }));
        setGraphData({ nodes, links: d.links || [] });
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = useCallback((node: any, _event: MouseEvent) => {
    setSelectedNode(node as GraphNode);
    // Camera zoom-in on clicked node
    if (graphRef.current && node) {
      const dist = 80;
      const distRatio = 1 + dist / Math.hypot(node.x || 0, node.y || 0, node.z || 0);
      graphRef.current.cameraPosition(
        { x: (node.x || 0) * distRatio, y: (node.y || 0) * distRatio, z: (node.z || 0) * distRatio },
        node,
        1500
      );
    }
  }, []);

  const resetCamera = () => {
    if (graphRef.current) graphRef.current.cameraPosition({ x: 0, y: 0, z: 400 }, { x: 0, y: 0, z: 0 }, 1000);
    setSelectedNode(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#fff', borderRadius: '10px', padding: '12px 16px',
        border: '1px solid #e2e8f0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#fef2f2', borderRadius: '8px', padding: '6px' }}>
            <Network size={18} color="#dc2626" />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Criminal Syndicate Network</div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>
              {model || 'NetworkX PageRank + Betweenness Centrality'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={resetCamera} style={{
            background: '#f1f5f9', border: 'none', borderRadius: '6px',
            padding: '6px 10px', cursor: 'pointer', color: '#64748b', fontSize: '11px',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <RefreshCw size={12} /> Reset View
          </button>
          <button onClick={fetchNetworkData} style={{
            background: '#eff6ff', border: 'none', borderRadius: '6px',
            padding: '6px 10px', cursor: 'pointer', color: '#1d4ed8', fontSize: '11px',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Row */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {[
            { label: 'Total Nodes', value: stats.total_nodes, icon: '⬡', color: '#1d4ed8' },
            { label: 'Connections', value: stats.total_edges, icon: '🔗', color: '#d97706' },
            { label: 'Suspects', value: stats.accused_nodes, icon: '👤', color: '#dc2626' },
            { label: 'FIR Cases', value: stats.fir_nodes, icon: '📋', color: '#059669' },
          ].map((s, i) => (
            <div key={i} style={{
              background: '#fff', borderRadius: '8px', padding: '10px',
              border: '1px solid #e2e8f0', textAlign: 'center',
            }}>
              <div style={{ fontSize: '16px', marginBottom: '2px' }}>{s.icon}</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* 3D Graph Canvas */}
      <div style={{
        flex: 1, minHeight: '320px', background: '#0f172a',
        borderRadius: '12px', overflow: 'hidden', position: 'relative',
        border: '1px solid #1e293b',
      }}>
        {loading ? (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column', gap: '12px',
          }}>
            <div style={{
              width: '36px', height: '36px', border: '3px solid #334155',
              borderTopColor: '#1d4ed8', borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            <span style={{ color: '#64748b', fontSize: '12px' }}>Building network graph...</span>
          </div>
        ) : graphData ? (
          <ForceGraph3D
            ref={graphRef}
            graphData={graphData}
            nodeLabel={(node: any) => `${node.name} · Score: ${node.composite_score || 0}`}
            nodeColor={(node: any) => node.color || '#94a3b8'}
            nodeVal={(node: any) => node.val || 4}
            linkColor={() => 'rgba(148,163,184,0.4)'}
            linkWidth={(link: any) => Math.min(link.value || 1, 4)}
            backgroundColor="#0f172a"
            onNodeClick={handleNodeClick}
            nodeThreeObjectExtend={false}
            showNavInfo={false}
            enableNodeDrag={true}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
          />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '13px' }}>
            Failed to load graph data
          </div>
        )}

        {/* Legend overlay */}
        <div style={{
          position: 'absolute', bottom: '12px', left: '12px',
          background: 'rgba(15,23,42,0.85)', borderRadius: '8px',
          padding: '8px 12px', backdropFilter: 'blur(4px)',
        }}>
          {[
            { color: '#7c3aed', label: 'Ringleader' },
            { color: '#dc2626', label: 'Suspect' },
            { color: '#1d4ed8', label: 'FIR Case' },
            { color: '#d97706', label: 'Crime Type' },
          ].map((l, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color }} />
              <span style={{ fontSize: '9px', color: '#94a3b8' }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Selected node panel */}
        {selectedNode && (
          <div style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'rgba(15,23,42,0.92)', borderRadius: '10px',
            padding: '12px 14px', backdropFilter: 'blur(4px)', minWidth: '180px',
          }}>
            <div style={{ color: '#e2e8f0', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
              {selectedNode.name}
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.8' }}>
              <div>Type: <span style={{ color: '#e2e8f0' }}>{selectedNode.group}</span></div>
              {selectedNode.pagerank !== undefined && (
                <div>PageRank: <span style={{ color: '#a78bfa' }}>{selectedNode.pagerank?.toFixed(5)}</span></div>
              )}
              {selectedNode.composite_score !== undefined && (
                <div>Score: <span style={{ color: '#fbbf24' }}>{selectedNode.composite_score}</span></div>
              )}
              {selectedNode.is_ringleader && (
                <div style={{ color: '#7c3aed', fontWeight: 700, marginTop: '4px' }}>⭐ Top Ringleader</div>
              )}
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              style={{ marginTop: '8px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '11px' }}
            >
              ✕ Close
            </button>
          </div>
        )}
      </div>

      {/* Top Ringleaders */}
      {ringleaders && ringleaders.length > 0 && (
        <div style={{ background: '#fff', borderRadius: '10px', padding: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={14} color="#7c3aed" /> Top Network Ringleaders (by Composite Centrality Score)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {ringleaders.slice(0, 5).map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '6px 10px', background: i === 0 ? '#fdf4ff' : '#f8fafc',
                borderRadius: '6px', border: `1px solid ${i === 0 ? '#e9d5ff' : '#f1f5f9'}`,
              }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: i === 0 ? '#7c3aed' : '#64748b',
                  color: '#fff', fontSize: '10px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {r.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{r.name}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>PageRank: {r.pagerank?.toFixed(4)}</div>
                </div>
                <div style={{
                  background: i === 0 ? '#7c3aed' : '#e2e8f0',
                  color: i === 0 ? '#fff' : '#64748b',
                  fontSize: '11px', fontWeight: 700,
                  padding: '2px 8px', borderRadius: '20px',
                }}>
                  {r.composite_score}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
