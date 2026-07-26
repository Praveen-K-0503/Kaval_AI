'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Sparkles, Database, Network, Cpu, Lock, ArrowRight, Activity, Terminal } from 'lucide-react';

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#FBF6EE',
      color: '#1C0A00',
      fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 48px',
        background: '#ffffff',
        borderBottom: '1px solid #E8D4BA',
        boxShadow: '0 2px 10px rgba(139,26,26,0.03)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px', height: '42px',
            background: 'linear-gradient(135deg, #8B1A1A, #C8960C)',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px', boxShadow: '0 4px 10px rgba(139,26,26,0.2)'
          }}>⚔️</div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#8B1A1A', letterSpacing: '-0.02em' }}>KaavalAI</div>
            <div style={{ fontSize: '10px', color: '#9B7560', fontWeight: 600 }}>KSP Intelligence Platform</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href="/login" style={{ fontSize: '14px', fontWeight: 700, color: '#8B1A1A', textDecoration: 'none' }}>
            Officer Portal
          </Link>
          <Link href="/command-center" style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '10px 20px', background: '#8B1A1A', color: '#ffffff',
            borderRadius: '10px', fontSize: '13px', fontWeight: 700,
            textDecoration: 'none', boxShadow: '0 4px 12px rgba(139,26,26,0.25)',
            transition: 'all 0.2s',
          }}>
            Command Center <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{
        padding: '80px 48px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FDFBF7 100%)',
        borderBottom: '1px solid #E8D4BA',
      }}>
        <div style={{
          margin: '0 auto 20px', display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 16px', background: '#FEF3C7', border: '1px solid #FCD34D',
          borderRadius: '30px', fontSize: '12px', color: '#92400E', fontWeight: 800
        }}>
          <Sparkles size={14} /> Karnataka State Police · SCRB Intelligence Initiative
        </div>
        <h1 style={{
          fontSize: '48px', fontWeight: 800, color: '#1C0A00',
          maxWidth: '800px', margin: '0 auto 20px', lineHeight: '1.25',
          letterSpacing: '-0.03em'
        }}>
          Next-Generation Crime Analysis & <span style={{ color: '#8B1A1A' }}>Predictive Intelligence</span>
        </h1>
        <p style={{
          fontSize: '16px', color: '#9B7560', maxWidth: '640px',
          margin: '0 auto 32px', lineHeight: '1.7', fontWeight: 500
        }}>
          KaavalAI integrates machine learning algorithms, geospatial mappings, and social link analysis to empower Karnataka law enforcement with real-time operational foresight.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <Link href="/command-center" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '14px 28px', background: '#8B1A1A', color: '#ffffff',
            borderRadius: '12px', fontSize: '15px', fontWeight: 700,
            textDecoration: 'none', boxShadow: '0 4px 16px rgba(139,26,26,0.3)',
            transition: 'all 0.2s',
          }}>
            Access Command Center <ArrowRight size={16} />
          </Link>
          <a href="#architecture" style={{
            padding: '14px 28px', background: '#F2E8D9', color: '#5C3D2E',
            borderRadius: '12px', fontSize: '15px', fontWeight: 700,
            textDecoration: 'none', border: '1px solid #E8D4BA', transition: 'all 0.2s',
          }}>
            Explore Architecture
          </a>
        </div>
      </header>

      {/* Grid Features */}
      <section style={{ padding: '60px 48px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, textAlign: 'center', color: '#1C0A00', marginBottom: '40px' }}>
          Platform Capabilities
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Card 1 */}
          <div style={{ background: '#fff', border: '1px solid #E8D4BA', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(139,26,26,0.02)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#8B1A1A15', color: '#8B1A1A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Shield size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1C0A00', marginBottom: '8px' }}>Command Dashboard</h3>
            <p style={{ fontSize: '13px', color: '#9B7560', lineHeight: '1.6', fontWeight: 500 }}>
              Live KPI status monitoring, emergency dispatch feed simulation, and spatial crime risk mapping compiled directly from Data Store.
            </p>
          </div>
          {/* Card 2 */}
          <div style={{ background: '#fff', border: '1px solid #E8D4BA', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(139,26,26,0.02)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#C8960C15', color: '#C8960C', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Network size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1C0A00', marginBottom: '8px' }}>3D Syndicate Graphs</h3>
            <p style={{ fontSize: '13px', color: '#9B7560', lineHeight: '1.6', fontWeight: 500 }}>
              NetworkX PageRank centrality calculations mapped onto a WebGL 3D interface to expose repeat accused cohorts and ringleaders.
            </p>
          </div>
          {/* Card 3 */}
          <div style={{ background: '#fff', border: '1px solid #E8D4BA', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(139,26,26,0.02)' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#2D501615', color: '#2D5016', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Cpu size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1C0A00', marginBottom: '8px' }}>On-Demand Analytics</h3>
            <p style={{ fontSize: '13px', color: '#9B7560', lineHeight: '1.6', fontWeight: 500 }}>
              Live DBSCAN spatial clustering and XGBoost time-series regression models run directly against the active database records.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack & Architecture Section */}
      <section id="architecture" style={{ background: '#ffffff', borderTop: '1px solid #E8D4BA', borderBottom: '1px solid #E8D4BA', padding: '80px 48px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1C0A00', textAlign: 'center', marginBottom: '16px' }}>
            System Architecture & Technology Stack
          </h2>
          <p style={{ fontSize: '15px', color: '#9B7560', textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px', lineHeight: '1.7', fontWeight: 500 }}>
            KaavalAI leverage serverless cloud features paired with machine learning algorithms to process large law enforcement datasets cleanly.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#8B1A1A', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={18} /> Frontend & Client Portal
              </h3>
              <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#5C3D2E', fontWeight: 600 }}>
                <li><strong>Next.js 14 (React):</strong> Client router, optimized bundle sizes, and state synchronization.</li>
                <li><strong>Leaflet Maps:</strong> Geospatial rendering of case markers, heatmaps, and optimized beat patrol paths.</li>
                <li><strong>Three.js / 3D Force Graph:</strong> 3D WebGL linkage visualization of criminal relations.</li>
                <li><strong>Tailwind CSS & Vanilla HSL:</strong> High-performance UI design utilizing official Karnataka Police colors.</li>
              </ul>
            </div>

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#C8960C', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Database size={18} /> Backend & Cloud Core
              </h3>
              <ul style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#5C3D2E', fontWeight: 600 }}>
                <li><strong>FastAPI (Python):</strong> Ultra-fast ASGI API framework for data retrieval and ML calculations.</li>
                <li><strong>Zoho Catalyst Data Store:</strong> Cloud SQL database mapping KSP Case Master datasets.</li>
                <li><strong>ML Engine:</strong> SciKit-Learn, XGBoost, and NetworkX libraries for dynamic threat predictive calculations.</li>
                <li><strong>JWT & Role Guards:</strong> Industry-standard token-based protection and secure endpoint routing.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto', background: '#ffffff', padding: '24px 48px',
        borderTop: '1px solid #E8D4BA', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', fontSize: '12px', color: '#9B7560',
      }}>
        <div>© 2026 Karnataka State Police · SCRB Intelligence Initiative</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/login" style={{ color: '#8B1A1A', textDecoration: 'none', fontWeight: 700 }}>
            Login to Command Center
          </Link>
        </div>
      </footer>
    </div>
  );
}
