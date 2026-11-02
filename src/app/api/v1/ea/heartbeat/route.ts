import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      terminal_token,
      account_number,
      broker_name,
      ea_version,
      trading_state,
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
      // Find user profile by token
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('terminal_token', terminal_token)
        .maybeSingle();

      const accNum = account_number ? parseInt(account_number, 10) : null;

      if (accNum && profile) {
        // Anti-hijack check
        const { data: existingTerminal } = await supabase
          .from('mt5_terminals')
          .select('id, user_id, active_strategy_id')
          .eq('account_number', accNum)
          .maybeSingle();

        if (existingTerminal) {
          if (existingTerminal.user_id !== profile.id) {
            return NextResponse.json(
              { error: 'Security Alert: Account bound to another user' },
              { status: 403 }
            );
          }

          // Update telemetry
          await supabase
            .from('mt5_terminals')
            .update({
              status: 'online',
              broker_name: broker_name || 'MT5 Broker',
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
            .eq('id', existingTerminal.id);

          if (event_type && event_message) {
            await supabase.from('telemetry_logs').insert({
              terminal_id: existingTerminal.id,
              strategy_id: existingTerminal.active_strategy_id,
              event_type,
              message: event_message,
              payload: body,
            });
          }
        }
      } else {
        // Fallback: match by terminal_token directly
        const { data: terminal } = await supabase
          .from('mt5_terminals')
          .select('id, active_strategy_id')
          .eq('terminal_token', terminal_token)
          .maybeSingle();

        if (terminal) {
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
