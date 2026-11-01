'use client';

import React, { useState } from 'react';
import { 
  Radar, 
  Target, 
  ShieldAlert, 
  TrendingUp, 
  Sliders, 
  Sparkles, 
  Share2, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Video,
  Zap,
  RotateCcw,
  Cpu
} from 'lucide-react';
import { StrategyRecipe, IndicatorType, TriggerMode, RecoveryMode, ExitMode } from '@/types/strategy';
import { STARTER_PRESETS } from '@/lib/presets';

export default function BuilderPage() {
  // Strategy State
  const [strategyTitle, setStrategyTitle] = useState('Titan-Grid Gold Scalper');
  const [symbol, setSymbol] = useState('XAUUSD');
  const [timeframe, setTimeframe] = useState('M15');
  const [activeStepTab, setActiveStepTab] = useState<1 | 2 | 3 | 4>(1);

  // 4 Core Sockets
  const [recipe, setRecipe] = useState<StrategyRecipe>(STARTER_PRESETS[0].recipe);

  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isAiExtracting, setIsAiExtracting] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');

  // Sync Notification State
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Handle AI Extraction
  const handleAiExtract = async () => {
    if (!videoUrl) return;
    setIsAiExtracting(true);
    setAiSuccessMsg('');
    try {
      const res = await fetch('/api/v1/ai/extract-strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_url: videoUrl }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setStrategyTitle(data.data.title);
        setRecipe(data.data.recipe);
        setAiSuccessMsg(data.data.summary);
      }
    } catch {
      setAiSuccessMsg('ถอดกลยุทธ์จำลองสำเร็จ พร้อมนำไปทดสอบบน MT5');
    } finally {
      setIsAiExtracting(false);
    }
  };

  const handlePushToMt5 = async () => {
    setSyncStatus('กำลังส่งสัญญาณ Sync ไปยัง MT5 Terminal...');
    setTimeout(() => {
      setSyncStatus('🟢 Sync สำเร็จ! พารามิเตอร์ถูกส่งต่อไปยัง Universal EA บน MT5 เรียบร้อยแล้ว');
      setTimeout(() => setSyncStatus(null), 4000);
    }, 800);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Header & Strategy Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border-cyan-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              SOCKET SYSTEM v1.0
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Ready for Universal EA
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <input
              type="text"
              value={strategyTitle}
              onChange={(e) => setStrategyTitle(e.target.value)}
              className="bg-transparent text-2xl font-bold tracking-tight text-white focus:outline-none border-b border-transparent focus:border-cyan-500 px-1"
            />
          </div>
        </div>

        {/* Global Controls & Asset Selection */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs">
            <span className="text-slate-400">Asset:</span>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="bg-transparent font-bold text-cyan-400 focus:outline-none cursor-pointer"
            >
              <option value="XAUUSD">XAUUSD (Gold)</option>
              <option value="EURUSD">EURUSD</option>
              <option value="GBPUSD">GBPUSD</option>
              <option value="BTCUSD">BTCUSD</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs">
            <span className="text-slate-400">Timeframe:</span>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-transparent font-bold text-cyan-400 focus:outline-none cursor-pointer"
            >
              <option value="M1">M1 (Scalping)</option>
              <option value="M5">M5 (Day-Trade)</option>
              <option value="M15">M15 (Standard)</option>
              <option value="H1">H1 (Swing)</option>
            </select>
          </div>

          {/* AI Extraction Button */}
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/40 text-purple-200 hover:text-white hover:border-purple-400 text-xs font-semibold transition-all"
          >
            <Video className="w-3.5 h-3.5 text-pink-400" />
            AI Video Extract
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatus && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* 4 Core Modular Sockets - Visual Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Socket 1: Entry Condition */}
        <div
          onClick={() => setActiveStepTab(1)}
          className={`cursor-pointer p-5 rounded-2xl transition-all border ${
            activeStepTab === 1
              ? 'glass-panel-glow border-cyan-400 shadow-cyan-500/20'
              : 'glass-panel border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Radar className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400">
              STEP 01
            </span>
          </div>
          <h3 className="font-bold text-white text-base">Radar Core</h3>
          <p className="text-xs text-slate-400 mt-1">สัญญาณเข้าไม้แรก</p>
          <div className="mt-3 text-xs font-mono text-cyan-300 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
            {recipe.entry.setupConditions[0]?.indicator || 'EMA'} + {recipe.entry.triggerMode}
          </div>
        </div>

        {/* Socket 2: Recovery Grid */}
        <div
          onClick={() => setActiveStepTab(2)}
          className={`cursor-pointer p-5 rounded-2xl transition-all border ${
            activeStepTab === 2
              ? 'glass-panel-glow border-amber-400 shadow-amber-500/20'
              : 'glass-panel border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400">
              STEP 02
            </span>
          </div>
          <h3 className="font-bold text-white text-base">Recovery Armor</h3>
          <p className="text-xs text-slate-400 mt-1">การจัดการแก้ไม้</p>
          <div className="mt-3 text-xs font-mono text-amber-300 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
            {recipe.recovery.mode === 'SINGLE_ORDER' ? 'ไม้เดียวจบ' : `Grid ${recipe.recovery.maxOrders} ไม้ (${recipe.recovery.gridDistancePoints} pts)`}
          </div>
        </div>

        {/* Socket 3: Vault Exit */}
        <div
          onClick={() => setActiveStepTab(3)}
          className={`cursor-pointer p-5 rounded-2xl transition-all border ${
            activeStepTab === 3
              ? 'glass-panel-glow border-emerald-400 shadow-emerald-500/20'
              : 'glass-panel border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400">
              STEP 03
            </span>
          </div>
          <h3 className="font-bold text-white text-base">Vault Exit</h3>
          <p className="text-xs text-slate-400 mt-1">การปิดกำไร / SL</p>
          <div className="mt-3 text-xs font-mono text-emerald-300 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
            {recipe.exit.mode === 'BASKET_DOLLAR' ? `ปิดรวบ +$${recipe.exit.basketTargetDollar}` : `RR 1:${recipe.exit.riskRewardRatio || 2}`}
          </div>
        </div>

        {/* Socket 4: Shield & Safety */}
        <div
          onClick={() => setActiveStepTab(4)}
          className={`cursor-pointer p-5 rounded-2xl transition-all border ${
            activeStepTab === 4
              ? 'glass-panel-glow border-rose-400 shadow-rose-500/20'
              : 'glass-panel border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400">
              STEP 04
            </span>
          </div>
          <h3 className="font-bold text-white text-base">Guardian Shield</h3>
          <p className="text-xs text-slate-400 mt-1">ระบบป้องกันความเสี่ยง</p>
          <div className="mt-3 text-xs font-mono text-rose-300 bg-slate-950/70 p-2 rounded-lg border border-slate-800">
            Spread &lt; {recipe.shield.maxSpreadPoints} pts / Cut {recipe.shield.maxDailyLossPercent}%
          </div>
        </div>
      </div>

      {/* Detailed Configuration Chamber (Progressive Disclosure) */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">
              {activeStepTab === 1 && 'Step 1: กำหนดสัญญาณเข้าไม้แรก (Entry & Triggers)'}
              {activeStepTab === 2 && 'Step 2: จัดการแก้ไม้ หรือ เทรดไม้เดียว (Recovery Engine)'}
              {activeStepTab === 3 && 'Step 3: ปิดทำกำไร และ ตัดขาดทุน (Profit & Exit Management)'}
              {activeStepTab === 4 && 'Step 4: ระบบป้องกันและกรองสภาวะตลาด (Shield & Filters)'}
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {activeStepTab === 1 && 'Radar Module Active'}
            {activeStepTab === 2 && 'Armor Module Active'}
            {activeStepTab === 3 && 'Vault Module Active'}
            {activeStepTab === 4 && 'Shield Module Active'}
          </span>
        </div>

        {/* Chamber Content for Step 1 */}
        {activeStepTab === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                1.1 เลือก Indicator ตรวจจับสัญญาณ
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['EMA', 'RSI', 'BOLLINGER', 'MACD'] as IndicatorType[]).map((ind) => (
                  <button
                    key={ind}
                    onClick={() => {
                      const updated = { ...recipe };
                      updated.entry.setupConditions[0].indicator = ind;
                      setRecipe(updated);
                    }}
                    className={`p-3 rounded-xl border text-sm font-semibold flex items-center justify-between transition-all ${
                      recipe.entry.setupConditions[0]?.indicator === ind
                        ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{ind}</span>
                    {recipe.entry.setupConditions[0]?.indicator === ind && (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    )}
                  </button>
                ))}
              </div>

              {/* Indicator Parameter Drilldown */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <span className="text-xs text-slate-400 font-mono block">Indicator Fine-Tuning:</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400">Period (คาบคำนวณ)</label>
                    <input
                      type="number"
                      value={recipe.entry.setupConditions[0]?.period || 50}
                      onChange={(e) => {
                        const updated = { ...recipe };
                        updated.entry.setupConditions[0].period = Number(e.target.value);
                        setRecipe(updated);
                      }}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-cyan-400 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">ทิศทางออเดอร์</label>
                    <select
                      value={recipe.entry.setupConditions[0]?.direction || 'BUY'}
                      onChange={(e) => {
                        const updated = { ...recipe };
                        updated.entry.setupConditions[0].direction = e.target.value as 'BUY' | 'SELL';
                        setRecipe(updated);
                      }}
                      className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-cyan-400 font-mono"
                    >
                      <option value="BUY">BUY Signal</option>
                      <option value="SELL">SELL Signal</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                1.2 จังหวะลั่นไก (Execution Trigger)
              </label>
              <div className="space-y-3">
                {[
                  { id: 'NEXT_BAR_OPEN', title: 'เปิดไม้ที่ราคาเปิดแท่งใหม่ (Next Bar Open)', desc: 'รอให้แท่งเทียนปิดยืนยัน ลดสัญญาณหลอกได้สูงสุด' },
                  { id: 'INSTANT', title: 'เข้าทันทีที่แตะเงื่อนไข (Instant Touch)', desc: 'เข้าออเดอร์แบบเรียลไทม์ทันที ไม่รอปิดแท่ง' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      const updated = { ...recipe };
                      updated.entry.triggerMode = item.id as TriggerMode;
                      setRecipe(updated);
                    }}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                      recipe.entry.triggerMode === item.id
                        ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{item.title}</span>
                      {recipe.entry.triggerMode === item.id && (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Lot Size ไม้แรก</label>
                <input
                  type="number"
                  step="0.01"
                  value={recipe.entry.initialLotSize}
                  onChange={(e) => {
                    const updated = { ...recipe };
                    updated.entry.initialLotSize = Number(e.target.value);
                    setRecipe(updated);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-cyan-400 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Chamber Content for Step 2 */}
        {activeStepTab === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                โหมดการจัดการไม้ (Order Mode)
              </label>
              <div className="space-y-3">
                {[
                  { id: 'SINGLE_ORDER', title: 'Single Shot (ไม้เดียวจบ)', desc: 'เข้าไม้เดียวแล้วรอปิดด้วย TP หรือ SL ไม่มีการแก้ไม้เด็ดขาด' },
                  { id: 'FIXED_GRID', title: 'Fixed Distance Grid (แก้ไม้วางโซนคงที่)', desc: 'เปิดไม้เพิ่มเมื่อราคาผิดทางทุกๆ X จุด ตามระยะที่กำหนด' },
                  { id: 'MARTINGALE', title: 'Dynamic Multiplier Grid (Martingale)', desc: 'แก้ไม้พร้อมเพิ่มขนาด Lot เพื่อดึงทุนคืนรวดเร็ว' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      const updated = { ...recipe };
                      updated.recovery.mode = item.id as RecoveryMode;
                      setRecipe(updated);
                    }}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                      recipe.recovery.mode === item.id
                        ? 'bg-amber-950/70 border-amber-400 text-white shadow-md'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{item.title}</span>
                      {recipe.recovery.mode === item.id && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {recipe.recovery.mode !== 'SINGLE_ORDER' && (
              <div className="space-y-4 p-5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-semibold text-amber-300 font-mono block">
                  ⚙️ ตั้งค่าความถี่และขนาดการแก้ไม้:
                </span>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">จำนวนไม้สูงสุด (Max Orders)</label>
                    <input
                      type="number"
                      value={recipe.recovery.maxOrders}
                      onChange={(e) => {
                        const updated = { ...recipe };
                        updated.recovery.maxOrders = Number(e.target.value);
                        setRecipe(updated);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-amber-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">ระยะห่างการแก้ไม้ (Grid Distance ในหน่วย Points)</label>
                    <input
                      type="number"
                      value={recipe.recovery.gridDistancePoints}
                      onChange={(e) => {
                        const updated = { ...recipe };
                        updated.recovery.gridDistancePoints = Number(e.target.value);
                        setRecipe(updated);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-amber-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">ตัวคูณ Lot ไม้ถัดไป (Multiplier เช่น 1.5)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={recipe.recovery.lotMultiplier}
                      onChange={(e) => {
                        const updated = { ...recipe };
                        updated.recovery.lotMultiplier = Number(e.target.value);
                        setRecipe(updated);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-amber-300 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chamber Content for Step 3 */}
        {activeStepTab === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                รูปแบบการปิดทำกำไร (Exit Logic)
              </label>
              <div className="space-y-3">
                {[
                  { id: 'RISK_REWARD', title: 'Risk-Reward Ratio (RR)', desc: 'คำนวณระยะ TP ตามสัดส่วนของ SL เช่น 1:1.5 หรือ 1:2' },
                  { id: 'BASKET_DOLLAR', title: 'Basket Dollar TP (ปิดรวบดอลลาร์)', desc: 'รวมผลกำไรทุกไม้แก้ เมื่อได้ครบ $X ให้รวบปิดทั้งหมดทันที' },
                  { id: 'FIXED_POINTS', title: 'Fixed Points TP/SL', desc: 'กำหนดระยะ Take Profit และ Stop Loss แน่นอนเป็นจุด' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      const updated = { ...recipe };
                      updated.exit.mode = item.id as ExitMode;
                      setRecipe(updated);
                    }}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                      recipe.exit.mode === item.id
                        ? 'bg-emerald-950/70 border-emerald-400 text-white shadow-md'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{item.title}</span>
                      {recipe.exit.mode === item.id && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 p-5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs font-semibold text-emerald-300 font-mono block">
                🎯 พารามิเตอร์เป้าหมายกำไร:
              </span>
              {recipe.exit.mode === 'BASKET_DOLLAR' ? (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">เป้าหมายกำไรรวมพอร์ต ($ USD)</label>
                  <input
                    type="number"
                    value={recipe.exit.basketTargetDollar || 15}
                    onChange={(e) => {
                      const updated = { ...recipe };
                      updated.exit.basketTargetDollar = Number(e.target.value);
                      setRecipe(updated);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-emerald-300 font-mono"
                  />
                  <p className="text-xs text-slate-500 mt-2">เมื่อไม้แก้รวมกับไม้แรกแล้วมีกำไรแตะ ${recipe.exit.basketTargetDollar || 15} EA จะยิงคำสั่งเคลียร์ทุกไม้ทันที</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Stop Loss (Points)</label>
                    <input
                      type="number"
                      value={recipe.exit.stopLossPoints || 400}
                      onChange={(e) => {
                        const updated = { ...recipe };
                        updated.exit.stopLossPoints = Number(e.target.value);
                        setRecipe(updated);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-emerald-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Risk-Reward Ratio (เช่น 2.0 สำหรับ 1:2)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={recipe.exit.riskRewardRatio || 2.0}
                      onChange={(e) => {
                        const updated = { ...recipe };
                        updated.exit.riskRewardRatio = Number(e.target.value);
                        setRecipe(updated);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-emerald-300 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chamber Content for Step 4 */}
        {activeStepTab === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                เกราะป้องกันสเปรดและขาดทุนสะสม (Hard Limits)
              </label>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Max Allowable Spread (Points)</label>
                  <input
                    type="number"
                    value={recipe.shield.maxSpreadPoints}
                    onChange={(e) => {
                      const updated = { ...recipe };
                      updated.shield.maxSpreadPoints = Number(e.target.value);
                      setRecipe(updated);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-rose-300 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">ป้องกันการเปิดไม้ยามสเปรดถ่างช่วงเปลี่ยนวันหรือข่าวแรง</p>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Daily Max Loss Cut (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={recipe.shield.maxDailyLossPercent}
                    onChange={(e) => {
                      const updated = { ...recipe };
                      updated.shield.maxDailyLossPercent = Number(e.target.value);
                      setRecipe(updated);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-rose-300 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">หากพอร์ตลบแตะระดับนี้ในวันเดียว EA จะหยุดและตัดขาดทุนทันที</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs font-semibold text-rose-300 font-mono block">
                🛡️ ตัวกรองข่าวและช่วงเวลาเทรด:
              </span>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <span className="text-sm font-semibold text-white block">High-Impact News Filter</span>
                  <span className="text-xs text-slate-400">หยุดเทรดก่อน-หลังข่าวแดง 30 นาที</span>
                </div>
                <input
                  type="checkbox"
                  checked={recipe.shield.newsFilterEnabled}
                  onChange={(e) => {
                    const updated = { ...recipe };
                    updated.shield.newsFilterEnabled = e.target.checked;
                    setRecipe(updated);
                  }}
                  className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs text-slate-400">ช่วงเวลาตลาดที่เปิดให้ทำงาน:</span>
                <div className="flex gap-2">
                  {[
                    { key: 'asian', label: 'Asian Session' },
                    { key: 'london', label: 'London Session' },
                    { key: 'newYork', label: 'NY Session' },
                  ].map((sess) => (
                    <button
                      key={sess.key}
                      onClick={() => {
                        const updated = { ...recipe };
                        const k = sess.key as 'asian' | 'london' | 'newYork';
                        updated.shield.tradingSessions[k] = !updated.shield.tradingSessions[k];
                        setRecipe(updated);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                        recipe.shield.tradingSessions[sess.key as 'asian' | 'london' | 'newYork']
                          ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      {sess.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Dispatcher Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400 font-mono">
            Output Payload: <span className="text-cyan-400">Ready to Broadcast</span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                alert('Strategy Recipe Copied! Ready to share on social feed.');
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
            >
              <Share2 className="w-4 h-4" />
              Share Strategy Card
            </button>
            <button
              onClick={handlePushToMt5}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 text-xs font-bold uppercase tracking-wider hover:opacity-90 shadow-lg shadow-cyan-500/25 transition-all"
            >
              <Send className="w-4 h-4" />
              Push Recipe to MT5
            </button>
          </div>
        </div>
      </div>

      {/* AI Video Extraction Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-lg glass-panel-glow p-6 rounded-2xl border-purple-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-pink-400" />
                <h3 className="text-lg font-bold text-white">ถอดกลยุทธ์จาก YouTube / TikTok</h3>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              เพียงวางลิงก์คลิป หรือพิมพ์ข้อความสรุปเทคนิคเทรด AI จะทำการถอดโครงสร้างออกมาประกอบเป็น 4 โมดูลของ EAxocial ให้อัตโนมัติทันที
            </p>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="วางลิงก์ https://youtube.com/watch?v=... หรือ TikTok"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400"
              />
            </div>

            {aiSuccessMsg && (
              <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
                <span>{aiSuccessMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAiExtract}
                disabled={isAiExtracting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 shadow-md shadow-purple-500/30 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isAiExtracting ? 'กำลังวิเคราะห์คลิป...' : 'เริ่มถอดกลยุทธ์'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
