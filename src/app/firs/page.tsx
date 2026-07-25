'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  FileText, 
  ChevronRight, 
  AlertTriangle, 
  Shield, 
  MapPin, 
  Calendar, 
  User, 
  Sparkles,
  Download,
  X
} from 'lucide-react';
import { RECENT_FIRS, FIRRecord } from '@/lib/kspMockData';

export default function FIRRegistryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGravity, setSelectedGravity] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedFir, setSelectedFir] = useState<FIRRecord | null>(null);
  const [moMatching, setMoMatching] = useState(false);

  const filteredFirs = RECENT_FIRS.filter(fir => {
    if (selectedGravity !== 'ALL' && fir.gravity !== selectedGravity) return false;
    if (selectedDistrict !== 'ALL' && fir.district !== selectedDistrict) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        fir.firNumber.toLowerCase().includes(q) ||
        fir.district.toLowerCase().includes(q) ||
        fir.crimeCategory.toLowerCase().includes(q) ||
        fir.accusedNames.some(a => a.toLowerCase().includes(q)) ||
        fir.moDescription.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSimulateMoSearch = () => {
    setMoMatching(true);
    setTimeout(() => {
      setMoMatching(false);
      if (filteredFirs.length > 0) setSelectedFir(filteredFirs[0]);
    }, 800);
  };

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
              <FileText className="w-5 h-5 text-yellow-400" />
              FIR Intelligence Vault & MO Similarity Search
            </h1>
            <p className="text-xs text-slate-400">
              Karnataka State Police SCRB — 24-Table Case Master Registry
            </p>
          </div>
        </div>

        <button 
          onClick={handleSimulateMoSearch}
          disabled={moMatching}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition shadow-md glow-blue"
        >
          <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
          <span>{moMatching ? 'Analyzing MO Cosine Vectors...' : 'Run MO Similarity Match'}</span>
        </button>
      </header>

      {/* Main Grid Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* Search & Filter Bar */}
        <div className="tactical-panel p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Keyword Search */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search FIR number, accused name, crime section, or MO description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 outline-none focus:border-yellow-400"
            />
          </div>

          {/* Gravity Filter */}
          <div>
            <select
              value={selectedGravity}
              onChange={(e) => setSelectedGravity(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-yellow-400 cursor-pointer"
            >
              <option value="ALL">All Gravity Levels</option>
              <option value="HEINOUS">🔴 Heinous Crimes</option>
              <option value="MAJOR">🟡 Major Crimes</option>
              <option value="MINOR">🟢 Minor Crimes</option>
            </select>
          </div>

          {/* District Filter */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-yellow-400 cursor-pointer"
            >
              <option value="ALL">All 31 Districts</option>
              <option value="Bengaluru City">Bengaluru City</option>
              <option value="Kalaburagi">Kalaburagi</option>
              <option value="Mangaluru City (DK)">Mangaluru City (DK)</option>
              <option value="Mysuru City">Mysuru City</option>
            </select>
          </div>

        </div>

        {/* FIR Cards Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Showing {filteredFirs.length} Recorded Case Files</span>
            <span>Sorted by Incident Date (Latest)</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredFirs.map(fir => (
              <div
                key={fir.id}
                onClick={() => setSelectedFir(fir)}
                className="tactical-card p-5 border border-slate-800 hover:border-yellow-500/40 cursor-pointer transition space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-extrabold text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 px-2.5 py-1 rounded">
                      {fir.firNumber}
                    </span>
                    <h3 className="text-sm font-bold text-white">{fir.crimeCategory}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                      fir.gravity === 'HEINOUS' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                    }`}>
                      {fir.gravity}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {fir.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Jurisdiction & PS:</span>
                    <span className="text-slate-200 font-medium">{fir.district} — {fir.policeStation}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Applicable Legal Acts:</span>
                    <div className="flex flex-wrap gap-1">
                      {fir.ipcSections.map(sec => (
                        <span key={sec} className="bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Primary Accused:</span>
                    <span className="text-yellow-400 font-bold">{fir.accusedNames.join(', ')}</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono">
                  <strong className="text-yellow-400">Modus Operandi:</strong> {fir.moDescription}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Case Dossier Detail Modal */}
      {selectedFir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#111827] border border-yellow-500/40 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4 glow-gold">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-400" />
                <h3 className="text-base font-extrabold text-white">CASE MASTER DOSSIER — {selectedFir.firNumber}</h3>
              </div>
              <button onClick={() => setSelectedFir(null)} className="text-slate-400 hover:text-white font-mono">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                <p><strong>District / Station:</strong> {selectedFir.district} — {selectedFir.policeStation}</p>
                <p><strong>Incident Date:</strong> {new Date(selectedFir.incidentDate).toLocaleString('en-IN')}</p>
                <p><strong>Status:</strong> <span className="text-yellow-400 font-bold">{selectedFir.status}</span></p>
                <p><strong>Victim Profile:</strong> {selectedFir.victimName}</p>
                <p><strong>Accused Suspects:</strong> <span className="text-red-400 font-bold">{selectedFir.accusedNames.join(', ')}</span></p>
              </div>

              <div>
                <h4 className="font-bold text-slate-300 mb-1">Detailed Case Synopsis & Evidence Log:</h4>
                <p className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-slate-300 font-mono leading-relaxed">
                  {selectedFir.synopsis}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-300 mb-1">Full Modus Operandi Text:</h4>
                <p className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-yellow-300/90 font-mono leading-relaxed">
                  {selectedFir.moDescription}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400 font-mono">Risk Index: <strong>{selectedFir.riskIndex} / 100</strong></span>
              <button
                onClick={() => { alert(`Exporting Case Brief for ${selectedFir.firNumber}...`); setSelectedFir(null); }}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-xs font-bold rounded-lg transition shadow-md glow-gold"
              >
                Download Smart Case Brief (PDF)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
