'use client';

import React, { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowLeft, Search, Network, User, Layers, ChevronRight, RefreshCw, Share2, FileText
} from 'lucide-react';
import { CRIMINAL_SYNDICATE_NODES, CriminalNode, RECENT_FIRS } from '@/lib/kspMockData';

// FIR-Accused bipartite graph data (FIR nodes = gold squares, Accused = maroon spheres)
const BIPARTITE_GRAPH = (() => {
  const nodes: any[] = [];
  const links: any[] = [];
  const firSet = new Set<string>();
  const accusedSet = new Set<string>();
  RECENT_FIRS.slice(0, 8).forEach(fir => {
    const firNodeId = `FIR_${fir.firNumber}`;
    if (!firSet.has(firNodeId)) {
      nodes.push({ id: firNodeId, label: fir.firNumber, type: 'FIR', district: fir.district, gravity: fir.gravity, color: fir.gravity === 'HEINOUS' ? '#C8960C' : fir.gravity === 'MAJOR' ? '#B87333' : '#D4B896', val: fir.gravity === 'HEINOUS' ? 12 : 8, isFir: true });
      firSet.add(firNodeId);
    }
    fir.accusedNames.forEach((name, i) => {
      const accId = `ACC_${name.replace(/\s+/g, '_')}`;
      if (!accusedSet.has(accId)) {
        nodes.push({ id: accId, label: name, type: 'ACCUSED', color: '#8B1A1A', val: 6, isFir: false });
        accusedSet.add(accId);
      }
      links.push({ source: firNodeId, target: accId, color: fir.gravity === 'HEINOUS' ? '#8B1A1A' : '#C8960C', value: i === 0 ? 3 : 1 });
    });
  });
  return { nodes, links };
})();

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100%', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '14px', background: '#FBF6EE' }}>
      <div style={{ width: '44px', height: '44px', border: '4px solid #F2E8D9', borderTopColor: '#8B1A1A', borderRadius: '50%', animation: 'spinSlow 0.9s linear infinite' }} />
      <span style={{ fontSize: '13px', color: '#9B7560', fontWeight: 600 }}>Loading 3D Graph Engine…</span>
    </div>
  ),
});

const ROLE_COLORS: Record<string, string> = {
  GANG_LEADER: '#8B1A1A',
  LIEUTENANT:  '#C8960C',
  OPERATIVE:   '#2D5016',
  ASSOCIATE:   '#B87333',
};

const BADGE_STYLE: Record<string, { bg: string; color: string }> = {
  WANTED:             { bg: '#FEE2E2', color: '#991B1B' },
  IN_CUSTODY:         { bg: '#D1FAE5', color: '#065F46' },
  BAIL:               { bg: '#FEF3C7', color: '#92400E' },
  UNDER_SURVEILLANCE: { bg: '#EDE9FE', color: '#6D28D9' },
};

