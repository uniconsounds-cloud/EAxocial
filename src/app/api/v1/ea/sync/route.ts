import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { STARTER_PRESETS } from '@/lib/presets';

const CURRENT_EA_VERSION = process.env.EA_CLIENT_LATEST_VERSION || '1.0.0';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const clientVersion = searchParams.get('version') || '1.0.0';

    if (!token) {
      return NextResponse.json(
        { error: 'Missing terminal_token parameter' },
        { status: 400 }
      );
    }

    // Version Check
    const versionMatch = clientVersion === CURRENT_EA_VERSION;
    const updateAvailable = !versionMatch;

    // Check DB if configured, otherwise fallback to Starter Preset for demo/mock testing
    let strategyRecipe = STARTER_PRESETS[0].recipe;
    let strategyTitle = STARTER_PRESETS[0].title;
    let strategyId = STARTER_PRESETS[0].id;

    if (isSupabaseConfigured()) {
      const { data: terminal, error: termError } = await supabase
        .from('mt5_terminals')
        .select('*, strategies(*)')
        .eq('terminal_token', token)
        .single();

      if (!termError && terminal && terminal.strategies) {
        strategyRecipe = terminal.strategies.recipe;
        strategyTitle = terminal.strategies.title;
        strategyId = terminal.strategies.id;

        // Update terminal status to online & sync timestamp
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

    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      system: {
        server_version: CURRENT_EA_VERSION,
        client_version: clientVersion,
        version_match: versionMatch,
        update_available: updateAvailable,
        update_url: 'https://eaxocial.com/download/EAxocial_Client.mq5',
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
