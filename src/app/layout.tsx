import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KaavalAI - Karnataka State Police AI Command & Intelligence Suite',
  description: 'AI-Driven Crime Analytics & 3D Visualization Platform for Karnataka State Police Datathon 2026',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#060b19] text-slate-100 antialiased min-h-screen selection:bg-sky-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
