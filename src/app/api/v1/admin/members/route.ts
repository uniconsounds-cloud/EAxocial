import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const ADMIN_EMAIL = 'juntarasate@gmail.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminEmail = searchParams.get('admin_email');

    if (adminEmail !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    if (isSupabaseConfigured()) {
      // Fetch all profiles and their associated terminals and strategies
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          username,
          display_name,
          role,
          terminal_token,
          created_at,
          mt5_terminals(
            id,
            account_number,
            broker_name,
            status,
            trading_state,
            ea_version,
            total_balance,
            total_equity,
            active_orders_count,
            last_heartbeat
          )
        `)
        .order('created_at', { ascending: false });

      if (pError) throw pError;

      const { data: strategies, error: sError } = await supabase
        .from('strategies')
        .select('id, title, author_id, likes_count, is_public, created_at')
        .order('created_at', { ascending: false });

      return NextResponse.json({
        success: true,
        members: profiles || [],
        strategies: strategies || [],
      });
    }

    // Mock demonstration data when Supabase is in local/offline mode
    const mockMembers = [
      {
        id: 'usr_admin_1',
        email: 'juntarasate@gmail.com',
        username: 'juntarasate',
        display_name: 'Suphakorn (Admin)',
        role: 'admin',
        terminal_token: 'EAX_ADMIN_FISG8899',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        mt5_terminals: [
          {
            id: 'term_1',
            account_number: 10859231,
            broker_name: 'InterStellar Financial - Demo',
            status: 'online',
            trading_state: 'idle',
            ea_version: '1.0.0',
            total_balance: 105264.81,
            total_equity: 93008.09,
            active_orders_count: 0,
            last_heartbeat: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'usr_trader_2',
        email: 'somchai.trader@gmail.com',
        username: 'somchai_fx',
        display_name: 'Somchai Trader',
        role: 'trader',
        terminal_token: 'EAX_USER_99214A',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        mt5_terminals: [
          {
            id: 'term_2',
            account_number: 5541092,
            broker_name: 'InterStellar Financial - Real',
            status: 'online',
            trading_state: 'in_position',
            ea_version: '1.0.0',
            total_balance: 5400.00,
            total_equity: 5620.50,
            active_orders_count: 1,
            last_heartbeat: new Date(Date.now() - 5000).toISOString(),
          },
        ],
      },
    ];

    return NextResponse.json({
      success: true,
      members: mockMembers,
      strategies: [
        {
          id: 'strat_1',
          title: 'Gold M5 · EMA400 + Stochastic 2-Step',
          author_id: 'usr_admin_1',
          likes_count: 12,
          is_public: true,
          created_at: new Date().toISOString(),
        },
      ],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
