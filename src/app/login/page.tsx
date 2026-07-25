'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const ROLES = [
  { id: 'scrb_chief', label: 'SCRB Director / Chief', color: '#1d4ed8' },
  { id: 'range_ig', label: 'Range Inspector General', color: '#7c3aed' },
  { id: 'district_sp', label: 'District Superintendent', color: '#059669' },
  { id: 'sho', label: 'Station House Officer (SHO)', color: '#d97706' },
  { id: 'analyst', label: 'Crime Analyst', color: '#64748b' },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('scrb_chief');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      if (res.ok) {
        const d = await res.json();
        // Store JWT in sessionStorage
        sessionStorage.setItem('kaavalai_token', d.token || 'demo_token');
        sessionStorage.setItem('kaavalai_role', role);
        sessionStorage.setItem('kaavalai_user', email);
        router.push('/');
      } else {
        // Demo mode — allow any login
        sessionStorage.setItem('kaavalai_token', 'demo_token');
        sessionStorage.setItem('kaavalai_role', role);
        sessionStorage.setItem('kaavalai_user', email || 'officer@ksp.gov.in');
        router.push('/');
      }
    } catch {
      // Demo fallback
      sessionStorage.setItem('kaavalai_token', 'demo_token');
      sessionStorage.setItem('kaavalai_role', role);
      sessionStorage.setItem('kaavalai_user', email || 'officer@ksp.gov.in');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find(r => r.id === role);

  return (
    <div style={{
      minHeight: '100vh', background: '#f1f5f9',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: '24px',
    }}>

      {/* Left Panel — Branding */}
      <div style={{
        display: 'none',
        background: 'linear-gradient(160deg, #1d4ed8 0%, #7c3aed 100%)',
        borderRadius: '20px 0 0 20px',
        padding: '48px',
        minWidth: '380px',
        alignItems: 'flex-start',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '560px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>⚔️</div>
            <div>
              <div style={{ color: '#fff', fontSize: '20px', fontWeight: 800 }}>KaavalAI</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>KSP Intelligence Platform</div>
            </div>
          </div>
          <div style={{ color: '#fff', fontSize: '28px', fontWeight: 800, lineHeight: '1.3', marginBottom: '16px' }}>
            Secure Access<br />Control Portal
          </div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', lineHeight: '1.7' }}>
            Role-based access for Karnataka State Police officers. All actions are logged and audited.
          </div>
        </div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>
          Karnataka State Police · SCRB · Datathon 2026
        </div>
      </div>

      {/* Login Card */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        padding: '40px', width: '100%', maxWidth: '420px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px', height: '56px', margin: '0 auto 12px',
            background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
            borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', boxShadow: '0 4px 12px rgba(29,78,216,0.3)',
          }}>⚔️</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>KaavalAI</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>Karnataka State Police Intelligence Suite</div>
        </div>

        {/* Government notice */}
        <div style={{
          background: '#fef9c3', border: '1px solid #fde047',
          borderRadius: '8px', padding: '10px 12px', marginBottom: '20px',
          fontSize: '11px', color: '#713f12', display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <Shield size={14} color="#d97706" />
          Authorized personnel only · Official Government System
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Role Selector */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
              Your Role
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0',
                borderRadius: '8px', fontSize: '13px', color: '#0f172a', background: '#fff',
                outline: 'none', cursor: 'pointer', boxSizing: 'border-box',
                borderLeft: `4px solid ${selectedRole?.color || '#1d4ed8'}`,
              }}
            >
              {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
              Service ID / Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="officer@ksp.gov.in"
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0',
                borderRadius: '8px', fontSize: '13px', color: '#0f172a', background: '#fff',
                outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={e => (e.target.style.borderColor = '#1d4ed8')}
              onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
              Password / OTP
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '10px 36px 10px 12px', border: '1px solid #e2e8f0',
                  borderRadius: '8px', fontSize: '13px', color: '#0f172a', background: '#fff',
                  outline: 'none', boxSizing: 'border-box',
                }}
                onFocus={e => (e.target.style.borderColor = '#1d4ed8')}
                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1d4ed8, #7c3aed)',
              color: '#fff', border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '4px', boxShadow: loading ? 'none' : '0 4px 12px rgba(29,78,216,0.3)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? '🔐 Authenticating...' : '🔐 Secure Login'}
          </button>
        </form>

        {/* Demo note */}
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '11px', color: '#94a3b8', padding: '10px', background: '#f8fafc', borderRadius: '8px' }}>
          Demo: Enter any email/password to access the platform<br />
          <span style={{ color: '#1d4ed8', fontWeight: 600 }}>Catalyst Authentication</span> integration ready
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '10px', color: '#cbd5e1' }}>
          Karnataka State Police · SCRB Intelligence · KSP Datathon 2026<br />
          Powered by Zoho Catalyst · Project ID: 56816000000013052
        </div>
      </div>
    </div>
  );
}
