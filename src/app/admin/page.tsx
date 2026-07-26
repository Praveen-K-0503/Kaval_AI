'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ShieldAlert, Cpu, Database, Activity, RefreshCw, List, Users, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '@/lib/apiConfig';

const API = API_BASE_URL;

interface AuditLog {
  LogID: number;
  UserEmail: string;
  Action: string;
  Details: string;
  Timestamp: string;
}

interface SystemHealth {
  status: string;
  platform: string;
  python_version: string;
  database: string;
  catalyst_services: {
    app_sail: string;
    data_store: string;
    functions: string;
    zia_automl: string;
  };
}

export default function AdminConsolePage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [role, setRole] = useState('');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('kaavalai_token');
    const userRole = sessionStorage.getItem('kaavalai_role');
    
    if (!token) {
      router.push('/login');
    } else if (userRole !== 'scrb_chief' && userRole !== 'super_admin') {
      // Access Denied: User role doesn't have permissions
      setRole(userRole || '');
      setAuthorized(false);
    } else {
      setRole(userRole || '');
      setAuthorized(true);
    }
  }, [router]);

  const fetchData = async () => {
    try {
      // 1. Fetch system health
      const hRes = await fetch(`${API}/api/admin/health`);
      if (hRes.ok) {
        const hData = await hRes.json();
        setHealth(hData);
      }

      // 2. Fetch audit logs
      setLoadingLogs(true);
      const lRes = await fetch(`${API}/api/admin/audit-logs?limit=40`);
      if (lRes.ok) {
        const lData = await lRes.json();
        setAuditLogs(lData);
      }
    } catch (e) {
      console.error("Error fetching admin data:", e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      fetchData();
    }
  }, [authorized]);

  if (role && (role !== 'scrb_chief' && role !== 'super_admin')) {
    return (
      <div style={{
        minHeight: '100vh', background: '#FBF6EE', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", padding: '24px'
      }}>
        <div style={{
          background: '#fff', border: '1px solid #FCA5A5', borderRadius: '16px',
          padding: '40px', maxWidth: '480px', width: '100%', textAlign: 'center',
          boxShadow: '0 8px 32px rgba(139,26,26,0.05)'
        }}>
          <ShieldAlert size={56} color="#DC2626" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1C0A00', marginBottom: '12px' }}>Access Denied</h2>
          <p style={{ fontSize: '13px', color: '#9B7560', lineHeight: '1.6', marginBottom: '24px' }}>
            Your account role <strong>({role.toUpperCase()})</strong> does not have permission to access the Administration Console. SCRB Director / Super Admin credentials are required.
          </p>
          <Link href="/command-center" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px',
            background: '#8B1A1A', color: '#fff', borderRadius: '10px', fontSize: '14px',
            fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 12px rgba(139,26,26,0.2)'
          }}>
            <ArrowLeft size={16} /> Return to Command Center
          </Link>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: '#FBF6EE', color: '#8B1A1A',
        fontFamily: "'Outfit', sans-serif", fontSize: '18px', fontWeight: 800
      }}>
        Verifying Security Credentials...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FBF6EE', fontFamily: "'Outfit', sans-serif", display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Banner */}
      <header style={{
        background: 'linear-gradient(135deg, #8B1A1A, #5C1010)', color: '#FFF8EF',
        padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '2px solid #C8960C', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px'
          }}>🛡️</div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>Administration Console</h1>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginTop: '2px' }}>
              KaavalAI Platform Health, Configuration & Security Logs
            </div>
          </div>
        </div>
        <Link href="/command-center" style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
          background: 'rgba(255,255,255,0.12)', color: '#FFF8EF', borderRadius: '10px',
          fontSize: '13px', fontWeight: 700, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <ArrowLeft size={16} /> Exit Console
        </Link>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '32px 48px', maxWidth: '1400px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        
        {/* System Overview Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '24px', marginBottom: '32px' }}>
          
          {/* Health Summary Card */}
          <div style={{ background: '#fff', border: '1px solid #E8D4BA', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(139,26,26,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #F2E8D9', paddingBottom: '12px' }}>
              <Cpu size={20} color="#8B1A1A" />
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1C0A00', margin: 0 }}>System Health</h2>
            </div>
            {health ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#9B7560', fontWeight: 600 }}>OS Platform:</span>
                  <span style={{ color: '#1C0A00', fontWeight: 700 }}>{health.platform}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#9B7560', fontWeight: 600 }}>Python Version:</span>
                  <span style={{ color: '#1C0A00', fontWeight: 700 }}>{health.python_version}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#9B7560', fontWeight: 600 }}>Database Mode:</span>
                  <span style={{ color: '#8B1A1A', fontWeight: 800 }}>{health.database.toUpperCase()}</span>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: '#9B7560' }}>Loading system health stats...</div>
            )}
          </div>

          {/* Database & Cloud services statuses */}
          <div style={{ background: '#fff', border: '1px solid #E8D4BA', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(139,26,26,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #F2E8D9', paddingBottom: '12px' }}>
              <Database size={20} color="#C8960C" />
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1C0A00', margin: 0 }}>Catalyst Services</h2>
            </div>
            {health ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(health.catalyst_services).map(([svc, status]) => (
                  <div key={svc} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ color: '#9B7560', fontWeight: 600, textTransform: 'capitalize' }}>{svc.replace('_', ' ')}:</span>
                    <span style={{
                      fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '12px',
                      background: status === 'operational' ? '#D1FAE5' : '#FEE2E2',
                      color: status === 'operational' ? '#065F46' : '#991B1B',
                    }}>{status.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: '#9B7560' }}>Loading Catalyst services info...</div>
            )}
          </div>

          {/* Quick Actions Console */}
          <div style={{ background: '#fff', border: '1px solid #E8D4BA', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(139,26,26,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #F2E8D9', paddingBottom: '12px' }}>
              <Activity size={20} color="#2D5016" />
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#1C0A00', margin: 0 }}>Admin Actions</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={fetchData} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px',
                background: '#F2E8D9', border: '1px solid #E8D4BA', borderRadius: '10px',
                fontSize: '12px', fontWeight: 700, color: '#5C3D2E', cursor: 'pointer'
              }}>
                <RefreshCw size={14} /> Refresh Logs
              </button>
              <Link href="/command-center" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px',
                background: '#8B1A1A', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
                color: '#fff', cursor: 'pointer', textDecoration: 'none'
              }}>
                <ArrowLeft size={14} /> Go Back
              </Link>
            </div>
          </div>

        </div>

        {/* Audit Trails Logs Section */}
        <div style={{ background: '#fff', border: '1px solid #E8D4BA', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 16px rgba(139,26,26,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', borderBottom: '1px solid #F2E8D9', paddingBottom: '16px' }}>
            <List size={22} color="#8B1A1A" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1C0A00', margin: 0 }}>Compliance Security Audit Trail</h2>
          </div>

          {loadingLogs ? (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '14px', color: '#9B7560' }}>
              Loading audit logs from Catalyst Data Store...
            </div>
          ) : auditLogs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', fontSize: '14px', color: '#9B7560' }}>
              No audit logs captured in this session.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E8D4BA', color: '#5C3D2E', fontWeight: 800 }}>
                    <th style={{ padding: '12px 8px' }}>Log ID</th>
                    <th style={{ padding: '12px 8px' }}>Timestamp</th>
                    <th style={{ padding: '12px 8px' }}>Officer / User</th>
                    <th style={{ padding: '12px 8px' }}>Action</th>
                    <th style={{ padding: '12px 8px' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.LogID} style={{ borderBottom: '1px solid #F2E8D9', color: '#1C0A00' }}>
                      <td style={{ padding: '12px 8px', fontWeight: 700, color: '#9B7560' }}>#{log.LogID}</td>
                      <td style={{ padding: '12px 8px', color: '#9B7560' }}>{log.Timestamp}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 700 }}>{log.UserEmail}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '12px',
                          background: log.Action.includes('Login') ? '#D1FAE5' : '#DBEAFE',
                          color: log.Action.includes('Login') ? '#065F46' : '#1E40AF',
                        }}>
                          {log.Action}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', color: '#5C3D2E', fontWeight: 500 }}>{log.Details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
