//+------------------------------------------------------------------+
//|                                             EAxocial_Client.mq5  |
//|                                  Copyright 2026, EAxocial System |
//|                                         https://www.eaxocial.com |
//+------------------------------------------------------------------+
#property copyright   "Copyright 2026, EAxocial System"
#property link        "https://www.eaxocial.com"
#property version     "1.00"
#property description "EAxocial Universal EA Client for MetaTrader 5"
#property description "Connects seamlessly to EAxocial Web Platform via HTTPS WebRequest"

#include <Trade\Trade.mqh>
#include <Trade\PositionInfo.mqh>
#include <Trade\AccountInfo.mqh>

//--- EA Inputs
input group "=== EAxocial Cloud Connection ==="
input string   InpTerminalToken    = "DEMO_TOKEN_12345";            // Terminal Secret Token
input string   InpServerBaseUrl    = "https://eaxocial.vercel.app";  // Web Platform URL
input int      InpSyncIntervalSec  = 3;                              // Sync Heartbeat Interval (Seconds)
input ulong    InpMagicNumber      = 889900;                         // EA Magic Number

input group "=== Local Safety Fallback ==="
input double   InpMaxSpreadPoints  = 40.0;                      // Max Allowable Spread (Points)
input double   InpMaxDailyLossPct  = 5.0;                       // Emergency Daily Loss Cut (%)

//--- Global Variables & State
CTrade         trade;
CPositionInfo  posInfo;
CAccountInfo   accInfo;

const string   CLIENT_VERSION      = "1.0.0";
string         g_currentServerVer  = "1.0.0";
bool           g_isVersionMatch    = true;
bool           g_isServerConnected = false;
bool           g_isTradingEnabled  = true;
string         g_tradingState      = "idle"; // idle, in_position, recovering, tp_hit, shield_cut, paused
string         g_strategyTitle     = "Apex 400 Stoch Sniper (RR 1.5)";
datetime       g_lastSyncTime      = 0;

// Strategy Parameters (Received from Web Recipe)
int            g_emaPeriod         = 400;
int            g_stochK            = 15;
int            g_stochSlowing      = 2;
int            g_stochD            = 9;
double         g_stochOversold     = 20.0;
double         g_riskRewardRatio   = 1.5;
int            g_swingLookback     = 10;
double         g_initialLot        = 0.02;
string         g_recoveryMode      = "SINGLE_ORDER"; // SINGLE_ORDER, FIXED_GRID
int            g_maxOrders         = 1;
int            g_gridDistancePts   = 300;
double         g_lotMultiplier     = 1.0;
string         g_exitMode          = "SWING_LOW_HIGH_RR";  // SWING_LOW_HIGH_RR, BASKET_DOLLAR
double         g_basketDollar      = 15.0;

// Indicator Handles
int            g_hEMA400           = INVALID_HANDLE;
int            g_hStoch            = INVALID_HANDLE;
int            g_hRSI              = INVALID_HANDLE;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   trade.SetExpertMagicNumber(InpMagicNumber);
   trade.SetMarginMode();
   trade.SetTypeFillingBySymbol(_Symbol);

   // Initialize Indicator Handles
   g_hEMA400 = iMA(_Symbol, _Period, g_emaPeriod, 0, MODE_EMA, PRICE_CLOSE);
   g_hStoch  = iStochastic(_Symbol, _Period, g_stochK, g_stochD, g_stochSlowing, MODE_SMA, STO_LOWHIGH);
   g_hRSI    = iRSI(_Symbol, _Period, 14, PRICE_CLOSE);

   // Create Timer for periodic WebRequest sync
   EventSetTimer(InpSyncIntervalSec);

   Print("🟢 EAxocial Client v", CLIENT_VERSION, " Initialized on ", _Symbol);
   Print("📡 Connecting to Web Platform: ", InpServerBaseUrl);

   UpdateChartHUD();
   SyncWithServer();

   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   IndicatorRelease(g_hEMA400);
   IndicatorRelease(g_hStoch);
   IndicatorRelease(g_hRSI);
   Comment("");
}

