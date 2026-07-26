'use client';

import React, { useEffect, useRef } from 'react';
import { BeatCheckpoint } from '@/lib/kspMockData';

interface BeatMapProps {
  checkpoints: BeatCheckpoint[];
  completedCPs: string[];
  activeCP: string | null;
  onToggle: (id: string) => void;
  stationLat: number;
  stationLng: number;
}

const RISK_COLORS: Record<string, string> = {
  HIGH: '#DC2626',
  MEDIUM: '#F59E0B',
  MODERATE: '#10B981',
};

export default function BeatMap({ checkpoints, completedCPs, activeCP, onToggle, stationLat, stationLng }: BeatMapProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current || initializedRef.current) return;

    const L = require('leaflet');
    require('leaflet/dist/leaflet.css');

    // Fix default marker icons
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    const map = L.map(mapContainerRef.current, {
      center: [stationLat, stationLng],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Police Station marker (HQ)
    const stationIcon = L.divIcon({
      className: '',
      html: `<div style="
        width: 36px; height: 36px; border-radius: 50%;
        background: linear-gradient(135deg, #8B1A1A, #A52020);
        border: 3px solid #C8960C;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 12px rgba(139,26,26,0.5);
        font-size: 16px;
      ">🏛️</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    L.marker([stationLat, stationLng], { icon: stationIcon })
      .addTo(map)
      .bindPopup('<strong style="color:#8B1A1A">Police Station HQ</strong><br>Base Point for Patrol Route');

    // Route line through all checkpoints
    const routePoints: [number, number][] = [
      [stationLat, stationLng],
      ...checkpoints.map(cp => [cp.lat, cp.lng] as [number, number]),
      [stationLat, stationLng], // return to base
    ];

    polylineRef.current = L.polyline(routePoints, {
      color: '#8B1A1A',
      weight: 3,
      opacity: 0.7,
      dashArray: '8, 6',
    }).addTo(map);

    // Checkpoint markers
    markersRef.current = checkpoints.map((cp) => {
      const done = completedCPs.includes(cp.id);
      const color = done ? '#10B981' : RISK_COLORS[cp.riskRating] || '#9B7560';

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width: 32px; height: 32px; border-radius: '${done ? '6px' : '50%'}';
          background: ${color};
          border: 3px solid #fff;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          font-size: 12px; font-weight: 800; color: #fff;
          font-family: monospace;
        ">${done ? '✓' : cp.order}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([cp.lat, cp.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; min-width: 200px">
            <div style="font-weight: 800; color: #1C0A00; margin-bottom: 4px">Stop #${cp.order}: ${cp.name}</div>
            <div style="font-size: 11px; color: #9B7560; margin-bottom: 6px">${cp.location}</div>
            <div style="font-size: 10px; padding: 4px 8px; border-radius: 4px; background: ${color}20; color: ${color}; font-weight: 700; display: inline-block">${cp.riskRating} RISK</div>
            <div style="font-size: 11px; margin-top: 6px; color: #5C3D2E"><strong>Time:</strong> ${cp.recommendedTime}</div>
            <div style="font-size: 11px; color: #5C3D2E; margin-top: 3px">${cp.patrolInstructions}</div>
          </div>
        `);

      marker.on('click', () => onToggle(cp.id));
      return marker;
    });

    // Fit map to show all checkpoints
    const allPoints = [
      [stationLat, stationLng] as [number, number],
      ...checkpoints.map(cp => [cp.lat, cp.lng] as [number, number]),
    ];
    map.fitBounds(allPoints, { padding: [40, 40] });

    mapRef.current = map;
    initializedRef.current = true;

    return () => {
      map.remove();
      initializedRef.current = false;
    };
  }, [stationLat, stationLng]);

  // Update markers when completedCPs changes
  useEffect(() => {
    if (!mapRef.current || markersRef.current.length === 0) return;
    const L = require('leaflet');

    markersRef.current.forEach((marker, i) => {
      const cp = checkpoints[i];
      if (!cp) return;
      const done = completedCPs.includes(cp.id);
      const color = done ? '#10B981' : RISK_COLORS[cp.riskRating] || '#9B7560';

      marker.setIcon(L.divIcon({
        className: '',
        html: `<div style="
          width: 32px; height: 32px; border-radius: 50%;
          background: ${color};
          border: 3px solid #fff;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          font-size: 12px; font-weight: 800; color: #fff;
          font-family: monospace; transition: all 0.3s;
        ">${done ? '✓' : cp.order}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      }));
    });
  }, [completedCPs]);

  // Fly to active checkpoint
  useEffect(() => {
    if (!mapRef.current || !activeCP) return;
    const cp = checkpoints.find(c => c.id === activeCP);
    if (cp) mapRef.current.flyTo([cp.lat, cp.lng], 16, { duration: 1.2 });
  }, [activeCP]);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height: '100%', minHeight: '460px', background: '#FBF6EE' }}
    />
  );
}
