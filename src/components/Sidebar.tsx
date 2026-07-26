'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Brain,
  Network,
  Shield,
  ChevronLeft,
  ChevronRight,
  MapPin,
  BarChart3,
  Layers
} from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/',            icon: <LayoutDashboard size={18} />, label: 'Home',               sublabel: 'Command Center' },
  { href: '/firs',        icon: <FileText size={18} />,        label: 'FIR Intelligence',   sublabel: 'Case Master Vault',   badge: 'LIVE' },
  { href: '/analytics',   icon: <BarChart3 size={18} />,       label: 'SCRB Analytics',     sublabel: 'Crime Forecasting',   badge: 'AI' },
  { href: '/network',     icon: <Network size={18} />,         label: 'Syndicate Network',  sublabel: '3D Criminal Graph',   badge: '3D' },
  { href: '/beat-patrol', icon: <Shield size={18} />,          label: 'Beat Patrol',        sublabel: 'Route Optimizer' },
];

const BADGE_COLOR: Record<string, { bg: string; text: string }> = {
  LIVE: { bg: '#D1FAE5', text: '#065F46' },
  AI:   { bg: '#EDE9FE', text: '#5B21B6' },
  '3D': { bg: '#FEF3C7', text: '#92400E' },
};

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      style={{
        width: collapsed ? '72px' : '240px',
        minHeight: '100vh',
        background: '#FFFFFF',
        borderRight: '1px solid #E8D4BA',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0, top: 0,
        zIndex: 50,
        boxShadow: '4px 0 20px rgba(139,26,26,0.07)',
        overflow: 'hidden',
      }}
    >
      {/* KSP Logo & Brand */}
      <div style={{
        padding: '16px 14px',
        borderBottom: '1px solid #F2E8D9',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        minHeight: '72px',
        background: 'linear-gradient(135deg, #8B1A1A 0%, #A52020 100%)',
      }}>
        <div style={{
          width: '42px', height: '42px', minWidth: '42px',
          borderRadius: '50%',
          background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          <Image
            src="/ksp-logo.jpg"
            alt="KSP Logo"
            width={38}
            height={38}
            style={{ objectFit: 'contain' }}
          />
        </div>

        {!collapsed && (
          <div style={{ overflow: 'hidden', animation: 'fadeIn 0.25s ease' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
              KaavalAI
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', fontWeight: 600, marginTop: '2px' }}>
              Karnataka State Police
            </div>
          </div>
        )}
      </div>

      {/* Nav Label */}
      {!collapsed && (
        <div style={{
          padding: '14px 18px 6px',
          fontSize: '10px',
          fontWeight: 800,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#C8960C',
        }}>
          Intelligence Modules
        </div>
      )}

      {/* Navigation Items */}
      <nav style={{ flex: 1, padding: collapsed ? '12px 8px' : '6px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? '0' : '12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '11px' : '10px 12px',
                borderRadius: '0.625rem',
                background: isActive ? 'linear-gradient(135deg, #8B1A1A 0%, #A52020 100%)' : 'transparent',
                color: isActive ? '#fff' : '#5C3D2E',
                fontWeight: isActive ? 700 : 500,
                fontSize: '13px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                position: 'relative',
                borderLeft: isActive ? '3px solid #C8960C' : '3px solid transparent',
                boxShadow: isActive ? '0 4px 14px rgba(139,26,26,0.25)' : 'none',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = '#FFF8EF';
                  (e.currentTarget as HTMLElement).style.color = '#8B1A1A';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#5C3D2E';
                }
              }}
            >
              <span style={{ flexShrink: 0, opacity: isActive ? 1 : 0.75 }}>{item.icon}</span>
              {!collapsed && (
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', lineHeight: 1.2 }}>{item.label}</span>
                  {item.sublabel && (
                    <span style={{
                      display: 'block',
                      fontSize: '10px',
                      fontWeight: 500,
                      opacity: 0.65,
                      marginTop: '1px',
                    }}>
                      {item.sublabel}
                    </span>
                  )}
                </span>
              )}
              {!collapsed && item.badge && BADGE_COLOR[item.badge] && (
                <span style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '20px',
                  background: BADGE_COLOR[item.badge].bg,
                  color: BADGE_COLOR[item.badge].text,
                  letterSpacing: '0.05em',
                  flexShrink: 0,
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider & KSP Info */}
      {!collapsed && (
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #F2E8D9',
          background: '#FFF8EF',
        }}>
          <div style={{ fontSize: '10px', color: '#9B7560', fontWeight: 600, lineHeight: 1.5 }}>
            <div style={{ color: '#C8960C', fontWeight: 800, fontSize: '11px', marginBottom: '2px' }}>
              SCRB Intelligence Platform
            </div>
            <div>Project ID: 56816000000013052</div>
            <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              <span style={{ color: '#065F46', fontWeight: 700 }}>All Systems Operational</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(c => !c)}
        style={{
          margin: '10px',
          padding: '8px',
          background: '#FFF8EF',
          border: '1px solid #E8D4BA',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8B1A1A',
          transition: 'all 0.2s ease',
          fontSize: '12px',
          fontWeight: 700,
          gap: '5px',
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={15} /> : <><ChevronLeft size={15} /><span>Collapse</span></>}
      </button>
    </aside>
  );
}