//+------------------------------------------------------------------+
//| Timer event function (Heartbeat & Sync)                          |
//+------------------------------------------------------------------+
void OnTimer()
{
   SyncWithServer();
   SendHeartbeat();
   UpdateChartHUD();
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   // 0. Web Control: Check if trading is paused from web platform
   if(!g_isTradingEnabled)
   {
      g_tradingState = "paused";
      UpdateChartHUD();
      return;
   }

   // 1. Safety Checks (Spread & Balance)
   double spread = (double)SymbolInfoInteger(_Symbol, SYMBOL_SPREAD);
   if(spread > InpMaxSpreadPoints)
   {
      g_tradingState = "shield_cut";
      UpdateChartHUD();
      return;
   }

   // 2. Count active EA orders on this symbol
   int totalEaOrders = 0;
   double totalFloatingProfit = 0.0;
   double lastOrderOpenPrice = 0.0;
   ENUM_POSITION_TYPE lastOrderType = POSITION_TYPE_BUY;

   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(posInfo.SelectByIndex(i))
      {
         if(posInfo.Magic() == InpMagicNumber && posInfo.Symbol() == _Symbol)
         {
            totalEaOrders++;
            totalFloatingProfit += posInfo.Profit() + posInfo.Swap();
            lastOrderOpenPrice = posInfo.PriceOpen();
            lastOrderType = posInfo.PositionType();
         }
      }
   }

   // 3. Basket Exit Management (Step 3: Exit)
   if(totalEaOrders > 0)
   {
      if(g_exitMode == "BASKET_DOLLAR" && totalFloatingProfit >= g_basketDollar)
      {
         Print("🎯 EAxocial Basket TP Hit: +$", DoubleToString(totalFloatingProfit, 2), " -> Closing all orders!");
         CloseAllPositions();
         g_tradingState = "tp_hit";
         UpdateChartHUD();
         return;
      }
      
      // Update Trading State
      if(totalEaOrders > 1)
         g_tradingState = "recovering";
      else
         g_tradingState = "in_position";
   }
   else
   {
      if(g_tradingState != "shield_cut")
         g_tradingState = "idle";
   }

   // 4. Recovery Management (Step 2: Recovery Grid)
   if(totalEaOrders > 0 && g_recoveryMode == "FIXED_GRID" && totalEaOrders < g_maxOrders)
   {
      double currentAsk = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
      double currentBid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
      double point = SymbolInfoDouble(_Symbol, SYMBOL_POINT);

      if(lastOrderType == POSITION_TYPE_BUY)
      {
         double distancePts = (lastOrderOpenPrice - currentAsk) / point;
         if(distancePts >= g_gridDistancePts)
         {
            double nextLot = NormalizeDouble(g_initialLot * MathPow(g_lotMultiplier, totalEaOrders), 2);
            trade.Buy(nextLot, _Symbol, currentAsk, 0, 0, "EAxocial Grid #" + IntegerToString(totalEaOrders + 1));
            Print("🔄 EAxocial Recovery Grid BUY Executed: Lot ", nextLot);
         }
      }
      return;
   }

   // 5. Entry Signal Evaluation (Step 1: Entry Condition)
   if(totalEaOrders == 0)
   {
      EvaluateEntrySignal();
   }
}

