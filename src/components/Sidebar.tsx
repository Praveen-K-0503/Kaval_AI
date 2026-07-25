'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, FileText, Brain, Network, Shield,
  BarChart2, Settings, ChevronLeft, ChevronRight,
  Map, AlertTriangle, BookOpen
} from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  badgeColor?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', icon: <LayoutDashboard size={18} />, label: 'Command Center' },
  { href: '/firs', icon: <FileText size={18} />, label: 'FIR Registry', badge: 'LIVE', badgeColor: '#059669' },
  { href: '/analytics', icon: <Brain size={18} />, label: 'ML Analytics', badge: 'AI', badgeColor: '#7c3aed' },
  { href: '/network', icon: <Network size={18} />, label: 'Criminal Network', badge: '3D', badgeColor: '#1d4ed8' },
  { href: '/beat-patrol', icon: <Shield size={18} />, label: 'Beat Patrol', badge: 'NEW', badgeColor: '#059669' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{
      width: collapsed ? '60px' : '220px',
      minHeight: '100vh',
      background: '#fff',
      borderRight: '1px solid #e2e8f0',
      transition: 'width 0.25s ease',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 40,
      boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
    }}>

      {/* Logo */}
      <div style={{
        padding: '16px 12px', borderBottom: '1px solid #f1f5f9',
        display: 'flex', alignItems: 'center', gap: '10px',
        minHeight: '64px',
      }}>
        <div style={{
          width: '32px', height: '32px', minWidth: '32px',
          background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
          borderRadius: '8px', display: 'flex', alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: '14px' }}>⚔️</span>
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', lineHeight: '1.2' }}>KaavalAI</div>
            <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 500 }}>KSP SCRB Intelligence</div>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: '8px' }}>
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 10px', borderRadius: '8px', marginBottom: '2px',
                background: isActive ? '#eff6ff' : 'transparent',
                color: isActive ? '#1d4ed8' : '#64748b',
                transition: 'all 0.15s',
                cursor: 'pointer',
                whiteSpace: 'nowrap', overflow: 'hidden',
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span style={{
                  minWidth: '18px', color: isActive ? '#1d4ed8' : '#94a3b8',
                }}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <>
                    <span style={{ fontSize: '12px', fontWeight: isActive ? 700 : 500, flex: 1 }}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span style={{
                        background: item.badgeColor || '#64748b',
                        color: '#fff', fontSize: '8px', fontWeight: 700,
                        padding: '1px 5px', borderRadius: '4px',
                        letterSpacing: '0.05em',
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Catalyst status footer */}
      {!collapsed && (
        <div style={{
          padding: '10px 12px', borderTop: '1px solid #f1f5f9',
          margin: '8px',
        }}>
          <div style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Catalyst Services
          </div>
          {[
            { dot: '#059669', label: 'AppSail Runtime' },
            { dot: '#1d4ed8', label: 'Data Store (SQLite)' },
            { dot: '#d97706', label: 'ML Engine Active' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.dot }} />
              <span style={{ fontSize: '10px', color: '#64748b' }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          margin: '8px', padding: '8px', border: '1px solid #e2e8f0',
          borderRadius: '8px', background: '#f8fafc', cursor: 'pointer',
          color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  );
}
