'use client';

import React, { useState, useEffect } from 'react';
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
  Cpu
} from 'lucide-react';

export default function DashboardPage() {
  // Live State
  const [terminalToken] = useState('DEMO_TOKEN_12345');
  const [accountNumber] = useState('10859231');
  const [broker] = useState('Exness-Real10');
  const [activeStrategy] = useState('Titan-Grid Gold Scalper');
  const [symbol] = useState('XAUUSD');
  const [timeframe] = useState('M15');

  // Traffic Light States
  const [isSynced, setIsSynced] = useState(true);
  const [isVersionMatched, setIsVersionMatched] = useState(true);
  const [tradingState, setTradingState] = useState<'idle' | 'in_position' | 'recovering' | 'tp_hit'>('in_position');
  const [activeOrders, setActiveOrders] = useState(2);
  const [dailyPnl, setDailyPnl] = useState(18.50);
  const [lastHeartbeat, setLastHeartbeat] = useState('3 วินาทีที่แล้ว');

  // Copied alert
  const [copied, setCopied] = useState(false);

  // Simulate subtle heartbeat pulse
  useEffect(() => {
    const timer = setInterval(() => {
      setLastHeartbeat('เมื่อสักครู่');
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText('http://localhost:3000');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Top Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border-cyan-500/20">
        <div>
          <span className="text-xs font-mono text-cyan-400 block mb-1">
            TERMINAL HUD • {broker} [#{accountNumber}]
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Terminal className="w-6 h-6 text-cyan-400" />
            Live Status Cockpit
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Heartbeat: {lastHeartbeat}</span>
          <button 
            onClick={() => setLastHeartbeat('อัปเดตแล้ว')}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:text-cyan-400"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* The 3 Core Traffic Lights (Minimalist & Uncluttered) */}
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
              1. ระบบการเชื่อมต่อ (Sync)
            </span>
            <h3 className="text-lg font-bold text-emerald-400 mt-1">
              {isSynced ? '🟢 เชื่อมต่อพร้อม' : '🔴 ขาดการเชื่อมต่อ'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              พารามิเตอร์ตรงกับหน้าเว็บ 100%
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
              2. ความพร้อมเวอร์ชัน (Version)
            </span>
            <h3 className="text-lg font-bold text-cyan-400 mt-1">
              {isVersionMatched ? '🟢 รองรับสมบูรณ์' : '🟡 มีอัปเดตใหม่'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              EA Client v1.0.0 (Latest Core)
            </p>
          </div>
        </div>

        {/* Light 3: Trading Action State */}
        <div className="glass-panel-glow p-6 rounded-2xl border-slate-800 text-center space-y-3">
          <div className="flex justify-center">
            <div className={`flex items-center justify-center w-16 h-16 rounded-full border-2 shadow-lg transition-all ${
              tradingState === 'in_position'
                ? 'bg-blue-950/80 border-blue-400 shadow-blue-500/25 text-blue-400'
                : tradingState === 'recovering'
                ? 'bg-amber-950/80 border-amber-400 shadow-amber-500/25 text-amber-400'
                : 'bg-emerald-950/80 border-emerald-400 shadow-emerald-500/25 text-emerald-400'
            }`}>
              <Cpu className="w-7 h-7" />
            </div>
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              3. สถานะการเทรด (Trading)
            </span>
            <h3 className={`text-lg font-bold mt-1 ${
              tradingState === 'in_position' ? 'text-blue-400' :
              tradingState === 'recovering' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {tradingState === 'idle' && '⚪ รอสัญญาณเข้า'}
              {tradingState === 'in_position' && `🔵 ถือออเดอร์ (${activeOrders} ไม้)`}
              {tradingState === 'recovering' && `🟡 กำลังแก้ไม้ (${activeOrders} ไม้)`}
              {tradingState === 'tp_hit' && '🟢 ปิดทำกำไรแล้ว!'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              กำไรวันนี้: <span className="text-emerald-400 font-mono font-bold">+${dailyPnl.toFixed(2)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Active Strategy Card & Emergency Controls */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs text-slate-400">กลยุทธ์ที่กำลังทำงานบน MT5:</span>
            <h2 className="text-xl font-bold text-white mt-0.5">{activeStrategy}</h2>
            <div className="flex items-center gap-2 mt-1 font-mono text-xs text-cyan-400">
              <span>{symbol}</span>
              <span>•</span>
              <span>Timeframe {timeframe}</span>
              <span>•</span>
              <span>Universal EA Magic: 889900</span>
            </div>
          </div>

          {/* Quick Simulation Toggles for Demonstration */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 px-2">ทดสอบเปลี่ยนสถานะ:</span>
            <button
              onClick={() => { setTradingState('idle'); setActiveOrders(0); }}
              className={`px-2.5 py-1 rounded-lg ${tradingState === 'idle' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'}`}
            >
              Idle
            </button>
            <button
              onClick={() => { setTradingState('in_position'); setActiveOrders(1); }}
              className={`px-2.5 py-1 rounded-lg ${tradingState === 'in_position' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
            >
              In Position
            </button>
            <button
              onClick={() => { setTradingState('recovering'); setActiveOrders(3); }}
              className={`px-2.5 py-1 rounded-lg ${tradingState === 'recovering' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400'}`}
            >
              แก้ไม้
            </button>
            <button
              onClick={() => { setTradingState('tp_hit'); setActiveOrders(0); setDailyPnl((p) => p + 15); }}
              className={`px-2.5 py-1 rounded-lg ${tradingState === 'tp_hit' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'}`}
            >
              TP Hit
            </button>
          </div>
        </div>

        {/* Emergency Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <button 
            onClick={() => alert('คำสั่งหยุดเปิดไม้ใหม่ถูกส่งไปยัง EA เรียบร้อยแล้ว')}
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-semibold text-xs tracking-wider uppercase transition-all"
          >
            <Pause className="w-4 h-4" />
            พักการเปิดไม้ใหม่ (Pause Trading)
          </button>
          <button 
            onClick={() => {
              if (confirm('คุณต้องการปิดรวบทุกออเดอร์บน MT5 ทันทีใช่หรือไม่?')) {
                setTradingState('idle');
                setActiveOrders(0);
                alert('🚨 คำสั่งปิดรวบฉุกเฉินถูกส่งไปยัง MT5 เรียบร้อยแล้ว');
              }
            }}
            className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-rose-950/50"
          >
            <OctagonAlert className="w-4 h-4 text-rose-400" />
            ปิดรวบทุกไม้ทันที (Emergency Close All)
          </button>
        </div>
      </div>

      {/* MT5 Universal EA Connection Setup Guide */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Download className="w-4 h-4 text-cyan-400" />
          วิธีเชื่อมต่อ Universal EA บนโปรแกรม MetaTrader 5
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          ผู้ใช้ทุกคนใช้ไฟล์ EA ตัวเดียวกัน เพียงดาวน์โหลดไฟล์ไปวางในโฟลเดอร์ <code className="text-cyan-300 font-mono">MQL5/Experts</code> และเปิดใช้งาน WebRequest บน MT5
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 font-mono block">1. Terminal Token ของคุณ:</span>
            <div className="flex items-center justify-between">
              <span className="font-mono text-cyan-400 font-bold">{terminalToken}</span>
              <button 
                onClick={() => navigator.clipboard.writeText(terminalToken)}
                className="text-slate-500 hover:text-white"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-400 font-mono block">2. Allowed WebRequest URL:</span>
            <div className="flex items-center justify-between">
              <span className="font-mono text-cyan-400 font-bold">http://localhost:3000</span>
              <button onClick={handleCopyUrl} className="text-slate-500 hover:text-white">
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {copied && (
          <span className="text-[11px] text-emerald-400 block">คัดลอก URL สำเร็จ!</span>
        )}
      </div>
    </div>
  );
}
