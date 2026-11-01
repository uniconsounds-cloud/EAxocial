import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'EAxocial - Next-Gen Social EA & Modular Bot Platform for MT5',
  description: 'Create, run, and share MetaTrader 5 EAs visually. Extract strategies from YouTube/TikTok videos with AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950">
        <Navbar />
        <main className="flex-1 max-w-[1620px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
        <footer className="border-t border-slate-800/80 bg-slate-950/80 backdrop-blur py-6 mt-12 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 EAxocial. All rights reserved. Built for algorithmic traders worldwide.</p>
            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Supabase Connected
              </span>
              <span>•</span>
              <span>Vercel Edge Ready</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
