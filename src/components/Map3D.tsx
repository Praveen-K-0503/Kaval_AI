'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Layers, Radio } from 'lucide-react';

interface DistrictData {
  district_id: number;
  district_name: string;
  lat: number;
  lng: number;
  crime_count: number;
  risk_score: number;
  is_red_zone: boolean;
  recommended_beat_patrols: number;
}

interface Map3DProps {
  districts: DistrictData[];
}

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

export default function Map3D({ districts }: Map3DProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const redZones = districts.filter((d) => d.is_red_zone);

  return (
    <div className="executive-light-panel p-5 relative overflow-hidden flex flex-col h-[580px]">
      {/* Card Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 z-10">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-700" />
            <h2 className="text-base font-bold text-slate-900 tracking-wide">3D Spatiotemporal Geospatial Map</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">Interactive district crime density map across Karnataka (31 Districts)</p>
        </div>

        {/* Crime Category Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-600 font-medium">Crime Layer:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-700 font-medium"
          >
            <option value="All">All Crime Categories</option>
            <option value="Heinous">Heinous & Violent Offence</option>
            <option value="Property">Property & Theft</option>
            <option value="Cyber">Cybercrime & Bank Fraud</option>
          </select>
        </div>
      </div>

      {/* Red Zone Banner Ticker */}
      <div className="my-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between z-10">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-rose-700" />
          <span className="text-xs font-semibold text-rose-900">
            EMERGENCY ALERT: {redZones.length} Districts flagged for active spatial crime density spikes
          </span>
        </div>
        <span className="text-[10px] bg-rose-200 text-rose-800 px-2 py-0.5 rounded font-mono font-bold">SCRB Real-Time Radar</span>
      </div>

      {/* Map Canvas */}
      <div className="w-full flex-1 rounded-xl overflow-hidden relative border border-slate-200 z-0">
        {mounted && (
          <MapContainer
            center={[13.9299, 75.8]}
            zoom={7}
            scrollWheelZoom={false}
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            {districts.map((dist) => {
              const radius = Math.max(10, Math.min(26, dist.crime_count / 4.5));
              const color = dist.is_red_zone ? '#dc2626' : dist.risk_score > 70 ? '#d97706' : '#059669';

              return (
                <CircleMarker
                  key={dist.district_id}
                  center={[dist.lat, dist.lng]}
                  radius={radius}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: dist.is_red_zone ? 0.7 : 0.45,
                    weight: dist.is_red_zone ? 2.5 : 1.5,
                  }}
                >
                  <Popup>
                    <div className="p-2 space-y-1 text-slate-900 min-w-[210px]">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                        <span className="font-bold text-sm text-blue-800">{dist.district_name}</span>
                        {dist.is_red_zone ? (
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded">
                            RED ZONE
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                            NORMAL
                          </span>
                        )}
                      </div>
                      <div className="text-xs space-y-1 text-slate-600 pt-1">
                        <div className="flex justify-between">
                          <span>Total FIR Records:</span>
                          <span className="font-bold text-slate-900">{dist.crime_count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Risk Index:</span>
                          <span className="font-bold text-amber-700">{dist.risk_score}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Patrol Deployment:</span>
                          <span className="font-bold text-emerald-700">{dist.recommended_beat_patrols} Beats</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-between pt-3 text-xs text-slate-500 z-10">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 inline-block" />
            <span className="text-slate-700 font-medium">Critical Red Zone</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-600 inline-block" />
            <span className="text-slate-700 font-medium">Elevated Watch</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" />
            <span className="text-slate-700 font-medium">Standard Jurisdiction</span>
          </div>
        </div>
        <span className="text-slate-400">CartoDB Light GIS Layer</span>
      </div>
    </div>
  );
}
