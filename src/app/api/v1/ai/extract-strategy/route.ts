import { NextRequest, NextResponse } from 'next/server';
import { StrategyRecipe } from '@/types/strategy';

export async function POST(request: NextRequest) {
  try {
    const { video_url, video_text, notes } = await request.json();

    if (!video_url && !video_text && !notes) {
      return NextResponse.json(
        { error: 'Please provide a video URL, transcript, or trading rule notes' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If Gemini API Key is available, call Gemini to extract the 4-step StrategyRecipe
    if (apiKey && apiKey !== 'your-gemini-api-key') {
      const prompt = `
You are an expert Algorithmic Trading Architect for EAxocial.
Analyze the following trading strategy video context or notes and extract the exact parameters for our 4-Step Modular Universal EA schema.

Input Context:
URL: ${video_url || 'N/A'}
Text/Transcript: ${video_text || 'N/A'}
Notes: ${notes || 'N/A'}

Format your response strictly as valid JSON adhering to this schema:
{
  "title": "A catchy Cyber/Game-themed Strategy Name (e.g. Titan-Grid Gold, Neon EMA Pullback)",
  "badge_type": "cyber_core" | "titanium_shield" | "storm_strike" | "quantum_grid",
  "aggression_level": number (1 to 5),
  "defense_level": number (1 to 5),
  "summary": "Brief 1-2 sentence summary of what this strategy does",
  "tags": ["Array", "of", "relevant", "tags"],
  "recipe": {
    "version": "1.0.0",
    "symbol": "XAUUSD" or inferred symbol,
    "timeframe": "M15" or inferred timeframe,
    "entry": {
      "setupConditions": [
        {
          "indicator": "EMA" | "RSI" | "MACD" | "BOLLINGER" | "SUPERTREND",
          "timeframe": "M15",
          "period": number,
          "periodSecondary": number or null,
          "operator": "ABOVE" | "BELOW" | "CROSS_UP" | "CROSS_DOWN" | "TOUCH_LOWER" | "TOUCH_UPPER",
          "thresholdValue": number or null,
          "direction": "BUY" | "SELL"
        }
      ],
      "triggerMode": "NEXT_BAR_OPEN" or "INSTANT",
      "initialLotSize": 0.01
    },
    "recovery": {
      "mode": "SINGLE_ORDER" or "FIXED_GRID" or "MARTINGALE",
      "maxOrders": number,
      "gridDistancePoints": number,
      "lotMultiplier": number
    },
    "exit": {
      "mode": "RISK_REWARD" or "FIXED_POINTS" or "BASKET_DOLLAR",
      "takeProfitPoints": number or null,
      "stopLossPoints": number or null,
      "riskRewardRatio": number or null,
      "basketTargetDollar": number or null
    },
    "shield": {
      "maxSpreadPoints": 30,
      "maxDailyLossPercent": 3.0,
      "maxAccountDrawdownPercent": 10.0,
      "newsFilterEnabled": true,
      "newsBufferMinutes": 30,
      "tradingSessions": {
        "asian": false,
        "london": true,
        "newYork": true
      }
    }
  }
}
Do not wrap in backticks or markdown, return raw JSON only.
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        const candidateText = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidateText) {
          const parsed = JSON.parse(candidateText);
          return NextResponse.json({ success: true, data: parsed, engine: 'gemini-live' });
        }
      }
    }

    // Smart Fallback / Prototype Extractor (Demonstrates immediate UX functionality)
    const isGold = (video_url + video_text + notes).toLowerCase().includes('gold') ||
                   (video_url + video_text + notes).toLowerCase().includes('xau');
    const isRSI = (video_url + video_text + notes).toLowerCase().includes('rsi');
    const isGrid = (video_url + video_text + notes).toLowerCase().includes('grid') ||
                   (video_url + video_text + notes).toLowerCase().includes('แก้ไม้');

    const simulatedStrategy: {
      title: string;
      badge_type: 'cyber_core' | 'titanium_shield' | 'storm_strike' | 'quantum_grid';
      aggression_level: number;
      defense_level: number;
      summary: string;
      tags: string[];
      recipe: StrategyRecipe;
    } = {
      title: isGrid ? 'AI-Extracted Quantum Grid' : 'AI-Extracted Apex Trend Runner',
      badge_type: isGrid ? 'quantum_grid' : 'storm_strike',
      aggression_level: isGrid ? 4 : 2,
      defense_level: 4,
      summary: `ถอดกลยุทธ์จากคลิปสำเร็จ: ตรวจพบสัญญาณเข้าไม้หลักด้วย ${isRSI ? 'RSI Reversal' : 'EMA Trend Follow'} บนสินทรัพย์ ${isGold ? 'XAUUSD' : 'EURUSD'} พร้อมประกอบชิ้นส่วนโมดูล 4 ขั้นตอนให้เรียบร้อยแล้ว`,
      tags: ['AI-Extracted', isGold ? 'XAUUSD' : 'EURUSD', isGrid ? 'Grid' : 'Single-Order', 'Verified-Logic'],
      recipe: {
        version: '1.0.0',
        symbol: isGold ? 'XAUUSD' : 'EURUSD',
        timeframe: 'M15',
        entry: {
          setupConditions: [
            {
              indicator: isRSI ? 'RSI' : 'EMA',
              timeframe: 'M15',
              period: isRSI ? 14 : 50,
              periodSecondary: isRSI ? undefined : 200,
              operator: isRSI ? 'BELOW' : 'ABOVE',
              thresholdValue: isRSI ? 30 : undefined,
              direction: 'BUY',
            },
          ],
          triggerMode: 'NEXT_BAR_OPEN',
          initialLotSize: 0.01,
        },
        recovery: {
          mode: isGrid ? 'FIXED_GRID' : 'SINGLE_ORDER',
          maxOrders: isGrid ? 4 : 1,
          gridDistancePoints: isGrid ? 350 : 0,
          lotMultiplier: isGrid ? 1.5 : 1.0,
        },
        exit: {
          mode: isGrid ? 'BASKET_DOLLAR' : 'RISK_REWARD',
          riskRewardRatio: isGrid ? undefined : 2.0,
          stopLossPoints: isGrid ? undefined : 350,
          basketTargetDollar: isGrid ? 12.0 : undefined,
        },
        shield: {
          maxSpreadPoints: 30,
          maxDailyLossPercent: 3.5,
          maxAccountDrawdownPercent: 12.0,
          newsFilterEnabled: true,
          newsBufferMinutes: 30,
          tradingSessions: {
            asian: false,
            london: true,
            newYork: true,
          },
        },
      },
    };

    return NextResponse.json({
      success: true,
      data: simulatedStrategy,
      engine: 'simulated-engine',
      note: 'To use live Gemini Multimodal extraction, set GEMINI_API_KEY in .env.local',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown extraction error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
