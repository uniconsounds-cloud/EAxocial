'use client';

import React, { useState } from 'react';
import { StrategyRecipe } from '@/types/strategy';
import { 
  TrendingUp, 
  Target, 
  ShieldAlert, 
  Layers, 
  Sparkles, 
  Eye, 
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react';

interface StrategySimulatorChartProps {
  recipe: StrategyRecipe;
  title?: string;
}

export default function StrategySimulatorChart({ recipe, title }: StrategySimulatorChartProps) {
  const [activeStepPreview, setActiveStepPreview] = useState<number>(3); // 1: Trend, 2: Setup, 3: Trigger & RR

  // Detect which indicators are active
  const hasEma = recipe.entry.setupConditions.some(c => c.indicator === 'EMA');
  const emaCondition = recipe.entry.setupConditions.find(c => c.indicator === 'EMA');
  const emaPeriod = emaCondition?.period || 400;

  const hasStoch = recipe.entry.setupConditions.some(c => c.indicator === 'STOCHASTIC');
  const stochCondition = recipe.entry.setupConditions.find(c => c.indicator === 'STOCHASTIC');
  const stochK = stochCondition?.stochKPeriod || 15;
  const stochSmooth = stochCondition?.stochKSmoothing || 2;
  const stochD = stochCondition?.stochDSmoothing || 9;

  const hasRsi = recipe.entry.setupConditions.some(c => c.indicator === 'RSI');
  const rsiCondition = recipe.entry.setupConditions.find(c => c.indicator === 'RSI');

  const rrRatio = recipe.exit.riskRewardRatio || 1.5;
  const isSwingLowSL = recipe.exit.mode === 'SWING_LOW_HIGH_RR';

  // Realistic sample candlestick data representing the setup flow
  // (Uptrend above EMA 400 -> Pullback towards EMA -> Stoch < 20 -> Bullish Reversal Bar)
  const candles = [
    { x: 30,  o: 72, h: 78, l: 70, c: 76, isUp: true },
    { x: 55,  o: 76, h: 84, l: 74, c: 82, isUp: true },
    { x: 80,  o: 82, h: 90, l: 80, c: 88, isUp: true },
    { x: 105, o: 88, h: 92, l: 82, c: 84, isUp: false }, // Pullback begins
    { x: 130, o: 84, h: 86, l: 75, c: 77, isUp: false },
    { x: 155, o: 77, h: 80, l: 68, c: 70, isUp: false },
    { x: 180, o: 70, h: 72, l: 62, c: 64, isUp: false },
    { x: 205, o: 64, h: 66, l: 56, c: 58, isUp: false }, // Swing Low bar
    { x: 230, o: 58, h: 61, l: 54, c: 59, isUp: true },  // Stoch crosses up (%K > %D)
    { x: 255, o: 59, h: 71, l: 58, c: 68, isUp: true, isTrigger: true }, // Entry Trigger Candle
    { x: 280, o: 68, h: 78, l: 66, c: 76, isUp: true }, // Following through to Target
    { x: 305, o: 76, h: 86, l: 74, c: 84, isUp: true },
    { x: 330, o: 84, h: 94, l: 82, c: 92, isUp: true }, // TP Hit Zone!
  ];

  // SVG Chart Dimensions
  const width = 640;
  const priceHeight = 190;
  const oscHeight = 85;
  const padding = 20;

  // Coordinate mapper for price (Price 45 -> y:170, Price 100 -> y:20)
  const mapPriceY = (val: number) => {
    return priceHeight - ((val - 45) / (105 - 45)) * (priceHeight - 35) - 15;
  };

  // Swing Low & RR points
  const swingLowPrice = 54;
  const entryPrice = 68;
  const riskAmount = entryPrice - swingLowPrice; // 14
  const targetProfitPrice = entryPrice + (riskAmount * rrRatio); // 68 + 21 = 89

  const entryY = mapPriceY(entryPrice);
  const slY = mapPriceY(swingLowPrice);
  const tpY = mapPriceY(targetProfitPrice);
  const triggerCandleX = 255;

  return (
    <div className="glass-panel-glow rounded-2xl p-5 border-cyan-500/30 space-y-4 font-sans select-none">
      {/* Simulation Header & Flow Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              กราฟจำลองตรรกะตามกลยุทธ์ (Live Logic Simulator)
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                Interactive
              </span>
            </h4>
            <span className="text-[11px] text-slate-400">
              เห็นจุดเข้าไม้ (Entry), สวิงโลว์ (SL) และเป้ากำไร (RR {rrRatio}x) สดๆ ตามค่าที่คุณเลือก
            </span>
          </div>
        </div>

        {/* Step Flow Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveStepPreview(1)}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeStepPreview === 1 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            1. เทรนด์ใหญ่
          </button>
          <button
            onClick={() => setActiveStepPreview(2)}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeStepPreview === 2 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            2. Oversold
          </button>
          <button
            onClick={() => setActiveStepPreview(3)}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeStepPreview === 3 ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            3. เข้าไม้ + RR
          </button>
        </div>
      </div>

      {/* The Visual SVG Canvas */}
      <div className="relative bg-slate-950/95 rounded-xl border border-slate-800/80 p-2 overflow-hidden shadow-inner">
        {/* Top Watermark details */}
        <div className="absolute top-3 left-4 text-[10px] font-mono text-slate-500 flex items-center gap-3 z-10 pointer-events-none">
          <span className="text-cyan-400 font-bold">XAUUSD [M15]</span>
          {hasEma && <span className="text-amber-400">EMA ({emaPeriod}): 2,638.20</span>}
          {hasStoch && (
            <span className="text-emerald-400">
              Stoch ({stochK},{stochSmooth},{stochD}): %K 9.46 / %D 9.21
            </span>
          )}
        </div>

        <svg viewBox={`0 0 ${width} ${priceHeight + oscHeight + 10}`} className="w-full h-auto">
          <defs>
            {/* Shaded Profit Green Box Gradient */}
            <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
            </linearGradient>
            {/* Shaded Loss Red Box Gradient */}
            <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.25" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={mapPriceY(90)} x2={width} y2={mapPriceY(90)} stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="0" y1={mapPriceY(70)} x2={width} y2={mapPriceY(70)} stroke="#1e293b" strokeDasharray="3 3" />
          <line x1="0" y1={mapPriceY(50)} x2={width} y2={mapPriceY(50)} stroke="#1e293b" strokeDasharray="3 3" />

          {/* 1. EMA 400 Trend Line (Yellow smooth curved line at the bottom) */}
          <path
            d={`M 10,${mapPriceY(48)} Q 150,${mapPriceY(49)} 350,${mapPriceY(53)} T ${width},${mapPriceY(58)}`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <text x="15" y={mapPriceY(48) - 6} fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="bold">
            EMA {emaPeriod} (Uptrend Baseline)
          </text>

          {/* 2. Candlesticks */}
          {candles.map((c, i) => {
            const openY = mapPriceY(c.o);
            const closeY = mapPriceY(c.c);
            const highY = mapPriceY(c.h);
            const lowY = mapPriceY(c.l);
            const topY = Math.min(openY, closeY);
            const bodyHeight = Math.max(Math.abs(openY - closeY), 2);
            const color = c.isUp ? '#10b981' : '#f43f5e';

            return (
              <g key={i}>
                {/* Wick */}
                <line x1={c.x} y1={highY} x2={c.x} y2={lowY} stroke={color} strokeWidth="1.2" />
                {/* Body */}
                <rect
                  x={c.x - 5}
                  y={topY}
                  width="10"
                  height={bodyHeight}
                  fill={c.isUp ? '#10b981' : '#f43f5e'}
                  rx="1"
                />
                {/* Highlight trigger candle */}
                {c.isTrigger && activeStepPreview >= 3 && (
                  <circle cx={c.x} cy={lowY + 10} r="3" fill="#06b6d4" className="animate-ping" />
                )}
              </g>
            );
          })}

          {/* 3. Trade Setup Boxes (RR 1.5 Box & Swing Low SL) */}
          {activeStepPreview >= 3 && (
            <g>
              {/* Take Profit Box (Green) */}
              <rect
                x={triggerCandleX}
                y={tpY}
                width={width - triggerCandleX - 20}
                height={entryY - tpY}
                fill="url(#profitGrad)"
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              {/* Stop Loss Box (Red) */}
              <rect
                x={triggerCandleX}
                y={entryY}
                width={width - triggerCandleX - 20}
                height={slY - entryY}
                fill="url(#lossGrad)"
                stroke="#f43f5e"
                strokeWidth="1"
                strokeDasharray="2 2"
              />

              {/* Entry Line */}
              <line
                x1={triggerCandleX - 10}
                y1={entryY}
                x2={width - 20}
                y2={entryY}
                stroke="#06b6d4"
                strokeWidth="1.5"
              />
              <text x={triggerCandleX + 8} y={entryY - 4} fill="#06b6d4" fontSize="10" fontWeight="bold">
                ▲ BUY Entry ({recipe.entry.triggerMode === 'NEXT_BAR_OPEN' ? 'Open Bar' : 'Instant'})
              </text>

              {/* TP Line */}
              <line
                x1={triggerCandleX}
                y1={tpY}
                x2={width - 20}
                y2={tpY}
                stroke="#10b981"
                strokeWidth="1.5"
              />
              <text x={width - 150} y={tpY - 5} fill="#10b981" fontSize="9" fontWeight="bold" fontFamily="monospace">
                TARGET: TP (RR {rrRatio}x) +{(riskAmount * rrRatio).toFixed(1)} pts
              </text>

              {/* SL Line at Swing Low */}
              <line
                x1={205 - 15}
                y1={slY}
                x2={width - 20}
                y2={slY}
                stroke="#f43f5e"
                strokeWidth="1.5"
              />
              <text x={width - 165} y={slY + 12} fill="#f43f5e" fontSize="9" fontWeight="bold" fontFamily="monospace">
                STOP: Swing Low -{riskAmount.toFixed(1)} pts
              </text>

              {/* Small arrow pointing to Swing Low */}
              <circle cx="205" cy={slY} r="4" fill="#f43f5e" />
              <text x="180" y={slY + 16} fill="#f43f5e" fontSize="8" fontFamily="monospace">
                Swing Low
              </text>
            </g>
          )}

          {/* Divider between Main Chart and Oscillator Panel */}
          <line
            x1="0"
            y1={priceHeight}
            x2={width}
            y2={priceHeight}
            stroke="#334155"
            strokeWidth="1"
          />

          {/* Sub-Oscillator: Stochastic (%K & %D) or RSI */}
          <g transform={`translate(0, ${priceHeight + 10})`}>
            {/* Background & Zones */}
            <rect x="0" y="0" width={width} height={oscHeight - 10} fill="#090d16" />
            {/* Level 80 */}
            <line x1="0" y1="14" x2={width} y2="14" stroke="#334155" strokeDasharray="3 3" />
            <text x="5" y="12" fill="#64748b" fontSize="8" fontFamily="monospace">80 (Overbought)</text>

            {/* Level 20 */}
            <line x1="0" y1="52" x2={width} y2="52" stroke="#eab308" strokeDasharray="3 3" />
            <text x="5" y="50" fill="#eab308" fontSize="8" fontFamily="monospace">20 (Oversold Threshold)</text>

            {hasStoch ? (
              <>
                {/* %D Line (Orange - Smoothed) */}
                <path
                  d="M 10,35 Q 80,25 130,40 T 180,50 T 215,58 T 240,56 T 270,45 T 320,30"
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth="1.8"
                />
                {/* %K Line (Green - Fast) */}
                <path
                  d="M 10,40 Q 60,15 110,30 T 160,48 T 205,64 T 235,53 T 260,35 T 320,18"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2"
                />

                {/* Highlight Circle at Step 2 & 3: Stoch < 20 and Crossover */}
                {activeStepPreview >= 2 && (
                  <g>
                    <circle cx="215" cy="58" r="18" fill="#eab308" fillOpacity="0.15" stroke="#eab308" strokeWidth="1.5" />
                    <text x="238" y="66" fill="#eab308" fontSize="8" fontWeight="bold" fontFamily="monospace">
                      %K &lt; 20 (Step 2)
                    </text>
                  </g>
                )}
                {activeStepPreview >= 3 && (
                  <text x="248" y="44" fill="#22c55e" fontSize="8" fontWeight="bold" fontFamily="monospace">
                    %K Cross %D (Step 3) 🚀
                  </text>
                )}
              </>
            ) : (
              /* Generic RSI Line */
              <path
                d="M 10,32 Q 90,28 150,45 T 210,60 T 245,50 T 320,25"
                fill="none"
                stroke="#a855f7"
                strokeWidth="2"
              />
            )}
          </g>
        </svg>
      </div>

      {/* Logic Breakdown Description matching the selected step */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className={`p-3 rounded-xl border transition-all ${
          activeStepPreview === 1 ? 'bg-amber-950/40 border-amber-500/50 text-amber-200' : 'bg-slate-900/60 border-slate-800 text-slate-400'
        }`}>
          <span className="font-mono text-[10px] text-amber-400 font-bold block mb-1">
            STEP 01 • กรองเทรนด์ใหญ่
          </span>
          <p className="text-[11px] leading-relaxed">
            ราคาแท่งเทียนต้องอยู่ <strong>เหนือเส้น EMA {emaPeriod}</strong> เพื่อยืนยันว่าเป็นสภาวะขาขึ้น (Uptrend) ไม่เล่นสวนเทรนด์
          </p>
        </div>

        <div className={`p-3 rounded-xl border transition-all ${
          activeStepPreview === 2 ? 'bg-amber-950/40 border-amber-500/50 text-amber-200' : 'bg-slate-900/60 border-slate-800 text-slate-400'
        }`}>
          <span className="font-mono text-[10px] text-amber-400 font-bold block mb-1">
            STEP 02 • ตรวจจับโซนย่อตัว
          </span>
          <p className="text-[11px] leading-relaxed">
            รอให้ราคาดึงย่อตัวลงมาจนกระทั่ง <strong>Stochastic %K ต่ำกว่า 20</strong> บ่งบอกว่าเกิดภาวะ Oversold (ของถูกในเทรนด์ขึ้น)
          </p>
        </div>

        <div className={`p-3 rounded-xl border transition-all ${
          activeStepPreview === 3 ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200' : 'bg-slate-900/60 border-slate-800 text-slate-400'
        }`}>
          <span className="font-mono text-[10px] text-emerald-400 font-bold block mb-1">
            STEP 03 • ลั่นไก & ตั้ง RR
          </span>
          <p className="text-[11px] leading-relaxed">
            ลั่นไก Buy เมื่อ <strong>%K ตัดขึ้นเหนือ %D</strong> วาง Stop Loss ที่ <strong>สวิง Low ก่อนหน้า</strong> และตั้ง TP สัดส่วน <strong>RR {rrRatio} เท่า</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
