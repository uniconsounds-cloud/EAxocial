// ====================================================================
// EAxocial - Core Strategy & Modular Recipe Types
// ====================================================================

export type IndicatorType = 'EMA' | 'SMA' | 'RSI' | 'MACD' | 'BOLLINGER' | 'SUPERTREND' | 'PRICE_ACTION';

export type ComparisonOperator = 'ABOVE' | 'BELOW' | 'CROSS_UP' | 'CROSS_DOWN' | 'TOUCH_LOWER' | 'TOUCH_UPPER';

export type TriggerMode = 'INSTANT' | 'NEXT_BAR_OPEN' | 'PENDING_LIMIT' | 'PENDING_STOP';

export type RecoveryMode = 'SINGLE_ORDER' | 'FIXED_GRID' | 'DYNAMIC_ATR_GRID' | 'MARTINGALE' | 'HEDGING';

export type ExitMode = 'RISK_REWARD' | 'FIXED_POINTS' | 'BASKET_DOLLAR' | 'BASKET_PERCENT' | 'TRAILING_STOP';

// Step 1: Entry Condition
export interface EntryCondition {
  indicator: IndicatorType;
  timeframe: string; // 'M1', 'M5', 'M15', 'H1', 'H4'
  period: number;
  periodSecondary?: number; // e.g. for MACD Signal or EMA 200
  operator: ComparisonOperator;
  thresholdValue?: number; // e.g. RSI 30
  direction: 'BUY' | 'SELL';
}

export interface EntryStep {
  setupConditions: EntryCondition[];
  triggerMode: TriggerMode;
  initialLotSize: number;
  pendingOffsetPoints?: number;
}

// Step 2: Recovery / Money Management
export interface RecoveryStep {
  mode: RecoveryMode;
  maxOrders: number; // e.g. 5
  gridDistancePoints: number; // e.g. 300 points
  lotMultiplier: number; // 1.0 (Fixed), 1.5, 2.0 (Martingale)
  customLots?: number[]; // e.g. [0.01, 0.02, 0.03, 0.05]
}

// Step 3: Exit & Profit Taking
export interface ExitStep {
  mode: ExitMode;
  takeProfitPoints?: number; // per trade
  stopLossPoints?: number; // per trade
  riskRewardRatio?: number; // e.g. 1.5 (1:1.5)
  basketTargetDollar?: number; // e.g. +$10 for all orders combined
  basketTargetPercent?: number; // e.g. +2% of balance
  trailingStartPoints?: number;
  trailingStepPoints?: number;
}

// Step 4: Shield & Risk Filters
export interface ShieldStep {
  maxSpreadPoints: number; // e.g. 35
  maxDailyLossPercent: number; // e.g. 5.0%
  maxAccountDrawdownPercent: number; // e.g. 15.0%
  newsFilterEnabled: boolean;
  newsBufferMinutes: number; // e.g. 30 mins before/after high-impact
  tradingSessions: {
    asian: boolean;
    london: boolean;
    newYork: boolean;
  };
}

// The Unified Strategy Recipe Schema
export interface StrategyRecipe {
  version: string; // e.g. "1.0.0"
  symbol: string; // e.g. "XAUUSD"
  timeframe: string; // e.g. "M15"
  entry: EntryStep;
  recovery: RecoveryStep;
  exit: ExitStep;
  shield: ShieldStep;
}

// Full Strategy Record
export interface StrategyModel {
  id: string;
  author_id?: string;
  title: string;
  slug: string;
  description: string;
  source_video_url?: string;
  source_platform: 'manual' | 'youtube' | 'tiktok' | 'fork';
  forked_from_id?: string;
  recipe: StrategyRecipe;
  badge_type: 'cyber_core' | 'titanium_shield' | 'storm_strike' | 'quantum_grid';
  aggression_level: number; // 1 - 5
  defense_level: number; // 1 - 5
  tags: string[];
  is_public: boolean;
  is_verified: boolean;
  version: string;
  likes_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
}

// Live Terminal Status for Traffic Lights
export interface TerminalTelemetry {
  terminal_token: string;
  account_number: number;
  broker_name: string;
  ea_version: string;
  status: 'online' | 'offline' | 'syncing' | 'error';
  trading_state: 'idle' | 'in_position' | 'recovering' | 'tp_hit' | 'paused' | 'shield_cut';
  active_orders_count: number;
  daily_pnl: number;
  total_balance: number;
  total_equity: number;
  current_symbol: string;
  current_timeframe: string;
  last_heartbeat: string;
}
