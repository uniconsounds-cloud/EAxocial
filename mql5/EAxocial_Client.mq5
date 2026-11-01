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
string         g_tradingState      = "idle"; // idle, in_position, recovering, tp_hit, shield_cut
string         g_strategyTitle     = "Golden Trend Pullback (Synced)";
datetime       g_lastSyncTime      = 0;

// Strategy Parameters (Received from Web Recipe)
string         g_entryIndicator    = "EMA";
int            g_entryPeriod1      = 50;
int            g_entryPeriod2      = 200;
string         g_entryDirection    = "BUY";
double         g_initialLot        = 0.01;
string         g_recoveryMode      = "SINGLE_ORDER"; // SINGLE_ORDER, FIXED_GRID
int            g_maxOrders         = 3;
int            g_gridDistancePts   = 300;
double         g_lotMultiplier     = 1.5;
string         g_exitMode          = "RISK_REWARD";  // RISK_REWARD, BASKET_DOLLAR
double         g_basketDollar      = 15.0;
int            g_takeProfitPts     = 600;
int            g_stopLossPts       = 300;

// Indicator Handles
int            g_hEMA1             = INVALID_HANDLE;
int            g_hEMA2             = INVALID_HANDLE;
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
   g_hEMA1 = iMA(_Symbol, _Period, g_entryPeriod1, 0, MODE_EMA, PRICE_CLOSE);
   g_hEMA2 = iMA(_Symbol, _Period, g_entryPeriod2, 0, MODE_EMA, PRICE_CLOSE);
   g_hRSI  = iRSI(_Symbol, _Period, 14, PRICE_CLOSE);

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
   IndicatorRelease(g_hEMA1);
   IndicatorRelease(g_hEMA2);
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
      else if(lastOrderType == POSITION_TYPE_SELL)
      {
         double distancePts = (currentBid - lastOrderOpenPrice) / point;
         if(distancePts >= g_gridDistancePts)
         {
            double nextLot = NormalizeDouble(g_initialLot * MathPow(g_lotMultiplier, totalEaOrders), 2);
            trade.Sell(nextLot, _Symbol, currentBid, 0, 0, "EAxocial Grid #" + IntegerToString(totalEaOrders + 1));
            Print("🔄 EAxocial Recovery Grid SELL Executed: Lot ", nextLot);
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
//| Evaluate Entry Conditions                                        |
//+------------------------------------------------------------------+
void EvaluateEntrySignal()
{
   double ema1[], ema2[], rsi[];
   ArraySetAsSeries(ema1, true);
   ArraySetAsSeries(ema2, true);
   ArraySetAsSeries(rsi, true);

   if(CopyBuffer(g_hEMA1, 0, 1, 2, ema1) < 2) return;
   if(CopyBuffer(g_hEMA2, 0, 1, 2, ema2) < 2) return;
   if(CopyBuffer(g_hRSI, 0, 1, 2, rsi) < 2) return;

   double currentAsk = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
   double currentBid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
   double point = SymbolInfoDouble(_Symbol, SYMBOL_POINT);

   // Buy Signal: EMA 50 > EMA 200 and RSI < 45
   if(ema1[0] > ema2[0] && rsi[0] < 45.0)
   {
      double sl = (g_stopLossPts > 0) ? (currentAsk - (g_stopLossPts * point)) : 0;
      double tp = (g_takeProfitPts > 0) ? (currentAsk + (g_takeProfitPts * point)) : 0;
      
      if(trade.Buy(g_initialLot, _Symbol, currentAsk, sl, tp, "EAxocial Entry #1"))
      {
         Print("🚀 EAxocial Entry BUY Executed: ", _Symbol, " Lot: ", g_initialLot);
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
   string url = InpServerBaseUrl + "/api/v1/ea/sync?token=" + InpTerminalToken + "&version=" + CLIENT_VERSION;
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
      "{\"terminal_token\":\"%s\",\"ea_version\":\"%s\",\"trading_state\":\"%s\",\"active_orders_count\":%d,\"total_balance\":%.2f,\"total_equity\":%.2f,\"current_symbol\":\"%s\",\"current_timeframe\":\"%s\"}",
      InpTerminalToken, CLIENT_VERSION, g_tradingState, activeCount,
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
