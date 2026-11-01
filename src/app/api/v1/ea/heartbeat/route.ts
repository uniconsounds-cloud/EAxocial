import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      terminal_token,
      ea_version,
      trading_state, // 'idle' | 'in_position' | 'recovering' | 'tp_hit' | 'shield_cut'
      active_orders_count,
      daily_pnl,
      total_balance,
      total_equity,
      current_symbol,
      current_timeframe,
      event_type,
      event_message,
    } = body;

    if (!terminal_token) {
      return NextResponse.json(
        { error: 'Missing terminal_token' },
        { status: 400 }
      );
    }

    if (isSupabaseConfigured()) {
      // Find terminal
      const { data: terminal, error } = await supabase
        .from('mt5_terminals')
        .select('id, active_strategy_id')
        .eq('terminal_token', terminal_token)
        .single();

      if (!error && terminal) {
        // Update heartbeat & live status
        await supabase
          .from('mt5_terminals')
          .update({
            status: 'online',
            ea_version: ea_version || '1.0.0',
            trading_state: trading_state || 'idle',
            active_orders_count: active_orders_count ?? 0,
            daily_pnl: daily_pnl ?? 0.0,
            total_balance: total_balance ?? 0.0,
            total_equity: total_equity ?? 0.0,
            current_symbol: current_symbol || 'XAUUSD',
            current_timeframe: current_timeframe || 'M15',
            last_heartbeat: new Date().toISOString(),
          })
          .eq('id', terminal.id);

        // If an explicit event was attached, log to telemetry
        if (event_type && event_message) {
          await supabase.from('telemetry_logs').insert({
            terminal_id: terminal.id,
            strategy_id: terminal.active_strategy_id,
            event_type,
            message: event_message,
            payload: body,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      received_at: new Date().toISOString(),
      status: 'acknowledged',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
