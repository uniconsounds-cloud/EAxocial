'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Share2, 
  Heart, 
  GitFork, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  MessageSquare, 
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Flame,
  Shield,
  Layers
} from 'lucide-react';
import { STARTER_PRESETS } from '@/lib/presets';
import { StrategyModel } from '@/types/strategy';

export default function FeedPage() {
  const [strategies, setStrategies] = useState<StrategyModel[]>(STARTER_PRESETS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'verified' | 'gold' | 'grid'>('all');
  const [notification, setNotification] = useState<string | null>(null);

  const handleLike = (id: string) => {
    setStrategies(strategies.map(s => s.id === id ? { ...s, likes_count: s.likes_count + 1 } : s));
  };

  const handleClone = (strategy: StrategyModel) => {
    setNotification(`⚡ โคลน "${strategy.title}" สำเร็จ! สูตรถูกคัดลอกพร้อมนำไปปรับแต่งใน Core Builder`);
    setTimeout(() => setNotification(null), 4000);
  };

  const filtered = strategies.filter((item) => {
    if (activeFilter === 'verified') return item.is_verified;
    if (activeFilter === 'gold') return item.recipe.symbol === 'XAUUSD';
    if (activeFilter === 'grid') return item.recipe.recovery.mode !== 'SINGLE_ORDER';
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Top Banner & Social Discovery */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-950 border border-emerald-500/40 text-emerald-300">
              SOCIAL DECK
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Community Strategy Network
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            ค้นพบ โคลน และแบ่งปันกลยุทธ์ MT5
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
            ทุกสูตรในหน้านี้ใช้ไฟล์ Universal EA ตัวเดียวกัน ไม่ต้องคอมไพล์โค้ดใหม่ เพียงกดโคลนแล้วปรับแต่งค่า หรือส่งตรงเข้าเทอร์มินัลของคุณได้ทันที
          </p>
        </div>

        <Link
          href="/builder"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-95 shadow-lg shadow-cyan-500/20 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          สร้างสูตรของฉัน
        </Link>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-200 text-sm flex items-center gap-2 animate-bounce">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-medium">
        {[
          { id: 'all', label: '🔥 สูตรยอดนิยมทั้งหมด' },
          { id: 'verified', label: '🛡️ ยืนยันพอร์ตจริง (Verified Only)' },
          { id: 'gold', label: '🪙 ตลาดทองคำ (XAUUSD)' },
          { id: 'grid', label: '🔄 สายแก้ไม้ / Grid & DCA' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as 'all' | 'verified' | 'gold' | 'grid')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeFilter === tab.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Strategy Feed Cards */}
      <div className="space-y-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="glass-panel-glow p-6 rounded-2xl border-slate-800 hover:border-cyan-500/40 transition-all space-y-5"
          >
            {/* Header: Author & Badges */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600 to-slate-900 border border-cyan-500/40 flex items-center justify-center font-bold text-white text-sm">
                  {item.title[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    {item.is_verified && (
                      <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        Verified Real
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {item.recipe.symbol} • {item.recipe.timeframe} • Universal v{item.version}
                  </span>
                </div>
              </div>

              {/* Trait Meters: Aggression & Defense */}
              <div className="hidden sm:flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-400">Atk:</span>
                  <span className="text-amber-400 font-bold">{item.aggression_level}/5</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-400">Def:</span>
                  <span className="text-cyan-400 font-bold">{item.defense_level}/5</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {item.description}
            </p>

            {/* 4-Socket Blueprint Breakdown (Mini Preview) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-slate-500 block text-[10px]">RADAR (ENTRY)</span>
                <span className="text-cyan-400 font-semibold truncate block">
                  {item.recipe.entry.setupConditions[0]?.indicator} ({item.recipe.entry.triggerMode})
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-slate-500 block text-[10px]">ARMOR (RECOVERY)</span>
                <span className="text-amber-400 font-semibold truncate block">
                  {item.recipe.recovery.mode === 'SINGLE_ORDER' ? 'ไม้เดียวจบ' : `Grid x${item.recipe.recovery.maxOrders}`}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-slate-500 block text-[10px]">VAULT (EXIT)</span>
                <span className="text-emerald-400 font-semibold truncate block">
                  {item.recipe.exit.mode === 'BASKET_DOLLAR' ? `+$${item.recipe.exit.basketTargetDollar}` : `RR 1:${item.recipe.exit.riskRewardRatio}`}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <span className="text-slate-500 block text-[10px]">SHIELD (RISK)</span>
                <span className="text-rose-400 font-semibold truncate block">
                  DD Cap {item.recipe.shield.maxAccountDrawdownPercent}%
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
                >
                  #{t}
                </span>
              ))}
            </div>

            {/* Social Actions & 1-Click Clone */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs">
              <div className="flex items-center gap-4 text-slate-400">
                <button
                  onClick={() => handleLike(item.id)}
                  className="flex items-center gap-1.5 hover:text-rose-400 transition-colors"
                >
                  <Heart className="w-4 h-4 text-rose-500/80" />
                  <span>{item.likes_count}</span>
                </button>
                <div className="flex items-center gap-1.5">
                  <GitFork className="w-4 h-4 text-cyan-400" />
                  <span>{item.forks_count} Forks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span>14 รีวิว</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleClone(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-all"
                >
                  <GitFork className="w-3.5 h-3.5 text-cyan-400" />
                  โคลนสูตร
                </button>
                <Link
                  href="/builder"
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-semibold transition-all"
                >
                  ปรับแต่งใน Builder
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
