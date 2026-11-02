'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { 
  Radio, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  Pause, 
  OctagonAlert, 
  Terminal, 
  RefreshCw,
  Download,
  Copy,
  Cpu,
  ShieldCheck,
  ExternalLink,
  Layers,
  Heart,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Lock,
  Activity
} from 'lucide-react';

interface TerminalInfo {
  id: string;
  account_number: number;
  broker_name: string;
  status: 'online' | 'offline';
  trading_state: 'idle' | 'in_position' | 'recovering' | 'tp_hit' | 'shield_cut' | 'paused';
  ea_version: string;
  total_balance: number;
  total_equity: number;
  active_orders_count: number;
  daily_pnl: number;
  current_symbol: string;
  current_timeframe: string;
  is_trading_enabled: boolean;
  last_heartbeat: string;
}

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'terminals' | 'strategies' | 'likes'>('terminals');

  // Terminal state
  const [terminal, setTerminal] = useState<TerminalInfo>({
    id: 'term_default',
    account_number: 10859231,
    broker_name: 'InterStellar Financial - Demo',
    status: 'online',
    trading_state: 'idle',
    ea_version: '1.0.0',
    total_balance: 105264.81,
    total_equity: 93008.09,
    active_orders_count: 0,
    daily_pnl: 0.0,
    current_symbol: 'XAUUSD',
    current_timeframe: 'PERIOD_M1',
    is_trading_enabled: true,
    last_heartbeat: 'เมื่อสักครู่',
  });

  const [activeStrategyTitle, setActiveStrategyTitle] = useState('Golden Trend Pullback (Synced)');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [webControlMsg, setWebControlMsg] = useState('');

  // Referral Link
  const [brokerReferral, setBrokerReferral] = useState({
    name: 'InterStellar Financial (FISG)',
    url: 'https://my.fisg.com/register/trader?link_id=qb9f9uqj&referrer_id=0DtW2XvtM',
    description: 'โบรกเกอร์พาร์ทเนอร์แนะนำโดยแอดมิน สเปรดต่ำสำหรับทองคำ XAUUSD คำสั่งส่งตรง รวดเร็ว เสถียร ไม่ดีเลย์',
    badge: 'แอดมินแนะนำ',
  });

  useEffect(() => {
    // Fetch active broker referral
    fetch('/api/v1/broker-referrals')
      .then((res) => res.json())
      .then((data) => {
        if (data.referrals && data.referrals.length > 0) {
          const first = data.referrals[0];
          setBrokerReferral({
            name: first.broker_name,
            url: first.referral_url,
            description: first.description,
            badge: first.badge,
          });
        }
      })
      .catch((e) => console.error(e));
  }, []);

  const terminalToken = profile?.terminal_token || 'EAX_DEMO_TOKEN_12345';
  const webRequestUrl = typeof window !== 'undefined' ? window.location.origin : 'https://eaxocial.vercel.app';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webRequestUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(terminalToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(null as any), 2000);
  };

  const toggleTradingControl = () => {
    const nextState = !terminal.is_trading_enabled;
    setTerminal((prev) => ({
      ...prev,
      is_trading_enabled: nextState,
      trading_state: nextState ? 'idle' : 'paused',
    }));
    setWebControlMsg(
      nextState
        ? '⚡ เปิดใช้งานคำสั่งเทรดปกติแล้ว (EA สามารถเปิดออเดอร์ใหม่ได้)'
        : '⏸️ พักการเปิดออเดอร์ใหม่แล้ว (EA จะหยุดเปิดไม้ใหม่ชั่วคราว)'
    );
    setTimeout(() => setWebControlMsg(''), 4000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Top Welcome / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-cyan-400">
              TERMINAL HUD • {terminal.broker_name} [#{terminal.account_number}]
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[9px] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              ผูกสิทธิ์พอร์ตปลอดภัย (Anti-Hijack Active)
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Terminal className="w-6 h-6 text-cyan-400" />
            Live Status Cockpit
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-white">{profile?.display_name || user?.email?.split('@')[0] || 'Trader'}</div>
            <div className="text-[10px] text-slate-400 font-mono">{user?.email || 'Demo Mode'}</div>
          </div>
          <Link
            href="/builder"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs uppercase hover:opacity-95 shadow-md shadow-cyan-500/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>สร้างกลยุทธ์ใหม่</span>
          </Link>
        </div>
      </div>

      {/* Broker Referral Partner Banner */}
      <div className="glass-panel p-5 rounded-2xl border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-emerald-950/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
              {brokerReferral.badge}
            </span>
            <span className="text-xs font-bold text-white">ยังไม่มีบัญชีเทรด MT5 หรือต้องการพอร์ตสเปรดต่ำสำหรับรัน EA?</span>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            {brokerReferral.description}
          </p>
        </div>

        <a
          href={brokerReferral.url}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-lg shadow-cyan-500/20 hover:scale-[1.02]"
        >
          <span>เปิดบัญชีกับโบรกเกอร์แนะนำ</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('terminals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'terminals'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>1. พอร์ต MT5 Live Cockpit</span>
        </button>

        <button
          onClick={() => setActiveTab('strategies')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'strategies'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>2. กลยุทธ์ของฉัน</span>
        </button>

        <button
          onClick={() => setActiveTab('likes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'likes'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>3. กลยุทธ์ที่ถูกใจ</span>
        </button>
      </div>

      {/* Tab 1: Terminal & Live Cockpit */}
      {activeTab === 'terminals' && (
        <div className="space-y-6">
          {/* The 3 Core Traffic Lights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Light 1: Sync Status */}
            <div className="glass-panel-glow p-6 rounded-2xl border-slate-800 text-center space-y-3">
              <div className="flex justify-center">
                <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500 shadow-lg shadow-emerald-500/25">
                  <span className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-emerald-400 opacity-20"></span>
                  <Radio className="w-7 h-7 text-emerald-400" />
                </div>
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                  1. ระบบการเชื่อมต่อ (Sync Status)
                </span>
                <h3 className="text-lg font-bold text-emerald-400 mt-1">
                  {terminal.status === 'online' ? '[ONLINE] เชื่อมต่อพร้อม' : '[OFFLINE] ออฟไลน์'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Heartbeat: {terminal.last_heartbeat}
                </p>
              </div>
            </div>

            {/* Light 2: Version Compatibility */}
            <div className="glass-panel-glow p-6 rounded-2xl border-slate-800 text-center space-y-3">
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-cyan-950/80 border-2 border-cyan-500 shadow-lg shadow-cyan-500/25">
                  <CheckCircle className="w-7 h-7 text-cyan-400" />
                </div>
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                  2. ความพร้อมเวอร์ชัน (Engine Check)
                </span>
                <h3 className="text-lg font-bold text-cyan-400 mt-1">
                  [MATCH] v{terminal.ea_version} (สมบูรณ์)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Universal EA v1.0.0 (Latest Core)
                </p>
              </div>
            </div>

            {/* Light 3: Trading Action State */}
            <div className="glass-panel-glow p-6 rounded-2xl border-slate-800 text-center space-y-3">
              <div className="flex justify-center">
                <div className={`flex items-center justify-center w-16 h-16 rounded-full border-2 shadow-lg transition-all ${
                  terminal.trading_state === 'paused'
                    ? 'bg-amber-950/80 border-amber-400 shadow-amber-500/25 text-amber-400'
                    : terminal.trading_state === 'in_position'
                    ? 'bg-blue-950/80 border-blue-400 shadow-blue-500/25 text-blue-400'
                    : 'bg-emerald-950/80 border-emerald-400 shadow-emerald-500/25 text-emerald-400'
                }`}>
                  <Cpu className="w-7 h-7" />
                </div>
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                  3. สถานะการเทรด (Trading Action)
                </span>
                <h3 className={`text-lg font-bold mt-1 ${
                  terminal.trading_state === 'paused' ? 'text-amber-400' :
                  terminal.trading_state === 'in_position' ? 'text-blue-400' : 'text-emerald-400'
                }`}>
                  {terminal.trading_state === 'idle' && '[IDLE] รอสัญญาณ Setup'}
                  {terminal.trading_state === 'in_position' && `[IN POSITION] ถือ (${terminal.active_orders_count} ไม้)`}
                  {terminal.trading_state === 'paused' && '[PAUSED] พักเทรดจากหน้าเว็บ'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Balance: ${terminal.total_balance.toFixed(2)} • Eq: ${terminal.total_equity.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Active Strategy Card & Web Direct Control */}
          <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-slate-400">กลยุทธ์ที่กำลังทำงานบน MT5:</span>
                <h2 className="text-xl font-bold text-white mt-0.5">{activeStrategyTitle}</h2>
                <div className="flex items-center gap-2 mt-1 font-mono text-xs text-cyan-400">
                  <span>Symbol: {terminal.current_symbol}</span>
                  <span>•</span>
                  <span>TF: {terminal.current_timeframe}</span>
                  <span>•</span>
                  <span>Magic: 889900</span>
                </div>
              </div>

              {/* Web Controls */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleTradingControl}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
                    terminal.is_trading_enabled
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                      : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  }`}
                >
                  {terminal.is_trading_enabled ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>พักการเปิดออเดอร์ใหม่</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>เปิดใช้งานออเดอร์ปกติ</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {webControlMsg && (
              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
                {webControlMsg}
              </div>
            )}

            {/* Quick Port Telemetry Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">พอร์ตเทรด MT5</span>
                <span className="text-white font-bold">#{terminal.account_number}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">ยอดบาลานซ์ (Balance)</span>
                <span className="text-emerald-400 font-bold">${terminal.total_balance.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">ยอดอิควิตี้ (Equity)</span>
                <span className="text-cyan-400 font-bold">${terminal.total_equity.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">ออเดอร์เปิดอยู่</span>
                <span className="text-white font-bold">{terminal.active_orders_count} ไม้</span>
              </div>
            </div>
          </div>

          {/* MT5 Universal EA Connection Setup Guide & One-Click Download */}
          <div className="glass-panel p-6 rounded-2xl border-cyan-500/20 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Download className="w-5 h-5 text-cyan-400" />
                  วิธีติดตั้ง Universal EA และตั้งค่า WebRequest บน MetaTrader 5
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  ใช้ไฟล์ EA ตัวเดียวกันทุกคน · ปรับกลยุทธ์จากหน้าเว็บแล้วส่งไปรันได้ทันทีโดยไม่ต้องคอมไพล์ใหม่
                </p>
              </div>

              {/* Download Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="/download/EAxocial_Client.ex5"
                  download="EAxocial_Client.ex5"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wide hover:opacity-95 shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02]"
                >
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลด EA (.ex5)</span>
                </a>

                <a
                  href="/download/EAxocial_Client.mq5"
                  download="EAxocial_Client.mq5"
                  className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors"
                  title="Source Code .mq5"
                >
                  .mq5
                </a>
              </div>
            </div>

            {/* Step-by-Step Connection Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Step 1: WebRequest URL */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">1. เพิ่ม WebRequest URL ใน MT5:</span>
                  <span className="text-[10px] text-cyan-400 font-mono">Tools &gt; Options &gt; Experts</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  ติ๊กถูกที่ช่อง <strong>Allow WebRequest for listed URL</strong> แล้วกดปุ่มเขียว + เพิ่ม URL นี้:
                </p>
                <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                  <span className="font-mono text-cyan-300 font-bold text-xs">{webRequestUrl}</span>
                  <button
                    onClick={handleCopyUrl}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedUrl ? 'คัดลอกแล้ว!' : 'คัดลอก'}</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Personal Terminal Token */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">2. ใส่ Token ในช่อง Input ของ EA:</span>
                  <span className="text-[10px] text-emerald-400 font-mono">InpTerminalToken</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  รหัสส่วนตัวผูกกับบัญชีคุณ ป้องกันไม่ให้ใครสวมรอยพอร์ตได้:
                </p>
                <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
                  <span className="font-mono text-emerald-400 font-bold text-xs">{terminalToken}</span>
                  <button
                    onClick={handleCopyToken}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedToken ? 'คัดลอกแล้ว!' : 'คัดลอก'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>
                เมื่อลงไฟล์ใน MT5 และใส่ Token แล้วกดเปิดปุ่ม <strong>Algo Trading</strong> ไฟสถานะในข้อ 1 ด้านบนจะติดเป็นสีเขียว <strong>[ONLINE] Connected</strong> ทันที!
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: My Strategies */}
      {activeTab === 'strategies' && (
        <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              กลยุทธ์ของคุณที่สร้างไว้
            </h3>
            <Link
              href="/builder"
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs hover:bg-cyan-500/30 transition-all flex items-center gap-1"
            >
              <span>+ ออกแบบกลยุทธ์ใหม่</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                  ACTIVE ON MT5
                </span>
                <span className="text-xs text-slate-400 font-mono">XAUUSD • M5</span>
              </div>
              <h4 className="font-bold text-white text-base">Gold M5 · EMA400 + Stochastic 2-Step</h4>
              <p className="text-xs text-slate-400">
                Setup: EMA 400 + Stoch (15,2,9) โซน &lt; 20 แล้วตัดขึ้น • Trigger: เปิดแท่งถัดไป • SL Swing Low / RR 1.5
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <Link href="/builder" className="text-cyan-400 hover:underline text-xs font-semibold">
                  แก้ไขใน Builder →
                </Link>
                <button
                  onClick={() => alert('กลยุทธ์นี้ซิงค์อยู่กับ MT5 เรียบร้อยแล้ว')}
                  className="px-3 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 text-xs hover:text-white"
                >
                  ⚡ ซิงค์เข้าพอร์ต
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Liked Recipes */}
      {activeTab === 'likes' && (
        <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              กลยุทธ์ที่คุณกดถูกใจจากชุมชน
            </h3>
            <Link href="/feed" className="text-xs text-cyan-400 hover:underline">
              สำรวจ Social Feed ชุมชน →
            </Link>
          </div>

          <p className="text-xs text-slate-400">
            คุณสามารถกดไลค์กลยุทธ์ที่น่าสนใจในหน้า Social Feed เพื่อเก็บไว้ทดสอบหรือคัดลอกมาปรับแต่งต่อใน Builder ของตัวเองได้
          </p>
        </div>
      )}
    </div>
  );
}
