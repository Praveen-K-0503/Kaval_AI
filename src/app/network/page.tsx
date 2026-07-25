'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, 
  RefreshCw, 
  Award, 
  Network, 
  Search, 
  User, 
  ShieldAlert, 
  FileText, 
  Layers, 
  Maximize2,
  Sliders,
  ChevronRight,
  UserX
} from 'lucide-react';
import { CRIMINAL_SYNDICATE_NODES, CriminalNode } from '@/lib/kspMockData';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://kaavalai-backend-50044342834.development.catalystappsail.in';

const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[500px] flex items-center justify-center flex-col gap-3 text-slate-400 bg-slate-950">
      <div className="w-10 h-10 border-4 border-slate-800 border-t-yellow-400 rounded-full animate-spin" />
      <span className="text-xs font-mono text-slate-300">Initializing 3D Syndicate Graph Engine...</span>
    </div>
  ),
});

const ROLE_COLORS: Record<string, string> = {
  GANG_LEADER: '#ef4444',   // Red
  LIEUTENANT: '#f59e0b',    // Gold
  OPERATIVE: '#3b82f6',     // Blue
  ASSOCIATE: '#10b981',     // Green
};

export default function NetworkPage() {
  const graphRef = useRef<any>(null);
  const [selectedSyndicate, setSelectedSyndicate] = useState<string>('ALL');
  const [selectedNode, setSelectedNode] = useState<CriminalNode | null>(CRIMINAL_SYNDICATE_NODES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Generate 3D graph representation from mock nodes & links
  const graphData = React.useMemo(() => {
    let filteredNodes = CRIMINAL_SYNDICATE_NODES;
    if (selectedSyndicate !== 'ALL') {
      filteredNodes = CRIMINAL_SYNDICATE_NODES.filter(n => n.syndicate === selectedSyndicate);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filteredNodes = filteredNodes.filter(n => 
        n.name.toLowerCase().includes(q) || 
        n.alias.toLowerCase().includes(q) || 
        n.district.toLowerCase().includes(q)
      );
    }

    const nodeIds = new Set(filteredNodes.map(n => n.id));
    const links: { source: string; target: string; value: number }[] = [];

    filteredNodes.forEach(node => {
      node.connections.forEach(targetId => {
        if (nodeIds.has(targetId)) {
          links.push({ source: node.id, target: targetId, value: 2 });
        }
      });
    });

    return {
      nodes: filteredNodes.map(n => ({
        ...n,
        color: ROLE_COLORS[n.role] || '#94a3b8',
        val: n.role === 'GANG_LEADER' ? 14 : n.role === 'LIEUTENANT' ? 10 : 6
      })),
      links
    };
  }, [selectedSyndicate, searchQuery]);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
    if (graphRef.current) {
      const distance = 120;
      const ratio = 1 + distance / Math.hypot(node.x || 0, node.y || 0, node.z || 0);
      graphRef.current.cameraPosition(
        { x: (node.x || 0) * ratio, y: (node.y || 0) * ratio, z: (node.z || 0) * ratio },
        node,
        1500
      );
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      
      {/* Header Bar */}
      <header className="bg-slate-900/90 border-b border-yellow-500/20 px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 bg-slate-800 hover:bg-slate-700 text-yellow-400 rounded-lg transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-yellow-400" />
              3D Criminal Syndicate Network Analyzer
            </h1>
            <p className="text-xs text-slate-400">
              Karnataka State Police — Organised Crime Linkage Engine & Centrality Scoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            Active Syndicate Nodes: <strong className="text-yellow-400">{graphData.nodes.length}</strong>
          </span>
          <button 
            onClick={() => { setSelectedSyndicate('ALL'); setSearchQuery(''); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Camera
          </button>
        </div>
      </header>

      {/* Main 3D Graph & Sidebar Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
        
        {/* Left Control Panel & Inspector */}
        <div className="lg:col-span-1 border-r border-slate-800 bg-[#0f172a]/95 p-5 space-y-6 overflow-y-auto">
          
          {/* Search Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 tracking-wide flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-yellow-400" />
              SEARCH CRIMINAL SUSPECT
            </label>
            <input
              type="text"
              placeholder="Search name, alias, or district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-yellow-400"
            />
          </div>

          {/* Syndicate Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 tracking-wide flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-yellow-400" />
              SELECT SYNDICATE NETWORK
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {[
                { id: 'ALL', label: 'All Criminal Syndicates' },
                { id: 'D-Gang South Syndicate', label: 'D-Gang South Syndicate' },
                { id: 'Kaveri Sand Mafia', label: 'Kaveri Sand Mafia' },
                { id: 'Cyber Fraud Syndicate', label: 'Cyber Fraud Syndicate' },
              ].map(syn => (
                <button
                  key={syn.id}
                  onClick={() => setSelectedSyndicate(syn.id)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg text-left transition flex items-center justify-between ${
                    selectedSyndicate === syn.id 
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40' 
                      : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span>{syn.label}</span>
                  {selectedSyndicate === syn.id && <ChevronRight className="w-3.5 h-3.5 text-yellow-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Role Color Legend */}
          <div className="tactical-card p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 tracking-wider">HIERARCHY LEGEND</h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-slate-300">Gang Leader</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /><span className="text-slate-300">Lieutenant</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-slate-300">Operative</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-slate-300">Associate</span></div>
            </div>
          </div>

          {/* Selected Suspect Detailed Inspector Card */}
          {selectedNode && (
            <div className="tactical-panel p-4 space-y-3 border-yellow-500/40 glow-gold animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-yellow-400" />
                  <h3 className="text-sm font-bold text-white">SUSPECT PROFILE DOSSIER</h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedNode.status === 'WANTED' ? 'bg-red-500/20 text-red-400 border border-red-500/40' :
                  selectedNode.status === 'IN_CUSTODY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                  'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                }`}>
                  {selectedNode.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div><span className="text-slate-400">Full Name:</span> <strong className="text-white font-semibold">{selectedNode.name}</strong></div>
                <div><span className="text-slate-400">Alias:</span> <span className="text-yellow-400 font-mono font-bold">"{selectedNode.alias}"</span></div>
                <div><span className="text-slate-400">Syndicate:</span> <span className="text-slate-200">{selectedNode.syndicate}</span></div>
                <div><span className="text-slate-400">Jurisdiction:</span> <span className="text-slate-200">{selectedNode.district}</span></div>
                <div><span className="text-slate-400">Risk Score:</span> <span className="text-red-400 font-mono font-extrabold">{selectedNode.riskScore} / 100</span></div>
                <div><span className="text-slate-400">Active FIRs:</span> <span className="text-slate-200 font-semibold">{selectedNode.activeCases} Cases</span></div>
                <div className="pt-1"><span className="text-slate-400 block mb-0.5">Primary Modus Operandi:</span>
                  <p className="bg-slate-900 p-2 rounded text-[11px] text-slate-300 font-mono border border-slate-800">
                    {selectedNode.mo}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right 3D Force Graph Workspace */}
        <div className="lg:col-span-3 bg-slate-950 relative">
          <ForceGraph3D
            ref={graphRef}
            graphData={graphData}
            nodeLabel={(node: any) => `${node.name} ("${node.alias}") — ${node.role}`}
            nodeColor={(node: any) => node.color}
            nodeVal={(node: any) => node.val}
            linkColor={() => 'rgba(234, 179, 8, 0.4)'}
            linkWidth={1.5}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.005}
            onNodeClick={handleNodeClick}
            backgroundColor="#0b0f19"
          />

          {/* Floating Instructions Tag */}
          <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-800 backdrop-blur-md px-4 py-2 rounded-xl text-xs text-slate-400 flex items-center gap-3">
            <span>🖱️ <strong>Left-Click + Drag:</strong> Rotate 3D View</span>
            <span>Scroll: Zoom</span>
            <span>Click Node: Inspect Profile</span>
          </div>
        </div>

      </div>

    </div>
  );
}
