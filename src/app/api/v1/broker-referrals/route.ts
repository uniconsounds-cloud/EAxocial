import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const DEFAULT_BROKER_LINKS = [
  {
    id: 'default-fisg-referral',
    broker_name: 'InterStellar Financial (FISG)',
    referral_url: 'https://my.fisg.com/register/trader?link_id=qb9f9uqj&referrer_id=0DtW2XvtM',
    description: 'โบรกเกอร์พาร์ทเนอร์แนะนำโดยแอดมิน สเปรดต่ำสำหรับทองคำ XAUUSD คำสั่งส่งตรง รวดเร็ว เสถียร ไม่ดีเลย์',
    badge: 'แอดมินแนะนำ',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export async function GET() {
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('broker_referrals')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return NextResponse.json({ success: true, referrals: data });
      }
    }

    return NextResponse.json({ success: true, referrals: DEFAULT_BROKER_LINKS });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message, referrals: DEFAULT_BROKER_LINKS }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { broker_name, referral_url, description, badge, admin_email } = body;

    // Check if requester is admin
    if (admin_email !== 'juntarasate@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    if (!broker_name || !referral_url) {
      return NextResponse.json({ error: 'Missing broker_name or referral_url' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('broker_referrals')
        .insert({
          broker_name,
          referral_url,
          description: description || '',
          badge: badge || 'พาร์ทเนอร์แนะนำ',
          is_active: true,
          created_by: admin_email,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, referral: data });
    }

    const newLink = {
      id: 'custom-' + Date.now(),
      broker_name,
      referral_url,
      description: description || '',
      badge: badge || 'พาร์ทเนอร์แนะนำ',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, referral: newLink });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const adminEmail = searchParams.get('admin_email');

    if (adminEmail !== 'juntarasate@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }

    if (isSupabaseConfigured()) {
      await supabase.from('broker_referrals').delete().eq('id', id);
    }

    return NextResponse.json({ success: true, deleted_id: id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
