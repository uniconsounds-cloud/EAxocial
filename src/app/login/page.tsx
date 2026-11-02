'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Zap, ShieldCheck, Mail, Lock, User, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // If already logged in, redirect to dashboard
  if (user) {
    router.push('/dashboard');
    return null;
  }

  const handleGoogleLogin = async () => {
    try {
      setBusy(true);
      setError('');
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google login error');
    } finally {
      setBusy(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }
    setBusy(true);
    setError('');

    if (tab === 'signin') {
      const res = await signInWithEmail(email, password);
      if (res.error) {
        setError(res.error);
      } else {
        router.push('/dashboard');
      }
    } else {
      const res = await signUpWithEmail(email, password, displayName);
      if (res.error) {
        setError(res.error);
      } else {
        router.push('/dashboard');
      }
    }
    setBusy(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-[1px] shadow-lg shadow-cyan-500/25 mb-2">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <Zap className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            เข้าสู่ระบบ <span className="text-cyan-400">EAxocial</span>
          </h1>
          <p className="text-xs text-slate-400">
            ระบบชุมชนสร้างและแชร์กลยุทธ์ MT5 เชื่อมต่อพอร์ตเทรดจริงอัตโนมัติ
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-panel-glow p-8 rounded-2xl border-cyan-500/20 backdrop-blur-xl space-y-6 shadow-2xl">
          {/* Google Sign In Button */}
          <button
            type="button"
            disabled={busy}
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-slate-900 font-bold text-sm hover:bg-slate-100 transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>เข้าสู่ระบบด้วย Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-widest absolute">
              หรือใช้อีเมล
            </span>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950/70 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              className={`py-2 rounded-lg transition-all ${
                tab === 'signin'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => {
                setTab('signin');
                setError('');
              }}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              className={`py-2 rounded-lg transition-all ${
                tab === 'signup'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              onClick={() => {
                setTab('signup');
                setError('');
              }}
            >
              สมัครสมาชิก
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ชื่อที่แสดง (Display Name)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Trader John"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                อีเมล (Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-name@gmail.com"
                  required
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-lg shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <span>{tab === 'signin' ? 'เข้าสู่ระบบ' : 'สร้างบัญชีผู้ใช้'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={async () => {
                setEmail('juntarasate@gmail.com');
                setPassword('admin123456');
                await signInWithEmail('juntarasate@gmail.com', 'admin123456');
                router.push('/dashboard');
              }}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-cyan-400 hover:bg-slate-800/80 transition-all flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>ทดสอบเข้าใช้งานในฐานะ แอดมิน (juntarasate@gmail.com)</span>
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1.5 text-emerald-400/90 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            ระบบป้องกันการสวมรอยเลขพอร์ตเทรด MT5 ด้วย Token ประจำตัว
          </p>
          <p>
            ยังไม่มีพอร์ตเทรด?{' '}
            <a
              href="https://my.fisg.com/register/trader?link_id=qb9f9uqj&referrer_id=0DtW2XvtM"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline"
            >
              เปิดบัญชีกับโบรกเกอร์แนะนำคลิกที่นี่ ↗
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
