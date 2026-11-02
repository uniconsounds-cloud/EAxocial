import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { STARTER_PRESETS } from '@/lib/presets';

const CURRENT_EA_VERSION = process.env.EA_CLIENT_LATEST_VERSION || '1.0.0';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const clientVersion = searchParams.get('version') || '1.0.0';
    const accountNumberStr = searchParams.get('account');
    const brokerName = searchParams.get('broker') || 'MT5 Broker';

    if (!token) {
      return NextResponse.json(
        { error: 'Missing terminal_token parameter' },
        { status: 400 }
      );
    }

    const versionMatch = clientVersion === CURRENT_EA_VERSION;
    const updateAvailable = !versionMatch;

    let strategyRecipe = STARTER_PRESETS[0].recipe;
    let strategyTitle = STARTER_PRESETS[0].title;
    let strategyId = STARTER_PRESETS[0].id;
    let isTradingEnabled = true;

    if (isSupabaseConfigured()) {
      // 1. Find user by terminal_token in profiles or terminals
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .eq('terminal_token', token)
        .maybeSingle();

      const accountNumber = accountNumberStr ? parseInt(accountNumberStr, 10) : null;

      // 2. Anti-hijacking & Account binding check
      if (accountNumber && profile) {
        const { data: existingTerminal } = await supabase
          .from('mt5_terminals')
          .select('id, user_id, active_strategy_id, is_trading_enabled, strategies(*)')
          .eq('account_number', accountNumber)
          .maybeSingle();

        if (existingTerminal) {
          // If account exists but owned by someone else -> BLOCK
          if (existingTerminal.user_id !== profile.id) {
            return NextResponse.json(
              { error: 'Security Alert: This MT5 account is already bound to another trader profile!' },
              { status: 403 }
            );
          }

          // Account belongs to this user
          isTradingEnabled = existingTerminal.is_trading_enabled ?? true;
          const strat = Array.isArray(existingTerminal.strategies)
            ? (existingTerminal.strategies[0] as any)
            : (existingTerminal.strategies as any);
          if (strat) {
            strategyRecipe = strat.recipe || strategyRecipe;
            strategyTitle = strat.title || strategyTitle;
            strategyId = strat.id || strategyId;
          }

          // Update status to online
          await supabase
            .from('mt5_terminals')
            .update({
              status: 'online',
              ea_version: clientVersion,
              broker_name: brokerName,
              last_heartbeat: new Date().toISOString(),
            })
            .eq('id', existingTerminal.id);
        } else {
          // First time this account connects with this user's token -> Safely bind!
          await supabase.from('mt5_terminals').insert({
            user_id: profile.id,
            account_number: accountNumber,
            broker_name: brokerName,
            terminal_token: token,
            status: 'online',
            ea_version: clientVersion,
            is_trading_enabled: true,
            last_heartbeat: new Date().toISOString(),
          });
        }
      } else {
        // Fallback token query for existing registered terminal
        const { data: terminal } = await supabase
          .from('mt5_terminals')
          .select('*, strategies(*)')
          .eq('terminal_token', token)
          .maybeSingle();

        if (terminal) {
          isTradingEnabled = terminal.is_trading_enabled ?? true;
          const fallbackStrat = Array.isArray(terminal.strategies)
            ? (terminal.strategies[0] as any)
            : (terminal.strategies as any);
          if (fallbackStrat) {
            strategyRecipe = fallbackStrat.recipe || strategyRecipe;
            strategyTitle = fallbackStrat.title || strategyTitle;
            strategyId = fallbackStrat.id || strategyId;
          }

          await supabase
            .from('mt5_terminals')
            .update({
              status: 'online',
              ea_version: clientVersion,
              last_heartbeat: new Date().toISOString(),
            })
            .eq('id', terminal.id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      system: {
        server_version: CURRENT_EA_VERSION,
        client_version: clientVersion,
        version_match: versionMatch,
        update_available: updateAvailable,
        update_url: 'https://eaxocial.vercel.app/download/EAxocial_Client.mq5',
      },
      control: {
        trading_enabled: isTradingEnabled,
      },
      strategy: {
        id: strategyId,
        title: strategyTitle,
        recipe: strategyRecipe,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
