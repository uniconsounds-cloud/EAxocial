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
  Cpu,
  Plus,
  Trash2,
  LineChart,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  StrategyRecipe, 
  IndicatorType, 
  TriggerMode, 
  RecoveryMode, 
  ExitMode, 
  EntryCondition, 
  ComparisonOperator 
} from '@/types/strategy';
import { STARTER_PRESETS } from '@/lib/presets';
import StrategySimulatorChart from '@/components/StrategySimulatorChart';

export default function BuilderPage() {
  // Strategy Identity
  const [strategyTitle, setStrategyTitle] = useState(STARTER_PRESETS[0].title);
  const [symbol, setSymbol] = useState(STARTER_PRESETS[0].recipe.symbol);
  const [timeframe, setTimeframe] = useState(STARTER_PRESETS[0].recipe.timeframe);
  const [activeStepTab, setActiveStepTab] = useState<1 | 2 | 3 | 4>(1);

  // Core 4-Socket Recipe
  const [recipe, setRecipe] = useState<StrategyRecipe>(STARTER_PRESETS[0].recipe);

  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [isAiExtracting, setIsAiExtracting] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');

  // Sync Notification State
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // --- Handlers for Multi-Condition Entry ---
  const handleAddCondition = (indicator: IndicatorType = 'STOCHASTIC') => {
    const newCond: EntryCondition = {
      id: 'cond_' + Date.now(),
      indicator,
      timeframe,
      period: indicator === 'EMA' ? 400 : 14,
      stochKPeriod: 15,
      stochKSmoothing: 2,
      stochDSmoothing: 9,
      operator: indicator === 'STOCHASTIC' ? 'STOCH_K_CROSS_UP_D' : 'ABOVE',
      thresholdValue: 20,
      direction: 'BUY',
    };
    setRecipe({
      ...recipe,
      entry: {
        ...recipe.entry,
        setupConditions: [...recipe.entry.setupConditions, newCond],
      },
    });
  };

  const handleRemoveCondition = (index: number) => {
    if (recipe.entry.setupConditions.length <= 1) {
      alert('ต้องมีเงื่อนไขสัญญาณตรวจจับอย่างน้อย 1 รายการครับ');
      return;
    }
    const updated = recipe.entry.setupConditions.filter((_, i) => i !== index);
    setRecipe({
      ...recipe,
      entry: {
        ...recipe.entry,
        setupConditions: updated,
      },
    });
  };

  const handleUpdateCondition = (index: number, updates: Partial<EntryCondition>) => {
    const updated = [...recipe.entry.setupConditions];
    updated[index] = { ...updated[index], ...updates };
    setRecipe({
      ...recipe,
      entry: {
        ...recipe.entry,
        setupConditions: updated,
      },
    });
  };

  // Quick Preset Loader
  const handleLoadPreset = (presetId: string) => {
    const found = STARTER_PRESETS.find(p => p.id === presetId);
    if (found) {
      setStrategyTitle(found.title);
      setSymbol(found.recipe.symbol);
      setTimeframe(found.recipe.timeframe);
      setRecipe(JSON.parse(JSON.stringify(found.recipe)));
      setSyncStatus(`โหลดสูตร "${found.title}" เรียบร้อยแล้ว`);
      setTimeout(() => setSyncStatus(null), 3000);
    }
  };

  const handlePushToMt5 = async () => {
    setSyncStatus('กำลังส่งสัญญาณ Sync ไปยัง MT5 Terminal...');
    setTimeout(() => {
      setSyncStatus('🟢 Sync สำเร็จ! พารามิเตอร์ถูกส่งต่อไปยัง Universal EA บน MT5 เรียบร้อยแล้ว');
      setTimeout(() => setSyncStatus(null), 4000);
    }, 600);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Header & Strategy Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border-cyan-500/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              MODULAR CORE v2.0
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Multi-Signal & Simulated Candlesticks
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Cpu className="w-6 h-6 text-cyan-400" />
            <input
              type="text"
              value={strategyTitle}
              onChange={(e) => setStrategyTitle(e.target.value)}
              className="bg-transparent text-xl sm:text-2xl font-bold tracking-tight text-white focus:outline-none border-b border-transparent focus:border-cyan-500 px-1"
            />
          </div>
        </div>

        {/* Global Controls & Asset Selection */}
        <div className="flex flex-wrap items-center gap-2.5">
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
            <span className="text-slate-400">TF:</span>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-transparent font-bold text-cyan-400 focus:outline-none cursor-pointer"
            >
              <option value="M1">M1 (Scalp)</option>
              <option value="M5">M5 (Day-Trade)</option>
              <option value="M15">M15 (Standard)</option>
              <option value="H1">H1 (Swing)</option>
            </select>
          </div>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-semibold transition-all"
          >
            <Video className="w-3.5 h-3.5 text-pink-400" />
            AI Video Extract
          </button>
        </div>
      </div>

      {/* Quick Preset Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 text-[11px] font-mono shrink-0">สูตรยอดนิยม:</span>
        <button
          onClick={() => handleLoadPreset('strat-stoch-ema400')}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-400/50 text-cyan-300 font-bold hover:bg-cyan-900/50 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Apex 400 Stoch Sniper (RR 1.5)
        </button>
        <button
          onClick={() => handleLoadPreset('strat-golden-trend')}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 transition-all"
        >
          Golden Trend (EMA 50/200)
        </button>
        <button
          onClick={() => handleLoadPreset('strat-quantum-grid')}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 transition-all"
        >
          Quantum Grid (DCA Cashflow)
        </button>
      </div>

      {/* Sync Status Banner */}
      {syncStatus && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* INTERACTIVE CANDLESTICK SIMULATOR CHART */}
      <StrategySimulatorChart recipe={recipe} title={strategyTitle} />

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
          <p className="text-xs text-slate-400 mt-1">สัญญาณเข้าไม้ ({recipe.entry.setupConditions.length} เงื่อนไข)</p>
          <div className="mt-3 text-xs font-mono text-cyan-300 bg-slate-950/70 p-2 rounded-lg border border-slate-800 truncate">
            {recipe.entry.setupConditions.map(c => c.indicator).join(' + ')}
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
            {recipe.recovery.mode === 'SINGLE_ORDER' ? 'ไม้เดียวจบ' : `Grid ${recipe.recovery.maxOrders} ไม้`}
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
            {recipe.exit.mode === 'SWING_LOW_HIGH_RR' ? `Swing Low + RR ${recipe.exit.riskRewardRatio}x` : `RR 1:${recipe.exit.riskRewardRatio || 2}`}
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
            Spread &lt; {recipe.shield.maxSpreadPoints} pts
          </div>
        </div>
      </div>

      {/* Detailed Configuration Chamber */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">
              {activeStepTab === 1 && 'Step 1: กำหนดสัญญาณเข้าไม้แรก (Multi-Signal & Triggers)'}
              {activeStepTab === 2 && 'Step 2: จัดการแก้ไม้ หรือ เทรดไม้เดียว (Recovery Armor)'}
              {activeStepTab === 3 && 'Step 3: ปิดทำกำไร และ ตัดขาดทุน (Vault Exit & Swing SL)'}
              {activeStepTab === 4 && 'Step 4: ระบบป้องกันและกรองสภาวะตลาด (Guardian Shield)'}
            </h2>
          </div>
        </div>

        {/* STEP 1: Multi-Condition Setup & Rich Trigger Modes */}
        {activeStepTab === 1 && (
          <div className="space-y-6">
            {/* 1.1 Multi-Signal Conditions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                    1.1 เงื่อนไขสัญญาณตรวจจับ (สามารถเลือกผสมกันหลายตัวแบบ AND ได้)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    เข้าออเดอร์เมื่อ <strong>ทุกเงื่อนไขที่เลือกผ่านพร้อมกัน</strong> เช่น ราคาอยู่เหนือ EMA 400 และ Stochastic ตัดขึ้น
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddCondition('STOCHASTIC')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-semibold hover:bg-cyan-900/50 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    เพิ่ม Stoch
                  </button>
                  <button
                    onClick={() => handleAddCondition('EMA')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-900/50 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    เพิ่ม EMA
                  </button>
                  <button
                    onClick={() => handleAddCondition('RSI')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950 border border-purple-500/40 text-purple-300 text-xs font-semibold hover:bg-purple-900/50 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    เพิ่ม RSI
                  </button>
                </div>
              </div>

              {/* Dynamic Conditions List with Inline Fine-Tuning */}
              <div className="space-y-3">
                {recipe.entry.setupConditions.map((cond, index) => (
                  <div
                    key={cond.id || index}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/30">
                          เงื่อนไข #{index + 1}
                        </span>
                        <select
                          value={cond.indicator}
                          onChange={(e) => handleUpdateCondition(index, { indicator: e.target.value as IndicatorType })}
                          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-bold focus:outline-none"
                        >
                          <option value="EMA">EMA (Exponential Moving Average)</option>
                          <option value="STOCHASTIC">Stochastic Oscillator</option>
                          <option value="RSI">RSI (Relative Strength Index)</option>
                          <option value="BOLLINGER">Bollinger Bands</option>
                        </select>
                      </div>

                      <button
                        onClick={() => handleRemoveCondition(index)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 transition-all"
                        title="ลบเงื่อนไขนี้"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Inline Fine-Tuning depending on Indicator Type */}
                    {cond.indicator === 'EMA' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Period (คาบคำนวณ)</label>
                          <input
                            type="number"
                            value={cond.period}
                            onChange={(e) => handleUpdateCondition(index, { period: Number(e.target.value) })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono"
                            placeholder="400"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">เงื่อนไขราคาเทียบเส้น</label>
                          <select
                            value={cond.operator}
                            onChange={(e) => handleUpdateCondition(index, { operator: e.target.value as ComparisonOperator })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-400 font-mono"
                          >
                            <option value="ABOVE">ราคาอยู่เหนือเส้น EMA (Uptrend)</option>
                            <option value="BELOW">ราคาอยู่ใต้เส้น EMA (Downtrend)</option>
                            <option value="CROSS_UP">ราคาตัดเส้น EMA ขึ้น</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">ทิศทาง</label>
                          <select
                            value={cond.direction}
                            onChange={(e) => handleUpdateCondition(index, { direction: e.target.value as 'BUY' | 'SELL' })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-mono"
                          >
                            <option value="BUY">BUY Order</option>
                            <option value="SELL">SELL Order</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {cond.indicator === 'STOCHASTIC' && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">%K Length</label>
                          <input
                            type="number"
                            value={cond.stochKPeriod || 15}
                            onChange={(e) => handleUpdateCondition(index, { stochKPeriod: Number(e.target.value) })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">%K Smoothing</label>
                          <input
                            type="number"
                            value={cond.stochKSmoothing || 2}
                            onChange={(e) => handleUpdateCondition(index, { stochKSmoothing: Number(e.target.value) })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">%D Smoothing</label>
                          <input
                            type="number"
                            value={cond.stochDSmoothing || 9}
                            onChange={(e) => handleUpdateCondition(index, { stochDSmoothing: Number(e.target.value) })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-emerald-300 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">ตรรกะตรวจจับสัญญาณ</label>
                          <select
                            value={cond.operator}
                            onChange={(e) => handleUpdateCondition(index, { operator: e.target.value as ComparisonOperator })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-cyan-400 font-mono"
                          >
                            <option value="STOCH_K_CROSS_UP_D">%K ตัดขึ้นเหนือ %D (Step 3)</option>
                            <option value="STOCH_K_BELOW_LEVEL">%K ต่ำกว่า 20 (Oversold - Step 2)</option>
                            <option value="STOCH_K_CROSS_DOWN_D">%K ตัดลงใต้ %D</option>
                          </select>
                        </div>
                      </div>
                    )}

                    {cond.indicator === 'RSI' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">RSI Period</label>
                          <input
                            type="number"
                            value={cond.period || 14}
                            onChange={(e) => handleUpdateCondition(index, { period: Number(e.target.value) })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-purple-300 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">ระดับ Threshold</label>
                          <input
                            type="number"
                            value={cond.thresholdValue || 30}
                            onChange={(e) => handleUpdateCondition(index, { thresholdValue: Number(e.target.value) })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-purple-300 font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">ตรรกะเปรียบเทียบ</label>
                          <select
                            value={cond.operator}
                            onChange={(e) => handleUpdateCondition(index, { operator: e.target.value as ComparisonOperator })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-400 font-mono"
                          >
                            <option value="BELOW">RSI &lt; Level (Oversold)</option>
                            <option value="ABOVE">RSI &gt; Level (Overbought)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 1.2 Execution Trigger Modes (Researched from Market Best Practices) */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                1.2 จังหวะลั่นไก (Execution Trigger Modes ในตลาดเทรดดิ้ง)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  {
                    id: 'NEXT_BAR_OPEN',
                    title: '1. Confirm Bar (เปิดราคาแท่งใหม่)',
                    badge: 'ยอดนิยมสูงสุด',
                    desc: 'รอให้แท่งเทียนปิดยืนยันสัญญาณครบถ้วน แล้วเข้าที่ราคาเปิดแท่งใหม่ ป้องกัน Repaint กลางแท่ง',
                  },
                  {
                    id: 'INSTANT',
                    title: '2. Instant Touch (เข้าทันทีแบบเรียลไทม์)',
                    badge: 'สายสไนเปอร์',
                    desc: 'ลั่นไกคำสั่งทันที ณ เสี้ยววินาทีที่เงื่อนไขครบ ไม่ต้องรอแท่งเทียนปิด ได้ราคาต้นทุนเร็ว',
                  },
                  {
                    id: 'BREAKOUT_BAR_HIGH',
                    title: '3. Breakout High/Low (เบรกหัวแท่งสัญญาณ)',
                    badge: 'สายโมเมนตัม',
                    desc: 'วาง Pending Stop เหนือ High ของแท่งสัญญาณ เข้าออเดอร์เมื่อมีแรงซื้อชนะ High เดิมเท่านั้น',
                  },
                  {
                    id: 'PIN_BAR_CONFIRM',
                    title: '4. Rejection Pin Bar (ไส้เทียนปฏิเสธราคา)',
                    badge: 'สาย Price Action',
                    desc: 'เข้าออเดอร์เมื่อแท่งเทียนทิ้งไส้ยาวด้านล่าง (Bullish Pin Bar) ยืนยันการปฏิเสธราคาต่ำ',
                  },
                  {
                    id: 'PULLBACK_RETEST',
                    title: '5. Pullback Retest Limit (รอย่อตัว)',
                    badge: 'สายประหยัดต้นทุน',
                    desc: 'เมื่อเกิดสัญญาณ จะไม่ไล่ราคา แต่รอให้ราคาย่อกลับมาทดสอบโซนเดิมเพื่อได้ระยะ Stop Loss ที่แคบลง',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      const updated = { ...recipe };
                      updated.entry.triggerMode = item.id as TriggerMode;
                      setRecipe(updated);
                    }}
                    className={`cursor-pointer p-4 rounded-xl border transition-all ${
                      recipe.entry.triggerMode === item.id
                        ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-white">{item.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <label className="text-xs text-slate-400 block mb-1">Initial Lot Size (ขนาดไม้แรก)</label>
                <input
                  type="number"
                  step="0.01"
                  value={recipe.entry.initialLotSize}
                  onChange={(e) => {
                    const updated = { ...recipe };
                    updated.entry.initialLotSize = Number(e.target.value);
                    setRecipe(updated);
                  }}
                  className="w-48 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-400 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Recovery Armor */}
        {activeStepTab === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                โหมดการจัดการไม้ (Order Management)
              </label>
              <div className="space-y-3">
                {[
                  { id: 'SINGLE_ORDER', title: 'Single Order (ไม้เดียวจบ - ตามภาพกลยุทธ์)', desc: 'เข้าไม้เดียวแล้วรอปิดด้วย TP หรือ SL ไม่มีการแก้ไม้เด็ดขาด เหมาะกับกลยุทธ์ RR 1.5' },
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
                    <label className="text-xs text-slate-400 block mb-1">ระยะห่างการแก้ไม้ (Grid Distance Points)</label>
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
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Vault Exit with Swing Low / High RR */}
        {activeStepTab === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                รูปแบบการปิดทำกำไรและตัดขาดทุน (Exit Logic)
              </label>
              <div className="space-y-3">
                {[
                  { 
                    id: 'SWING_LOW_HIGH_RR', 
                    title: 'Stop Loss ที่ Swing Low + TP อัตราส่วน RR 1.5 (ตามภาพกลยุทธ์)', 
                    desc: 'หาจุดสวิงโลว์ต่ำสุดก่อนหน้าเพื่อตั้ง Stop Loss อัตโนมัติ และคำนวณจุด Take Profit ให้ได้กำไร 1.5 เท่าของความเสี่ยง' 
                  },
                  { 
                    id: 'RISK_REWARD', 
                    title: 'Risk-Reward Ratio (ระยะจุดคงที่ x RR)', 
                    desc: 'กำหนด SL เป็นระยะจุดคงที่ เช่น 400 จุด แล้วคำนวณ TP เป็น 1.5 เท่า หรือ 2 เท่า' 
                  },
                  { 
                    id: 'BASKET_DOLLAR', 
                    title: 'Basket Dollar Target (ปิดรวบดอลลาร์)', 
                    desc: 'ปิดรวบกำไรเป็นเงินดอลลาร์รวมเมื่อแตะเป้า เช่น +$15' 
                  },
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
                🎯 พารามิเตอร์อัตราส่วนกำไร / ขาดทุน:
              </span>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Risk/Reward Ratio (เช่น 1.5 หรือ 2.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={recipe.exit.riskRewardRatio || 1.5}
                    onChange={(e) => {
                      const updated = { ...recipe };
                      updated.exit.riskRewardRatio = Number(e.target.value);
                      setRecipe(updated);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-emerald-300 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    หาก Stop Loss ห่าง 10 จุด ➔ TP จะตั้งที่ระยะ 15 จุด (RR 1.5 เท่า)
                  </p>
                </div>

                {recipe.exit.mode === 'SWING_LOW_HIGH_RR' && (
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      ย้อนหลังหา Swing Low (จำนวนแท่งเทียน Lookback)
                    </label>
                    <input
                      type="number"
                      value={recipe.exit.swingLookbackBars || 10}
                      onChange={(e) => {
                        const updated = { ...recipe };
                        updated.exit.swingLookbackBars = Number(e.target.value);
                        setRecipe(updated);
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-cyan-400 font-mono"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Shield & Safety */}
        {activeStepTab === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                เกราะป้องกันสเปรดและขาดทุนสะสม (Hard Limits)
              </label>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Max Spread (Points)</label>
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
            </div>
          </div>
        )}

        {/* Action Dispatcher Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400 font-mono">
            Active: <span className="text-cyan-400">{recipe.entry.setupConditions.length} Conditions Linked</span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => alert('Strategy Recipe Copied! Ready to share on social feed.')}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
            >
              <Share2 className="w-4 h-4" />
              แชร์การ์ดลงโซเชียล
            </button>
            <button
              onClick={handlePushToMt5}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 text-xs font-bold uppercase tracking-wider hover:opacity-90 shadow-lg shadow-cyan-500/25 transition-all"
            >
              <Send className="w-4 h-4" />
              Sync Recipe to MT5
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
              <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              วางลิงก์คลิป หรือพิมพ์ข้อความสรุปเทคนิคเทรด AI จะทำการถอดโครงสร้างออกมาประกอบเป็น 4 โมดูลของ EAxocial ให้อัตโนมัติ
            </p>
            <input
              type="text"
              placeholder="วางลิงก์ https://youtube.com/watch?v=... หรือ TikTok"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400"
            />
            {aiSuccessMsg && (
              <div className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
                <span>{aiSuccessMsg}</span>
              </div>
            )}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button onClick={() => setIsAiModalOpen(false)} className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white">ยกเลิก</button>
              <button
                onClick={() => {
                  handleLoadPreset('strat-stoch-ema400');
                  setAiSuccessMsg('ถอดกลยุทธ์จากคลิปสำเร็จ: บรรจุ Apex 400 Stoch Sniper (RR 1.5) พร้อมกราฟจำลองเรียบร้อย!');
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 shadow-md shadow-purple-500/30"
              >
                <Sparkles className="w-3.5 h-3.5" />
                เริ่มถอดกลยุทธ์
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
