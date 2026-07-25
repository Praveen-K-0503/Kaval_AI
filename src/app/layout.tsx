import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KaavalAI — Karnataka State Police AI Command & Intelligence Suite',
  description: 'AI-Driven Crime Analytics, 3D Visualization, XGBoost Forecasting & Beat Patrol Optimization Platform for Karnataka State Police · KSP Datathon 2026',
  keywords: ['KSP', 'Karnataka Police', 'Crime Analytics', 'AI', 'SCRB', 'FIR', 'Machine Learning'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        margin: 0, padding: 0,
        background: '#f1f5f9',
        color: '#0f172a',
        minHeight: '100vh',
        WebkitFontSmoothing: 'antialiased',
      }}>
        {children}
      </body>
    </html>
  );
}