//+------------------------------------------------------------------+
//| Evaluate Entry Conditions: Apex 400 Stoch Sniper (RR 1.5)        |
//+------------------------------------------------------------------+
void EvaluateEntrySignal()
{
   double ema400[], stochK[], stochD[], closes[];
   ArraySetAsSeries(ema400, true);
   ArraySetAsSeries(stochK, true);
   ArraySetAsSeries(stochD, true);
   ArraySetAsSeries(closes, true);

   if(CopyBuffer(g_hEMA400, 0, 1, 2, ema400) < 2) return;
   if(CopyBuffer(g_hStoch, 0, 1, 3, stochK) < 3) return; // Buffer 0: %K
   if(CopyBuffer(g_hStoch, 1, 1, 3, stochD) < 3) return; // Buffer 1: %D
   if(CopyClose(_Symbol, _Period, 1, 2, closes) < 2) return;

   double currentAsk = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double point = SymbolInfoDouble(_Symbol, SYMBOL_POINT);

   // Step 1: Price is Above EMA 400 (Uptrend Baseline)
   bool cond1_emaUptrend = (closes[0] > ema400[0]);

   // Step 2: Stoch was in Oversold Zone (Below 20)
   bool cond2_stochOversold = (stochK[1] < g_stochOversold || stochK[2] < g_stochOversold);

   // Step 3: %K crosses above %D
   bool cond3_stochCrossUp = (stochK[0] > stochD[0] && stochK[1] <= stochD[1]);

   if(cond1_emaUptrend && cond2_stochOversold && cond3_stochCrossUp)
   {
      // Calculate Swing Low of past N bars for Stop Loss
      double lows[];
      ArraySetAsSeries(lows, true);
      CopyLow(_Symbol, _Period, 1, g_swingLookback, lows);
      
      double swingLow = lows[0];
      for(int k = 1; k < g_swingLookback; k++)
      {
         if(lows[k] < swingLow) swingLow = lows[k];
      }

      double sl = swingLow - (10.0 * point); // SL slightly below swing low
      double riskPoints = (currentAsk - sl) / point;

      // Minimum SL distance sanity check (at least 150 points)
      if(riskPoints < 150.0)
      {
         sl = currentAsk - (250.0 * point);
         riskPoints = 250.0;
      }

      // Target Profit calculated by Risk-Reward Ratio (e.g. 1.5x)
      double tp = currentAsk + (riskPoints * g_riskRewardRatio * point);

      if(trade.Buy(g_initialLot, _Symbol, currentAsk, sl, tp, "Apex 400 Stoch #1"))
      {
         Print("🚀 Apex Stoch Sniper BUY Executed: ", _Symbol, " Lot: ", g_initialLot, 
               " | SL: ", sl, " | TP (RR ", g_riskRewardRatio, "): ", tp);
         g_tradingState = "in_position";
         UpdateChartHUD();
      }
   }
}

//+------------------------------------------------------------------+
//| Close all positions belonging to this EA                         |
//+------------------------------------------------------------------+
void CloseAllPositions()
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(posInfo.SelectByIndex(i))
      {
         if(posInfo.Magic() == InpMagicNumber && posInfo.Symbol() == _Symbol)
         {
            trade.PositionClose(posInfo.Ticket());
         }
      }
   }
}

//+------------------------------------------------------------------+
//| WebRequest: Sync parameters from Web                             |
//+------------------------------------------------------------------+
void SyncWithServer()
{
   long login = AccountInfoInteger(ACCOUNT_LOGIN);
   string company = AccountInfoString(ACCOUNT_COMPANY);
   string url = InpServerBaseUrl + "/api/v1/ea/sync?token=" + InpTerminalToken + 
                "&version=" + CLIENT_VERSION + 
                "&account=" + IntegerToString(login) + 
                "&broker=" + company;
   string headers = "User-Agent: EAxocial-MT5-Client/" + CLIENT_VERSION + "\r\n";
   char postData[], resultData[];
   string resultHeaders;

   ResetLastError();
   int res = WebRequest("GET", url, headers, 3000, postData, resultData, resultHeaders);

   if(res == 200)
   {
      g_isServerConnected = true;
      g_lastSyncTime = TimeCurrent();
      string jsonResponse = CharArrayToString(resultData);
      
      // Check for version match in response
      if(StringFind(jsonResponse, "\"version_match\":true") >= 0)
         g_isVersionMatch = true;
      else if(StringFind(jsonResponse, "\"version_match\":false") >= 0)
         g_isVersionMatch = false;

      // Check for web trading pause/resume control
      if(StringFind(jsonResponse, "\"trading_enabled\":false") >= 0)
         g_isTradingEnabled = false;
      else if(StringFind(jsonResponse, "\"trading_enabled\":true") >= 0)
         g_isTradingEnabled = true;
   }
   else
   {
      g_isServerConnected = false;
      int err = GetLastError();
      Print("⚠️ EAxocial Sync WebRequest Failed! HTTP: ", res, " | Err: ", err, " | URL: ", url);
   }
}

