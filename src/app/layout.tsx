import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'KaavalAI — Karnataka State Police Intelligence Suite',
  description: 'AI-Driven Crime Analytics, 3D Visualization, XGBoost Forecasting & Beat Patrol Optimization Platform for Karnataka State Police · KSP SCRB Datathon 2026',
  keywords: ['KSP', 'Karnataka Police', 'Crime Analytics', 'AI', 'SCRB', 'FIR', 'Machine Learning', 'KaavalAI'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{
        fontFamily: "'Plus Jakarta Sans', 'Inter', 'Segoe UI', sans-serif",
        margin: 0, padding: 0,
        background: '#FBF6EE',
        color: '#1C0A00',
        minHeight: '100vh',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        display: 'flex',
      }}>
        {/* Persistent Left Sidebar */}
        <Sidebar />

        {/* Main Content — shifts right with CSS variable from sidebar width  */}
        <div
          id="main-content"
          style={{
            flex: 1,
            marginLeft: '240px',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