export default function NetworkPage() {
  const graphRef = useRef<any>(null);
  const [selectedSyndicate, setSelectedSyndicate] = useState<string>('ALL');
  const [selectedNode, setSelectedNode] = useState<CriminalNode | null>(CRIMINAL_SYNDICATE_NODES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'syndicate' | 'bipartite'>('syndicate');

  const graphData = React.useMemo(() => {
    if (viewMode === 'bipartite') return BIPARTITE_GRAPH;
    let filtered = CRIMINAL_SYNDICATE_NODES;
    if (selectedSyndicate !== 'ALL') filtered = filtered.filter(n => n.syndicate === selectedSyndicate);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(n =>
        n.name.toLowerCase().includes(q) || n.alias.toLowerCase().includes(q) || n.district.toLowerCase().includes(q)
      );
    }
    const ids = new Set(filtered.map(n => n.id));
    const links: { source: string; target: string; value: number }[] = [];
    filtered.forEach(n => n.connections.forEach(t => { if (ids.has(t)) links.push({ source: n.id, target: t, value: 2 }); }));
    return {
      nodes: filtered.map(n => ({ ...n, color: ROLE_COLORS[n.role] || '#B87333', val: n.role === 'GANG_LEADER' ? 14 : n.role === 'LIEUTENANT' ? 10 : 6 })),
      links,
    };
  }, [selectedSyndicate, searchQuery, viewMode]);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
    if (graphRef.current) {
      const d = 120;
      const ratio = 1 + d / Math.hypot(node.x || 0, node.y || 0, node.z || 0);
      graphRef.current.cameraPosition({ x: (node.x || 0) * ratio, y: (node.y || 0) * ratio, z: (node.z || 0) * ratio }, node, 1400);
    }
  }, []);

  const syndicates = [
    { id: 'ALL',                    label: 'All Syndicates' },
    { id: 'D-Gang South Syndicate', label: 'D-Gang South' },
    { id: 'Kaveri Sand Mafia',      label: 'Kaveri Sand Mafia' },
    { id: 'Cyber Fraud Syndicate',  label: 'Cyber Fraud Ring' },
  ];

  // Degree centrality: count direct connections for each node
  const centralityRanking = React.useMemo(() => {
    return [...CRIMINAL_SYNDICATE_NODES]
      .map(n => ({
        ...n,
        degree: n.connections.length,
        // Weighted centrality: connections + risk contribution
        centrality: Math.round((n.connections.length / (CRIMINAL_SYNDICATE_NODES.length - 1)) * 100 * (n.riskScore / 100)),
      }))
      .sort((a, b) => b.centrality - a.centrality)
      .slice(0, 5);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#FBF6EE', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #8B1A1A 0%, #A52020 100%)', borderBottom: '3px solid #C8960C', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '14px', minHeight: '60px', boxShadow: '0 4px 16px rgba(139,26,26,0.25)' }}>
        <Link href="/" style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none', transition: 'background 0.2s' }}>
          <ArrowLeft size={16} />
        </Link>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <Network size={18} style={{ opacity: 0.9, flexShrink: 0 }} /> Criminal Network Analyzer
          </h1>
          <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontWeight: 500, whiteSpace: 'nowrap' }}>
            KSP · Organised Crime Linkage · Bipartite Graph
          </p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* View Mode Toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '3px', gap: '3px' }}>
            <button onClick={() => setViewMode('syndicate')} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, background: viewMode === 'syndicate' ? 'rgba(255,255,255,0.25)' : 'transparent', color: '#fff', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
              <Network size={12} /> Syndicates
            </button>
            <button onClick={() => { setViewMode('bipartite'); setSelectedNode(null); }} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, background: viewMode === 'bipartite' ? 'rgba(200,150,12,0.4)' : 'transparent', color: viewMode === 'bipartite' ? '#FDE68A' : '#fff', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
              <Share2 size={12} /> FIR ↔ Accused
            </button>
          </div>
          <button onClick={() => { setSelectedSyndicate('ALL'); setSearchQuery(''); graphRef.current?.cameraPosition({ x: 0, y: 0, z: 300 }, { x: 0, y: 0, z: 0 }, 800); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: '8px', color: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <RefreshCw size={13} /> Reset
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr', overflow: 'hidden' }}>

        {/* Left Control Panel */}
        <div style={{ borderRight: '1px solid #E8D4BA', background: '#fff', padding: '20px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Search */}
          <div>
            <div className="section-heading" style={{ marginBottom: '8px' }}>{viewMode === 'bipartite' ? 'Graph Legend' : 'Search Suspect'}</div>
            {viewMode === 'bipartite' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '10px 12px', background: '#FFF8EF', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#92400E', marginBottom: '8px' }}>📊 FIR ↔ Accused Bipartite Graph</div>
                  <div style={{ fontSize: '11px', color: '#5C3D2E', lineHeight: 1.5 }}>
                    Each FIR node links to the accused persons it involves. Click any node to highlight its connections.
                  </div>
                </div>
                {[
                  { color: '#C8960C', label: 'HEINOUS FIR Node', shape: '■ Square' },
                  { color: '#B87333', label: 'MAJOR FIR Node', shape: '■ Square' },
                  { color: '#8B1A1A', label: 'Accused Person', shape: '● Circle' },
                ].map((l, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', background: '#FBF6EE', borderRadius: '6px', border: '1px solid #E8D4BA' }}>
                    <div style={{ width: '14px', height: '14px', background: l.color, borderRadius: i < 2 ? '2px' : '50%', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#1C0A00' }}>{l.label}</div>
                      <div style={{ fontSize: '10px', color: '#9B7560' }}>{l.shape}</div>
                    </div>
                  </div>
                ))}
                <div style={{ padding: '10px 12px', background: '#FEE2E2', borderRadius: '8px', border: '1px solid #FECACA', fontSize: '11px', color: '#991B1B' }}>
                  <strong>DB Schema:</strong> CaseMaster ↔ CriminalRecord · AccusedMasterID links across 8 recent FIRs shown
                </div>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9B7560' }} />
                <input
                  type="text" placeholder="Name, alias, or district…"
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', paddingLeft: '32px', paddingRight: '10px', paddingTop: '9px', paddingBottom: '9px', border: '1.5px solid #E8D4BA', borderRadius: '8px', fontSize: '12px', color: '#1C0A00', outline: 'none', boxSizing: 'border-box', background: '#FFF8EF', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
                  onFocus={e => (e.target.style.borderColor = '#8B1A1A')}
                  onBlur={e => (e.target.style.borderColor = '#E8D4BA')}
                />
              </div>
            )}
          </div>

          {/* Syndicate Filter — hidden in bipartite mode */}
          {viewMode === 'syndicate' && <div>
            <div className="section-heading" style={{ marginBottom: '8px' }}>Criminal Syndicate</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {syndicates.map(s => {
                const active = selectedSyndicate === s.id;
                return (
                  <button key={s.id} onClick={() => setSelectedSyndicate(s.id)} style={{
                    padding: '9px 12px', borderRadius: '8px', textAlign: 'left', fontSize: '12px', fontWeight: active ? 700 : 600,
                    background: active ? 'linear-gradient(135deg, #8B1A1A, #A52020)' : '#FFF8EF',
                    color: active ? '#fff' : '#5C3D2E',
                    border: active ? '1px solid #8B1A1A' : '1px solid #E8D4BA',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    boxShadow: active ? '0 4px 12px rgba(139,26,26,0.25)' : 'none',
                  }}>
                    {s.label}
                    {active && <ChevronRight size={13} />}
                  </button>

                );
              })}
            </div>
          </div>}

          {/* Legend */}
          <div className="ksp-panel" style={{ padding: '14px' }}>
            <div className="section-heading" style={{ marginBottom: '10px' }}>Hierarchy Legend</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {Object.entries({ GANG_LEADER: 'Gang Leader', LIEUTENANT: 'Lieutenant', OPERATIVE: 'Operative', ASSOCIATE: 'Associate' }).map(([role, label]) => (
                <div key={role} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11px', fontWeight: 600, color: '#5C3D2E' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: ROLE_COLORS[role], display: 'inline-block', flexShrink: 0 }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Centrality Leaderboard ── */}
          {viewMode === 'syndicate' && (
            <div className="ksp-panel" style={{ padding: '14px' }}>
              <div className="section-heading" style={{ marginBottom: '4px' }}>🏆 Centrality Ranking</div>
              <div style={{ fontSize: '10px', color: '#9B7560', marginBottom: '10px' }}>Degree centrality · Who to arrest first</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {centralityRanking.map((n, i) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      setSelectedNode(n);
                      const node = graphData.nodes.find((gn: any) => gn.id === n.id);
                      if (node && graphRef.current) {
                        const d = 120;
                        const ratio = 1 + d / Math.hypot(node.x || 0, node.y || 0, node.z || 0);
                        graphRef.current.cameraPosition({ x: (node.x || 0) * ratio, y: (node.y || 0) * ratio, z: (node.z || 0) * ratio }, node, 1200);
                      }
                    }}
                    style={{ cursor: 'pointer', padding: '8px 10px', borderRadius: '8px', border: '1px solid #E8D4BA', background: '#fff', transition: 'all 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#C8960C'; (e.currentTarget as HTMLElement).style.background = '#FFF8EF'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E8D4BA'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px' }}>
                      <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: i === 0 ? '#C8960C' : i === 1 ? '#9B7560' : '#B87333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>#{i + 1}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#1C0A00', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{n.name.split("'")[0].trim()}</span>
                      <span style={{ fontSize: '10px', fontFamily: "'DM Mono',monospace", fontWeight: 800, color: '#8B1A1A' }}>{n.centrality}</span>
                    </div>
                    <div style={{ height: '5px', background: '#F2E8D9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${n.centrality}%`, background: `linear-gradient(90deg, #8B1A1A, #C8960C)`, borderRadius: '3px', transition: 'width 0.5s ease' }} />
                    </div>
                    <div style={{ fontSize: '9px', color: '#9B7560', marginTop: '3px' }}>{n.degree} connections · {n.role.replace(/_/g, ' ')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suspect Inspector */}
          {selectedNode && (
            <div className="ksp-panel animate-fade-in" style={{ padding: '16px', borderLeft: '4px solid #8B1A1A' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid #F2E8D9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FFF8EF', border: '1px solid #E8D4BA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B1A1A' }}>
                    <User size={15} />
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#1C0A00' }}>SUSPECT DOSSIER</div>
                </div>
                {selectedNode.status && BADGE_STYLE[selectedNode.status] && (
                  <span className={`badge-${selectedNode.status.toLowerCase().replace(/_/g, '-')}`} style={{ fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '20px', ...BADGE_STYLE[selectedNode.status] }}>
                    {selectedNode.status.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '11px' }}>
                <div><span style={{ color: '#9B7560' }}>Full Name: </span><strong style={{ color: '#1C0A00' }}>{selectedNode.name}</strong></div>
                <div><span style={{ color: '#9B7560' }}>Alias: </span><span style={{ color: '#C8960C', fontWeight: 800, fontFamily: "'DM Mono', monospace" }}>"{selectedNode.alias}"</span></div>
                <div><span style={{ color: '#9B7560' }}>Syndicate: </span><span style={{ color: '#5C3D2E', fontWeight: 600 }}>{selectedNode.syndicate}</span></div>
                <div><span style={{ color: '#9B7560' }}>Jurisdiction: </span><span style={{ color: '#5C3D2E', fontWeight: 600 }}>{selectedNode.district}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#FEF2F2', padding: '7px 10px', borderRadius: '7px', marginTop: '4px' }}>
                  <span style={{ color: '#9B7560' }}>Risk Score</span>
                  <strong style={{ color: '#8B1A1A', fontFamily: "'DM Mono', monospace" }}>{selectedNode.riskScore} / 100</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#FFF8EF', padding: '7px 10px', borderRadius: '7px' }}>
                  <span style={{ color: '#9B7560' }}>Active FIRs</span>
                  <strong style={{ color: '#C8960C', fontFamily: "'DM Mono', monospace" }}>{selectedNode.activeCases} cases</strong>
                </div>
                <div style={{ marginTop: '4px' }}>
                  <div style={{ color: '#9B7560', marginBottom: '4px' }}>Modus Operandi:</div>
                  <div style={{ background: '#FBF6EE', padding: '8px 10px', borderRadius: '7px', border: '1px solid #E8D4BA', fontSize: '10px', color: '#5C3D2E', fontFamily: "'DM Mono', monospace", lineHeight: 1.5 }}>
                    {selectedNode.mo}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 3D Graph Canvas */}
        <div style={{ position: 'relative', background: '#FBF6EE' }}>
          <ForceGraph3D
            ref={graphRef}
            graphData={graphData}
            nodeLabel={(n: any) => `${n.name} ("${n.alias}") — ${n.role}`}
            nodeColor={(n: any) => n.color}
            nodeVal={(n: any) => n.val}
            linkColor={() => 'rgba(200,150,12,0.5)'}
            linkWidth={1.5}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            onNodeClick={handleNodeClick}
            backgroundColor="#FBF6EE"
          />
          <div style={{ position: 'absolute', bottom: '16px', right: '16px', background: 'rgba(255,255,255,0.92)', border: '1px solid #E8D4BA', backdropFilter: 'blur(8px)', padding: '8px 14px', borderRadius: '10px', fontSize: '11px', color: '#6B4226', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 12px rgba(139,26,26,0.1)' }}>
            <span>🖱️ <strong>Left-click + drag:</strong> Rotate</span>
            <span>Scroll: Zoom</span>
            <span>Click node: Inspect suspect</span>
          </div>
        </div>

      </div>
    </div>
  );
}