//+------------------------------------------------------------------+
//| WebRequest: Send Heartbeat & Telemetry                           |
//+------------------------------------------------------------------+
void SendHeartbeat()
{
   if(!g_isServerConnected) return;

   string url = InpServerBaseUrl + "/api/v1/ea/heartbeat";
   string headers = "Content-Type: application/json\r\nUser-Agent: EAxocial-MT5-Client/" + CLIENT_VERSION + "\r\n";
   
   int activeCount = 0;
   for(int i = 0; i < PositionsTotal(); i++)
   {
      if(posInfo.SelectByIndex(i) && posInfo.Magic() == InpMagicNumber && posInfo.Symbol() == _Symbol)
         activeCount++;
   }

   string payload = StringFormat(
      "{\"terminal_token\":\"%s\",\"account_number\":%d,\"broker_name\":\"%s\",\"ea_version\":\"%s\",\"trading_state\":\"%s\",\"active_orders_count\":%d,\"total_balance\":%.2f,\"total_equity\":%.2f,\"current_symbol\":\"%s\",\"current_timeframe\":\"%s\"}",
      InpTerminalToken, AccountInfoInteger(ACCOUNT_LOGIN), AccountInfoString(ACCOUNT_COMPANY),
      CLIENT_VERSION, g_tradingState, activeCount,
      AccountInfoDouble(ACCOUNT_BALANCE), AccountInfoDouble(ACCOUNT_EQUITY),
      _Symbol, EnumToString(_Period)
   );

   char postData[], resultData[];
   StringToCharArray(payload, postData, 0, StringLen(payload));
   string resultHeaders;

   WebRequest("POST", url, headers, 3000, postData, resultData, resultHeaders);
}

//+------------------------------------------------------------------+
//| Minimalist Cyber Chart HUD (Traffic Light Display)               |
//+------------------------------------------------------------------+
void UpdateChartHUD()
{
   string syncIcon = g_isServerConnected ? "[ONLINE] Connected" : "[OFFLINE] Disconnected";
   string verIcon  = g_isVersionMatch ? "[MATCH] v" + CLIENT_VERSION + " (OK)" : "[UPDATE] Update Available";
   
   string stateIcon = "[IDLE] Waiting for Setup";
   if(g_tradingState == "in_position") stateIcon = "[IN POSITION] Holding Trade";
   else if(g_tradingState == "recovering") stateIcon = "[RECOVERING] Grid Zone Active";
   else if(g_tradingState == "tp_hit") stateIcon = "[TP HIT] Profit Secured!";
   else if(g_tradingState == "shield_cut") stateIcon = "[SHIELD] Risk Filter Active";

   string hud = "\n" +
      "===============================================\n" +
      "   >>> EAxocial Universal Terminal Bridge <<<  \n" +
      "===============================================\n" +
      " [STATUS]   " + syncIcon + "\n" +
      " [ENGINE]   " + verIcon + "\n" +
      " [ACTION]   " + stateIcon + "\n" +
      "-----------------------------------------------\n" +
      " Active Recipe : " + g_strategyTitle + "\n" +
      " Symbol / TF   : " + _Symbol + " [" + EnumToString(_Period) + "]\n" +
      " Balance / Eq  : $" + DoubleToString(AccountInfoDouble(ACCOUNT_BALANCE), 2) + 
      " / $" + DoubleToString(AccountInfoDouble(ACCOUNT_EQUITY), 2) + "\n" +
      "===============================================\n";

   Comment(hud);
}
//+------------------------------------------------------------------+
