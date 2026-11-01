'use client';

import React, { useState, useMemo } from 'react';
import { StrategyRecipe } from '@/types/strategy';
import { 
  Eye, 
  HelpCircle, 
  Layers, 
  Target, 
  Shield, 
  Sparkles, 
  Maximize2,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';

interface StrategySimulatorChartProps {
  recipe: StrategyRecipe;
  title?: string;
}

interface Candle {
  index: number;
  open: number;
  high: number;
  low: number;
  close: number;
  isUp: boolean;
  isSignal?: boolean;
  isTrigger?: boolean;
  isSwingExtreme?: boolean; // Swing Low for Buy, Swing High for Sell
  volume: number;
}

export default function StrategySimulatorChart({ recipe, title }: StrategySimulatorChartProps) {
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [activeStepFilter, setActiveStepFilter] = useState<'all' | 'step1' | 'step2' | 'step3'>('all');

  // Extract key strategy variables
  const direction = recipe.entry.setupConditions[0]?.direction || 'BUY';
  const isBuy = direction === 'BUY';

  const emaCond = recipe.entry.setupConditions.find(c => c.indicator === 'EMA');
  const hasEma = !!emaCond;
  const emaPeriod = emaCond?.period || 400;

  const stochCond = recipe.entry.setupConditions.find(c => c.indicator === 'STOCHASTIC');
  const hasStoch = !!stochCond;
  const stochK = stochCond?.stochKPeriod || 15;
  const stochSlowing = stochCond?.stochKSmoothing || 2;
  const stochD = stochCond?.stochDSmoothing || 9;

  const rsiCond = recipe.entry.setupConditions.find(c => c.indicator === 'RSI');
  const hasRsi = !hasStoch && !!rsiCond;

  const bbCond = recipe.entry.setupConditions.find(c => c.indicator === 'BOLLINGER');
  const hasBB = !hasStoch && !hasRsi && !!bbCond;

  const triggerMode = recipe.entry.triggerMode || 'NEXT_BAR_OPEN';
  const rrRatio = recipe.exit.riskRewardRatio || 1.5;
  const isSwingExit = recipe.exit.mode === 'SWING_LOW_HIGH_RR';

  // -------------------------------------------------------------
  // Procedural Realistic Market Simulation Generator
  // Generates 26 candles that naturally reflect the exact strategy
  // -------------------------------------------------------------
  const { candles, emaCurve, stochKCurve, stochDCurve, swingExtremePrice, entryPrice, stopLossPrice, takeProfitPrice, triggerIndex } = useMemo(() => {
    const totalBars = 26;
    const generated: Candle[] = [];

    // Base price anchor around Gold / XAUUSD
    const basePrice = 2650.0;
    let currentPrice = isBuy ? basePrice - 18.0 : basePrice + 18.0;

    // Phase 1 (Bars 0-8): Strong Trend in Direction of Strategy
    // Phase 2 (Bars 9-16): Pullback counter-trend with varying candle sizes
    // Phase 3 (Bar 17-18): Setup Extreme & Rejection (Pin bar / Stoch Extreme)
    // Phase 4 (Bar 19): Trigger Execution (Bar Open or Breakout)
    // Phase 5 (Bars 20-25): Expansion into Take Profit target

    const candleProfiles = [
      // Trend Start
      { delta: isBuy ? 3.5 : -3.5, wickTop: 1.2, wickBot: 1.0, vol: 65 },
      { delta: isBuy ? 2.8 : -2.8, wickTop: 0.8, wickBot: 0.6, vol: 50 },
      { delta: isBuy ? -1.2 : 1.2, wickTop: 1.5, wickBot: 1.4, vol: 30 }, // small counter
      { delta: isBuy ? 4.2 : -4.2, wickTop: 1.0, wickBot: 0.8, vol: 80 },
      { delta: isBuy ? 1.8 : -1.8, wickTop: 2.1, wickBot: 0.5, vol: 45 },
      { delta: isBuy ? 3.1 : -3.1, wickTop: 0.6, wickBot: 1.1, vol: 70 },
      { delta: isBuy ? -0.8 : 0.8, wickTop: 1.8, wickBot: 1.5, vol: 28 }, // doji
      { delta: isBuy ? 2.5 : -2.5, wickTop: 1.4, wickBot: 0.7, vol: 55 },
      { delta: isBuy ? 1.2 : -1.2, wickTop: 2.2, wickBot: 1.0, vol: 40 },

      // Pullback begins (Counter to trend)
      { delta: isBuy ? -2.6 : 2.6, wickTop: 1.1, wickBot: 1.8, vol: 48 },
      { delta: isBuy ? -3.4 : 3.4, wickTop: 1.5, wickBot: 0.9, vol: 62 },
      { delta: isBuy ? 1.1 : -1.1, wickTop: 1.9, wickBot: 1.2, vol: 35 }, // pause
      { delta: isBuy ? -4.1 : 4.1, wickTop: 0.8, wickBot: 1.6, vol: 75 },
      { delta: isBuy ? -2.9 : 2.9, wickTop: 1.2, wickBot: 2.0, vol: 58 },
      { delta: isBuy ? -3.8 : 3.8, wickTop: 0.9, wickBot: 1.4, vol: 68 },
      { delta: isBuy ? -2.2 : 2.2, wickTop: 1.6, wickBot: 1.5, vol: 45 },

      // Swing Extreme Bar (Bar 16: Oversold peak Stoch < 20 / Swing Low)
      { 
        delta: isBuy ? -1.5 : 1.5, 
        wickTop: isBuy ? 0.8 : 4.5, 
        wickBot: isBuy ? 4.5 : 0.8, // Long rejection wick!
        vol: 90, 
        isSwingExtreme: true 
      },

      // Signal Bar (Bar 17: %K crosses %D / Pin Bar)
      { 
        delta: isBuy ? 3.8 : -3.8, 
        wickTop: isBuy ? 1.1 : 2.5, 
        wickBot: isBuy ? 2.5 : 1.1, 
        vol: 85, 
        isSignal: true 
      },

      // Execution Trigger Bar (Bar 18: Next Bar Open or Breakout)
      { 
        delta: isBuy ? 3.2 : -3.2, 
        wickTop: isBuy ? 1.5 : 1.0, 
        wickBot: isBuy ? 0.9 : 1.5, 
        vol: 95, 
        isTrigger: true 
      },

      // Target Follow-through towards TP
      { delta: isBuy ? 2.7 : -2.7, wickTop: 1.2, wickBot: 0.8, vol: 70 },
      { delta: isBuy ? -1.0 : 1.0, wickTop: 1.8, wickBot: 1.6, vol: 35 },
      { delta: isBuy ? 4.4 : -4.4, wickTop: 1.1, wickBot: 0.7, vol: 88 },
      { delta: isBuy ? 3.6 : -3.6, wickTop: 1.4, wickBot: 0.9, vol: 82 },
      { delta: isBuy ? 2.9 : -2.9, wickTop: 1.0, wickBot: 1.1, vol: 78 },
      { delta: isBuy ? 3.8 : -3.8, wickTop: 0.8, wickBot: 1.0, vol: 92 },
      { delta: isBuy ? 2.1 : -2.1, wickTop: 1.5, wickBot: 0.9, vol: 60 },
    ];

    for (let i = 0; i < totalBars; i++) {
      const p = candleProfiles[i] || { delta: 1.5, wickTop: 1.0, wickBot: 1.0, vol: 50 };
      const open = currentPrice;
      const close = open + p.delta;
      const high = Math.max(open, close) + p.wickTop;
      const low = Math.min(open, close) - p.wickBot;
      const isUp = close >= open;

      generated.push({
        index: i,
        open,
        high,
        low,
        close,
        isUp,
        isSignal: p.isSignal,
        isTrigger: p.isTrigger,
        isSwingExtreme: p.isSwingExtreme,
        volume: p.vol,
      });

      currentPrice = close;
    }

    // Determine Swing Extreme Price (Lowest Low in last 8 bars before trigger for Buy)
    const swingExtremeBar = generated.find(c => c.isSwingExtreme) || generated[16];
    const swingPrice = isBuy ? swingExtremeBar.low : swingExtremeBar.high;

    // Trigger & Entry Bar
    const triggerBar = generated.find(c => c.isTrigger) || generated[18];
    const triggerIdx = triggerBar.index;

    // Entry Price calculation based on trigger mode
    let entryVal = isBuy ? triggerBar.open : triggerBar.open;
    if (triggerMode === 'BREAKOUT_BAR_HIGH') {
      const signalBar = generated[17];
      entryVal = isBuy ? signalBar.high + 0.3 : signalBar.low - 0.3;
    }

    // Stop Loss calculation (Swing Low/High vs fixed)
    let slVal: number;
    if (isSwingExit) {
      slVal = isBuy ? swingPrice - 0.8 : swingPrice + 0.8;
    } else {
      const pts = (recipe.exit.stopLossPoints || 350) / 100.0;
      slVal = isBuy ? entryVal - pts : entryVal + pts;
    }

    // Risk and Take Profit calculation based on RR
    const riskAmt = Math.abs(entryVal - slVal);
    const rewardAmt = riskAmt * rrRatio;
    const tpVal = isBuy ? entryVal + rewardAmt : entryVal - rewardAmt;

    // Generate Dynamic EMA Curve matching period
    // EMA 400 is very smooth and lies below price in Uptrend
    const emaPoints = generated.map((c, idx) => {
      const baseline = isBuy ? basePrice - 26.0 : basePrice + 26.0;
      const slope = isBuy ? idx * 0.45 : -idx * 0.45;
      return baseline + slope;
    });

    // Generate Stochastic %K and %D lines
    const stochKPoints = generated.map((_, idx) => {
      if (idx <= 8) return isBuy ? 65 + (idx % 3) * 5 : 35 - (idx % 3) * 5;
      if (idx <= 14) return isBuy ? 65 - (idx - 8) * 7.5 : 35 + (idx - 8) * 7.5;
      if (idx === 15) return isBuy ? 16 : 84; // Oversold dip below 20 (Step 2)
      if (idx === 16) return isBuy ? 12 : 88; // Deepest trough
      if (idx === 17) return isBuy ? 24 : 76; // Crossover up! (Step 3)
      if (idx === 18) return isBuy ? 45 : 55;
      return isBuy ? Math.min(85, 45 + (idx - 18) * 6) : Math.max(15, 55 - (idx - 18) * 6);
    });

    const stochDPoints = generated.map((_, idx) => {
      if (idx <= 8) return isBuy ? 60 : 40;
      if (idx <= 15) return isBuy ? 60 - (idx - 8) * 6.0 : 40 + (idx - 8) * 6.0;
      if (idx === 16) return isBuy ? 20 : 80;
      if (idx === 17) return isBuy ? 19 : 81; // %K crosses above %D here
      if (idx === 18) return isBuy ? 32 : 68;
      return isBuy ? Math.min(80, 32 + (idx - 18) * 5) : Math.max(20, 68 - (idx - 18) * 5);
    });

    return {
      candles: generated,
      emaCurve: emaPoints,
      stochKCurve: stochKPoints,
      stochDCurve: stochDPoints,
      swingExtremePrice: swingPrice,
      entryPrice: entryVal,
      stopLossPrice: slVal,
      takeProfitPrice: tpVal,
      triggerIndex: triggerIdx,
    };
  }, [recipe, direction, isBuy, hasEma, hasStoch, triggerMode, rrRatio, isSwingExit]);

  // SVG Coordinate Mathematics
  const width = 760;
  const height = 360;
  const pricePaneHeight = 230;
  const oscPaneHeight = 90;
  const rightAxisWidth = 65;
  const chartWidth = width - rightAxisWidth;

  // Price Min/Max bounds with padding
  const allPrices = candles.flatMap(c => [c.high, c.low, stopLossPrice, takeProfitPrice]);
  const minPrice = Math.min(...allPrices, ...emaCurve) - 2.5;
  const maxPrice = Math.max(...allPrices, ...emaCurve) + 2.5;

  const mapX = (idx: number) => {
    return 20 + (idx / (candles.length - 1)) * (chartWidth - 40);
  };

  const mapY = (price: number) => {
    return pricePaneHeight - ((price - minPrice) / (maxPrice - minPrice)) * (pricePaneHeight - 35) - 15;
  };

  const mapOscY = (val: number) => {
    // 0 -> bottom of osc pane, 100 -> top of osc pane
    const topY = pricePaneHeight + 25;
    const bottomY = pricePaneHeight + oscPaneHeight + 15;
    return bottomY - (val / 100) * (bottomY - topY);
  };

  const entryY = mapY(entryPrice);
  const slY = mapY(stopLossPrice);
  const tpY = mapY(takeProfitPrice);
  const triggerX = mapX(triggerIndex);

  // Path generator for curves
  const makePath = (points: number[], mapper: (v: number) => number) => {
    return points.reduce((acc, p, idx) => {
      const x = mapX(idx);
      const y = mapper(p);
      return idx === 0 ? `M ${x},${y}` : `${acc} L ${x},${y}`;
    }, '');
  };

  const emaPath = makePath(emaCurve, mapY);
  const stochKPath = makePath(stochKCurve, mapOscY);
  const stochDPath = makePath(stochDCurve, mapOscY);

  return (
    <div className="glass-panel-glow rounded-3xl p-6 border-cyan-500/30 space-y-5 select-none transition-all">
      {/* Simulation Cockpit Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              REALISTIC CANDLESTICK ENGINE
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Live Scenario: {isBuy ? 'Bullish Expansion (BUY)' : 'Bearish Breakdown (SELL)'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {isBuy ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-rose-400" />}
            {title || recipe.entry.setupConditions[0]?.indicator + ' Dynamic Simulator'}
          </h3>
        </div>

        {/* View Mode Filters */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs">
          {[
            { id: 'all', label: 'ภาพรวมทั้งหมด' },
            { id: 'step1', label: '1. เทรนด์ใหญ่' },
            { id: 'step2', label: '2. Oversold < 20' },
            { id: 'step3', label: '3. ลั่นไก & RR Box' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveStepFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                activeStepFilter === f.id
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* High-Fidelity SVG TradingView-style Candlestick Chart */}
      <div className="relative bg-[#080d1a] rounded-2xl border border-slate-800/90 p-2 overflow-hidden shadow-2xl">
        {/* Top-left Asset & Live Ticker Badges */}
        <div className="absolute top-3.5 left-4 z-20 flex flex-wrap items-center gap-3 text-xs font-mono pointer-events-none">
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-700/60 text-slate-200">
            <span className="text-cyan-400 font-bold">{recipe.symbol}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">{recipe.timeframe}</span>
          </div>

          {hasEma && (
            <div className="flex items-center gap-1 bg-amber-950/70 px-2.5 py-1 rounded-lg border border-amber-500/40 text-amber-300">
              <span className="w-2 h-0.5 bg-amber-400 rounded-full"></span>
              <span>EMA {emaPeriod}:</span>
              <span className="font-bold">{emaCurve[emaCurve.length - 1].toFixed(2)}</span>
            </div>
          )}

          {hasStoch && (
            <div className="flex items-center gap-2 bg-emerald-950/70 px-2.5 py-1 rounded-lg border border-emerald-500/40 text-[11px]">
              <span className="text-emerald-400 font-bold">%K ({stochK},{stochSlowing}): {stochKCurve[stochKCurve.length - 1].toFixed(1)}</span>
              <span className="text-orange-400 font-bold">%D ({stochD}): {stochDCurve[stochDCurve.length - 1].toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Floating Tooltip when hovering over a candle */}
        {hoveredCandle && (
          <div className="absolute top-3.5 right-20 z-20 bg-slate-900/95 border border-cyan-500/50 p-2 rounded-xl text-[11px] font-mono text-slate-300 flex items-center gap-3 shadow-xl backdrop-blur-md">
            <span>O: <strong className="text-white">{hoveredCandle.open.toFixed(2)}</strong></span>
            <span>H: <strong className="text-white">{hoveredCandle.high.toFixed(2)}</strong></span>
            <span>L: <strong className="text-white">{hoveredCandle.low.toFixed(2)}</strong></span>
            <span>C: <strong className={hoveredCandle.isUp ? 'text-emerald-400' : 'text-rose-400'}>{hoveredCandle.close.toFixed(2)}</strong></span>
            <span>Vol: <strong className="text-cyan-400">{hoveredCandle.volume}</strong></span>
          </div>
        )}

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          <defs>
            {/* Shaded Profit Green Box Gradient */}
            <linearGradient id="realProfitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.08" />
            </linearGradient>
            {/* Shaded Loss Red Box Gradient */}
            <linearGradient id="realLossGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.30" />
            </linearGradient>
            {/* Glow for Trigger Marker */}
            <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Horizontal Price Grid Lines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => {
            const p = minPrice + (maxPrice - minPrice) * ratio;
            const y = mapY(p);
            return (
              <g key={idx}>
                <line x1="0" y1={y} x2={chartWidth} y2={y} stroke="#172033" strokeDasharray="3 3" />
                {/* Right Axis Price Label */}
                <text x={chartWidth + 8} y={y + 3.5} fill="#475569" fontSize="10" fontFamily="monospace">
                  {p.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Right Axis Border */}
          <line x1={chartWidth} y1="0" x2={chartWidth} y2={height} stroke="#1e293b" strokeWidth="1" />

          {/* 1. Dynamic EMA Curve */}
          {hasEma && (activeStepFilter === 'all' || activeStepFilter === 'step1') && (
            <g>
              <path
                d={emaPath}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              <text x={chartWidth - 90} y={mapY(emaCurve[emaCurve.length - 1]) - 8} fill="#f59e0b" fontSize="9" fontFamily="monospace" fontWeight="bold">
                EMA {emaPeriod} (Trendline)
              </text>
            </g>
          )}

          {/* 2. Candlesticks Rendering with Variable Wicks and Real Bodies */}
          {candles.map((c) => {
            const x = mapX(c.index);
            const openY = mapY(c.open);
            const closeY = mapY(c.close);
            const highY = mapY(c.high);
            const lowY = mapY(c.low);
            const topY = Math.min(openY, closeY);
            const bodyHeight = Math.max(Math.abs(openY - closeY), 2.5);
            const color = c.isUp ? '#10b981' : '#f43f5e';
            const candleWidth = 9;

            return (
              <g 
                key={c.index}
                className="cursor-pointer transition-opacity hover:opacity-80"
                onMouseEnter={() => setHoveredCandle(c)}
                onMouseLeave={() => setHoveredCandle(null)}
              >
                {/* Volume Bar at bottom of price pane */}
                <rect
                  x={x - (candleWidth / 2)}
                  y={pricePaneHeight - (c.volume / 100) * 28}
                  width={candleWidth}
                  height={(c.volume / 100) * 28}
                  fill={c.isUp ? '#10b981' : '#f43f5e'}
                  opacity="0.18"
                />

                {/* Upper and Lower Shadow Wicks */}
                <line x1={x} y1={highY} x2={x} y2={lowY} stroke={color} strokeWidth="1.2" strokeLinecap="round" />

                {/* Candle Body */}
                <rect
                  x={x - (candleWidth / 2)}
                  y={topY}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={color}
                  stroke={color}
                  strokeWidth="0.8"
                  rx="1"
                />

                {/* Pin Bar / Rejection Highlight marker */}
                {c.isSwingExtreme && (activeStepFilter === 'all' || activeStepFilter === 'step2') && (
                  <g>
                    <circle cx={x} cy={isBuy ? lowY : highY} r="4" fill="#f59e0b" className="animate-pulse" />
                    <text x={x - 24} y={isBuy ? lowY + 14 : highY - 8} fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace">
                      {isBuy ? 'Swing Low' : 'Swing High'}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* 3. Trade Setup Boxes (TradingView Long/Short Position Tool style) */}
          {(activeStepFilter === 'all' || activeStepFilter === 'step3') && (
            <g>
              {/* Take Profit Target Box (Green) */}
              <rect
                x={triggerX}
                y={isBuy ? tpY : entryY}
                width={chartWidth - triggerX - 15}
                height={Math.abs(entryY - tpY)}
                fill="url(#realProfitGrad)"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                rx="4"
              />

              {/* Stop Loss Box (Red) */}
              <rect
                x={triggerX}
                y={isBuy ? entryY : slY}
                width={chartWidth - triggerX - 15}
                height={Math.abs(slY - entryY)}
                fill="url(#realLossGrad)"
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="3 3"
                rx="4"
              />

              {/* Entry Level Line */}
              <line
                x1={triggerX - 15}
                y1={entryY}
                x2={chartWidth - 10}
                y2={entryY}
                stroke="#06b6d4"
                strokeWidth="2"
              />
              {/* Entry Arrow Badge */}
              <g transform={`translate(${triggerX}, ${entryY})`}>
                <circle cx="0" cy="0" r="4.5" fill="#06b6d4" filter="url(#glowCyan)" />
                <rect x="8" y="-10" width="130" height="20" rx="6" fill="#082f49" stroke="#06b6d4" strokeWidth="1" />
                <text x="14" y="4" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                  {isBuy ? '▲ BUY' : '▼ SELL'} @ {entryPrice.toFixed(2)}
                </text>
              </g>

              {/* Take Profit Target Line & Price Tag */}
              <line
                x1={triggerX}
                y1={tpY}
                x2={chartWidth - 5}
                y2={tpY}
                stroke="#10b981"
                strokeWidth="2"
              />
              <rect x={chartWidth + 6} y={tpY - 9} width="54" height="18" rx="4" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
              <text x={chartWidth + 10} y={tpY + 3.5} fill="#34d399" fontSize="9.5" fontWeight="bold" fontFamily="monospace">
                {takeProfitPrice.toFixed(1)}
              </text>
              <text x={chartWidth - 160} y={isBuy ? tpY - 6 : tpY + 14} fill="#10b981" fontSize="10" fontWeight="bold" fontFamily="monospace">
                TARGET: TP (RR {rrRatio}x) +{Math.abs(takeProfitPrice - entryPrice).toFixed(1)} pts
              </text>

              {/* Stop Loss Line & Price Tag */}
              <line
                x1={triggerX}
                y1={slY}
                x2={chartWidth - 5}
                y2={slY}
                stroke="#f43f5e"
                strokeWidth="2"
              />
              <rect x={chartWidth + 6} y={slY - 9} width="54" height="18" rx="4" fill="#4c0519" stroke="#f43f5e" strokeWidth="1" />
              <text x={chartWidth + 10} y={slY + 3.5} fill="#fb7185" fontSize="9.5" fontWeight="bold" fontFamily="monospace">
                {stopLossPrice.toFixed(1)}
              </text>
              <text x={chartWidth - 170} y={isBuy ? slY + 14 : slY - 6} fill="#f43f5e" fontSize="10" fontWeight="bold" fontFamily="monospace">
                STOP: {isSwingExit ? 'Swing Low SL' : 'Fixed SL'} -{Math.abs(entryPrice - stopLossPrice).toFixed(1)} pts
              </text>
            </g>
          )}

          {/* Pane Separator Line */}
          <line x1="0" y1={pricePaneHeight + 5} x2={width} y2={pricePaneHeight + 5} stroke="#1e293b" strokeWidth="1.5" />

          {/* 4. Sub-Oscillator Panel (Stochastic %K/%D or RSI) */}
          <g transform={`translate(0, 0)`}>
            {/* Level 80 (Overbought) */}
            <line x1="0" y1={mapOscY(80)} x2={chartWidth} y2={mapOscY(80)} stroke="#334155" strokeDasharray="3 3" />
            <text x={chartWidth + 8} y={mapOscY(80) + 3} fill="#64748b" fontSize="8.5" fontFamily="monospace">80</text>

            {/* Level 20 (Oversold) */}
            <line x1="0" y1={mapOscY(20)} x2={chartWidth} y2={mapOscY(20)} stroke="#eab308" strokeDasharray="3 3" strokeWidth="1.2" />
            <text x={chartWidth + 8} y={mapOscY(20) + 3} fill="#eab308" fontSize="8.5" fontFamily="monospace" fontWeight="bold">20</text>

            {hasStoch && (
              <>
                {/* %D Line (Orange / Smooth) */}
                <path d={stochDPath} fill="none" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" />
                {/* %K Line (Green / Fast) */}
                <path d={stochKPath} fill="none" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" />

                {/* Oversold Dip Highlight Circle (Step 2) */}
                {(activeStepFilter === 'all' || activeStepFilter === 'step2') && (
                  <g>
                    <circle cx={mapX(16)} cy={mapOscY(12)} r="18" fill="#eab308" fillOpacity="0.16" stroke="#eab308" strokeWidth="1.5" />
                    <text x={mapX(16) - 30} y={mapOscY(12) + 26} fill="#eab308" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                      %K &lt; 20 (Step 2)
                    </text>
                  </g>
                )}

                {/* Crossover Highlight Point (Step 3) */}
                {(activeStepFilter === 'all' || activeStepFilter === 'step3') && (
                  <g>
                    <circle cx={mapX(17)} cy={mapOscY(24)} r="4" fill="#22c55e" />
                    <text x={mapX(17) + 6} y={mapOscY(24) - 6} fill="#22c55e" fontSize="9" fontWeight="bold" fontFamily="monospace">
                      %K Cross %D 🚀
                    </text>
                  </g>
                )}
              </>
            )}

            {hasRsi && (
              <path d={stochKPath} fill="none" stroke="#c084fc" strokeWidth="2.2" />
            )}
          </g>
        </svg>
      </div>

      {/* Dynamic Summary Cards Explaining Current Live Setup */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold font-mono">
            <span>01</span>
            <span>เทรนด์ใหญ่ (Trend Filter)</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            ราคาแท่งเทียนวิ่งอยู่ <strong>{isBuy ? 'เหนือเส้น EMA 400' : 'ใต้เส้น EMA 400'}</strong> ป้องกันการเทรดสวนแนวโน้มใหญ่
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold font-mono">
            <span>02</span>
            <span>จังหวะย่อตัว (Pullback Extreme)</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {hasStoch 
              ? <span>Stochastic (15,2,9) ย่อลงแตะ <strong>โซน Oversold &lt; 20</strong> บ่งชี้ราคาถูกในเทรนด์ขึ้น</span>
              : <span>รอราคาย่อตัวพักฐานเข้าสู่แนวรับ/แนวรับสำคัญ</span>}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono">
            <span>03</span>
            <span>คำนวณกำไร / ขาดทุน (RR {rrRatio}x)</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Stop Loss ห่าง <strong>{Math.abs(entryPrice - stopLossPrice).toFixed(1)} pts</strong> ➔ Take Profit เป้าหมาย <strong>+{Math.abs(takeProfitPrice - entryPrice).toFixed(1)} pts</strong> (RR {rrRatio} เท่า)
          </p>
        </div>
      </div>
    </div>
  );
}
