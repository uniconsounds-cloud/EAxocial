'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { 
  Zap, 
  Layers, 
  Activity, 
  Share2, 
  Sparkles, 
  Radio, 
  User, 
  LogOut, 
  ShieldCheck, 
  LogIn
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, profile, isAdmin, signOut } = useAuth();
  const [userDropdown, setUserDropdown] = useState(false);

  const navLinks = [
    { href: '/', label: 'Overview', icon: Zap },
    { href: '/builder', label: 'Core Builder', icon: Layers },
    { href: '/dashboard', label: 'Terminal Live', icon: Activity },
    { href: '/feed', label: 'Social Deck', icon: Share2 },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-cyan-500/10">
      <div className="max-w-[1620px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-400 p-[1px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
              EA<span className="text-cyan-400">xocial</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                MT5 OS
              </span>
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-inner'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-3 py-1.5 ml-2 rounded-lg text-xs font-mono font-bold transition-all ${
                pathname === '/admin'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-900/40'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Console</span>
            </Link>
          )}
        </nav>

        {/* Right Status Pill, Auth & CTA */}
        <div className="flex items-center gap-3">
          {/* Real-time Indicator Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-xs text-slate-300 font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>EA v1.0.0</span>
          </div>

          <Link
            href="/builder"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs tracking-wide uppercase hover:opacity-95 shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Build Strategy
          </Link>

          {/* User Profile or Login */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center text-[10px] font-bold text-slate-950 uppercase">
                  {(profile?.display_name || user.email || 'U')[0]}
                </div>
                <span className="text-xs font-semibold text-slate-200 max-w-[100px] truncate hidden sm:inline">
                  {profile?.display_name || user.email?.split('@')[0]}
                </span>
              </button>

              {userDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-xl glass-panel-glow p-2 border-slate-800 shadow-2xl z-50 text-xs"
                  onClick={() => setUserDropdown(false)}
                >
                  <div className="p-2 border-b border-slate-800">
                    <p className="font-bold text-white truncate">{profile?.display_name || 'Trader'}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-[9px] border border-cyan-500/30">
                        {profile?.role === 'admin' ? 'ADMIN' : 'TRADER'}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
                    >
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      <span>My MT5 Cockpit</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800/80 text-emerald-300 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Admin Console</span>
                      </Link>
                    )}

                    <Link
                      href="/feed"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Social Deck</span>
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-500/10 text-rose-400 transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 font-semibold text-xs transition-all shadow-inner"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              <span>เข้าสู่ระบบ</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
