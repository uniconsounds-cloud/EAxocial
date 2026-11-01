// ====================================================================
// EAxocial - Core Strategy & Modular Recipe Types
// ====================================================================

export type IndicatorType = 
  | 'EMA' 
  | 'SMA' 
  | 'RSI' 
  | 'MACD' 
  | 'BOLLINGER' 
  | 'STOCHASTIC' 
  | 'SUPERTREND' 
  | 'PRICE_ACTION';

export type ComparisonOperator = 
  | 'ABOVE' 
  | 'BELOW' 
  | 'CROSS_UP' 
  | 'CROSS_DOWN' 
  | 'TOUCH_LOWER' 
  | 'TOUCH_UPPER'
  | 'STOCH_K_BELOW_LEVEL'      // e.g. %K < 20 (Step 2)
  | 'STOCH_K_CROSS_UP_D'       // e.g. %K Cross above %D (Step 3)
  | 'STOCH_K_CROSS_DOWN_D';

export type TriggerMode = 
  | 'NEXT_BAR_OPEN'       // รอแท่งเทียนปิดยืนยัน เข้าที่ราคาเปิดแท่งใหม่ (Confirm Bar)
  | 'INSTANT'             // เข้าทันทีเมื่อเงื่อนไขบรรลุ (Real-time Tick)
  | 'BREAKOUT_BAR_HIGH'   // เข้าเมื่อราคาวิ่งเบรกทะลุ High ของแท่งสัญญาณ
  | 'PIN_BAR_CONFIRM'     // รอแท่งเทียนปฏิเสธราคา (Rejection Pin Bar)
  | 'PULLBACK_RETEST';    // รอราคาย่อกลับมา Retest เส้น Indicator

export type RecoveryMode = 
  | 'SINGLE_ORDER' 
  | 'FIXED_GRID' 
  | 'DYNAMIC_ATR_GRID' 
  | 'MARTINGALE' 
  | 'HEDGING';

export type ExitMode = 
  | 'RISK_REWARD' 
  | 'SWING_LOW_HIGH_RR'   // SL ที่สวิง Low/High ก่อนหน้า และ TP ตามสัดส่วน RR (เช่น 1.5)
  | 'FIXED_POINTS' 
  | 'BASKET_DOLLAR' 
  | 'BASKET_PERCENT' 
  | 'TRAILING_STOP';

// Individual Condition inside Entry Step
export interface EntryCondition {
  id?: string;
  indicator: IndicatorType;
  timeframe: string; // 'M1', 'M5', 'M15', 'H1', 'H4'
  period: number;                 // For EMA, RSI, etc. (e.g. 400)
  periodSecondary?: number;       // For EMA 200 or Signal
  operator: ComparisonOperator;
  thresholdValue?: number;        // e.g. 20, 30, 70
  direction: 'BUY' | 'SELL';
  
  // Stochastic Specific Inputs (Image 1: 15, 2, 9)
  stochKPeriod?: number;          // %K Length (15)
  stochKSmoothing?: number;       // %K Smoothing (2)
  stochDSmoothing?: number;       // %D Smoothing (9)
  stochLevel?: number;            // e.g. 20
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
  maxOrders: number;
  gridDistancePoints: number;
  lotMultiplier: number;
  customLots?: number[];
}

// Step 3: Exit & Profit Taking
export interface ExitStep {
  mode: ExitMode;
  takeProfitPoints?: number;
  stopLossPoints?: number;
  riskRewardRatio?: number;        // e.g. 1.5x
  swingLookbackBars?: number;     // e.g. 10 bars for Swing Low/High
  basketTargetDollar?: number;
  basketTargetPercent?: number;
  trailingStartPoints?: number;
  trailingStepPoints?: number;
}

// Step 4: Shield & Risk Filters
export interface ShieldStep {
  maxSpreadPoints: number;
  maxDailyLossPercent: number;
  maxAccountDrawdownPercent: number;
  newsFilterEnabled: boolean;
  newsBufferMinutes: number;
  tradingSessions: {
    asian: boolean;
    london: boolean;
    newYork: boolean;
  };
}

// The Unified Strategy Recipe Schema
export interface StrategyRecipe {
  version: string;
  symbol: string;
  timeframe: string;
  entry: EntryStep;
  recovery: RecoveryStep;
  exit: ExitStep;
  shield: ShieldStep;
}

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
  aggression_level: number;
  defense_level: number;
  tags: string[];
  is_public: boolean;
  is_verified: boolean;
  version: string;
  likes_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
}

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
