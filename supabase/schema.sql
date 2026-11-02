-- ====================================================================
-- EAxocial - Supabase Database Schema & Realtime Setup
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    role TEXT DEFAULT 'trader' CHECK (role IN ('trader', 'creator', 'pro', 'admin')),
    terminal_token TEXT UNIQUE NOT NULL DEFAULT ('EAX_' || substr(md5(random()::text), 1, 16)),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin initialization trigger or hook for juntarasate@gmail.com
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, username, display_name, avatar_url, role, terminal_token)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url',
        CASE WHEN new.email = 'juntarasate@gmail.com' THEN 'admin' ELSE 'trader' END,
        'EAX_' || substr(md5(new.id::text || clock_timestamp()::text), 1, 16)
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = CASE WHEN EXCLUDED.email = 'juntarasate@gmail.com' THEN 'admin' ELSE profiles.role END;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Broker Referral Links (Managed by Admin)
CREATE TABLE IF NOT EXISTS public.broker_referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    broker_name TEXT NOT NULL,
    referral_url TEXT NOT NULL,
    description TEXT,
    badge TEXT DEFAULT 'แอดมินแนะนำ',
    is_active BOOLEAN DEFAULT true,
    created_by TEXT DEFAULT 'juntarasate@gmail.com',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Admin Broker Referral Link
INSERT INTO public.broker_referrals (broker_name, referral_url, description, badge, is_active)
VALUES (
    'InterStellar Financial (FISG)',
    'https://my.fisg.com/register/trader?link_id=qb9f9uqj&referrer_id=0DtW2XvtM',
    'โบรกเกอร์พาร์ทเนอร์แนะนำ สเปรดต่ำสำหรับทองคำ XAUUSD คำสั่ง EA เข้าเร็ว แม่นยำ ไม่ดีเลย์',
    'โบรกเกอร์แนะนำโดยแอดมิน',
    true
)
ON CONFLICT DO NOTHING;

-- 4. Strategies (Core Recipes)
CREATE TABLE IF NOT EXISTS public.strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    source_video_url TEXT,
    source_platform TEXT DEFAULT 'manual' CHECK (source_platform IN ('manual', 'youtube', 'tiktok', 'fork')),
    forked_from_id UUID REFERENCES public.strategies(id) ON DELETE SET NULL,
    
    -- Recipe JSON Structure (Entry, Recovery, Exit, Protection)
    recipe JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Visual & Gamification Meta
    badge_type TEXT DEFAULT 'cyber_core', -- cyber_core, titanium_shield, storm_strike, quantum_grid
    aggression_level INT DEFAULT 2 CHECK (aggression_level BETWEEN 1 AND 5),
    defense_level INT DEFAULT 4 CHECK (defense_level BETWEEN 1 AND 5),
    
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_public BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    version TEXT DEFAULT '1.0.0',
    min_ea_version TEXT DEFAULT '1.0.0',
    
    likes_count INT DEFAULT 0,
    forks_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Strategy Likes (Community engagement)
CREATE TABLE IF NOT EXISTS public.strategy_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    strategy_id UUID REFERENCES public.strategies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, strategy_id)
);

-- 6. MT5 Terminals (Connected Client EAs with Anti-Hijacking)
CREATE TABLE IF NOT EXISTS public.mt5_terminals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    account_number BIGINT NOT NULL UNIQUE, -- Prevents other users from hijacking someone else's account!
    broker_name TEXT NOT NULL,
    terminal_token TEXT NOT NULL,          -- Secret token from user's dashboard entered in EA
    active_strategy_id UUID REFERENCES public.strategies(id) ON DELETE SET NULL,
    
    -- Live Telemetry & Status Lights
    ea_version TEXT DEFAULT '1.0.0',
    status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'syncing', 'error')),
    trading_state TEXT DEFAULT 'idle' CHECK (trading_state IN ('idle', 'in_position', 'recovering', 'tp_hit', 'paused', 'shield_cut')),
    is_trading_enabled BOOLEAN DEFAULT true, -- Allows pausing/enabling trading directly from web
    current_symbol TEXT DEFAULT 'XAUUSD',
    current_timeframe TEXT DEFAULT 'M15',
    active_orders_count INT DEFAULT 0,
    daily_pnl NUMERIC DEFAULT 0.0,
    total_balance NUMERIC DEFAULT 0.0,
    total_equity NUMERIC DEFAULT 0.0,
    
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Telemetry & Trade Logs
CREATE TABLE IF NOT EXISTS public.telemetry_logs (
    id BIGSERIAL PRIMARY KEY,
    terminal_id UUID REFERENCES public.mt5_terminals(id) ON DELETE CASCADE,
    strategy_id UUID REFERENCES public.strategies(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- heartbeat, signal_entry, recovery_order, tp_close, sl_close, shield_alert
    message TEXT NOT NULL,
    payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Social Posts & Community Reviews
CREATE TABLE IF NOT EXISTS public.social_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    strategy_id UUID REFERENCES public.strategies(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    media_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    likes_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mt5_terminals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can view profiles, users can update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Broker referrals: Public can view active links, Admin can manage
CREATE POLICY "Anyone can view active broker links" ON public.broker_referrals FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage broker referrals" ON public.broker_referrals FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR email = 'juntarasate@gmail.com'))
);

-- Public Strategies are readable by all
CREATE POLICY "Public strategies are viewable by everyone" ON public.strategies FOR SELECT USING (is_public = true OR auth.uid() = author_id);
CREATE POLICY "Users can create and edit their own strategies" ON public.strategies FOR ALL USING (auth.uid() = author_id);

-- Strategy likes
CREATE POLICY "Anyone can view strategy likes" ON public.strategy_likes FOR SELECT USING (true);
CREATE POLICY "Users can like strategies" ON public.strategy_likes FOR ALL USING (auth.uid() = user_id);

-- Terminals only accessible by terminal owner or admin
CREATE POLICY "Users can view and manage their own terminals" ON public.mt5_terminals FOR ALL USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role = 'admin' OR email = 'juntarasate@gmail.com'))
);

-- Realtime Publication Setup
ALTER PUBLICATION supabase_realtime ADD TABLE public.mt5_terminals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.telemetry_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.broker_referrals;
