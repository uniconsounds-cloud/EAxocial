'use client';

import Link from 'next/link';
import { 
  Zap, 
  Layers, 
  Activity, 
  Share2, 
  Video, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Terminal,
  Radio,
  CheckCircle2,
  Flame,
  Cpu
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-16 animate-fade-in py-6">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-mono text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Universal EA Engine • MT5 Cloud Sync • AI Strategy Extraction
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          สร้าง รัน และแบ่งปันอีเอ <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
            รวมทุกคอมมูนิตี้ไว้ในที่เดียว
          </span>
        </h1>

        <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          เปลี่ยนการเขียนโค้ด MQL5 ที่ซับซ้อนให้กลายเป็น <strong>ระบบ 4 บล็อกโมดูลที่ปรับแต่งง่าย</strong> หรือถอดกลยุทธ์จากคลิป YouTube / TikTok ด้วย AI แล้วสั่งรันตรงเข้า MT5 ทันที
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/builder"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-sm uppercase tracking-wider hover:opacity-95 shadow-xl shadow-cyan-500/25 transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            เปิดตัวสร้างกลยุทธ์ (Core Builder)
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl glass-panel hover:bg-slate-800 text-white font-semibold text-sm transition-all border-slate-700 hover:border-cyan-500/40"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            แดชบอร์ดสถานะ MT5 (Live Cockpit)
          </Link>
        </div>
      </section>

      {/* Live Minimalist Traffic Light Teaser */}
      <section className="glass-panel-glow p-6 sm:p-8 rounded-3xl border-cyan-500/30 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-cyan-400 block">MINIMALIST DASHBOARD</span>
              <h3 className="font-bold text-white text-base">ระบบไฟสถานะ 3 สี เข้าใจง่าย ไม่รกตัวเลข</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Universal EA Polling: 3s</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50"></div>
            <div>
              <span className="text-xs font-bold text-emerald-400 block">🟢 SYNC: ONLINE</span>
              <span className="text-[11px] text-slate-400">พารามิเตอร์ซิงก์ตรงกับเว็บ</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-md shadow-cyan-400/50"></div>
            <div>
              <span className="text-xs font-bold text-cyan-400 block">🟢 VERSION: MATCH</span>
              <span className="text-[11px] text-slate-400">EA Client v1.0.0 สมบูรณ์</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-blue-400 shadow-md shadow-blue-400/50 animate-pulse"></div>
            <div>
              <span className="text-xs font-bold text-blue-400 block">🔵 TRADING: IN POSITION</span>
              <span className="text-[11px] text-slate-400">กำลังถือสถานะ (ไม้ 2/5)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Pillar 1 */}
        <div className="glass-panel p-6 rounded-2xl border-slate-800 hover:border-cyan-500/30 transition-all space-y-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">4-Step Modular Sockets</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            สร้างกลยุทธ์ผ่าน 4 ชิ้นส่วน: Entry Radar, Recovery Armor, Vault Exit, และ Shield Filter มือใหม่เลือกบล็อกง่ายๆ มือโปรคลิกปรับละเอียดได้ทุกจุด
          </p>
          <Link href="/builder" className="inline-flex items-center gap-1 text-xs text-cyan-400 font-semibold hover:underline">
            ลองสร้างเลย <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Pillar 2 */}
        <div className="glass-panel p-6 rounded-2xl border-slate-800 hover:border-purple-500/30 transition-all space-y-4">
          <div className="w-12 h-12 rounded-xl bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Video className="w-6 h-6 text-pink-400" />
          </div>
          <h3 className="text-lg font-bold text-white">AI Video to Strategy</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            เจอดิสคัสหรือคลิปสอนเทรดบน YouTube หรือ TikTok? เพียงวางลิงก์ AI จะถอดหลักการออกมาประกอบเป็นสูตร EA ให้ในไม่กี่วินาที
          </p>
          <Link href="/builder" className="inline-flex items-center gap-1 text-xs text-purple-300 font-semibold hover:underline">
            ทดลองถอดคลิป <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Pillar 3 */}
        <div className="glass-panel p-6 rounded-2xl border-slate-800 hover:border-emerald-500/30 transition-all space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Share2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Social Deck & 1-Click Clone</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            แชร์ผลเทรดจริงพร้อมตราประทับ Verified ติดตามเซียนเทรด และกดโคลนกลยุทธ์ที่ชอบไปใส่พอร์ต MT5 ของตัวเองได้ใน 1 วินาที
          </p>
          <Link href="/feed" className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold hover:underline">
            ส่องฟีดโซเชียล <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* How to Connect 3 Steps */}
      <section className="glass-panel p-8 rounded-3xl border-slate-800 max-w-4xl mx-auto space-y-6">
        <h2 className="text-xl font-bold text-white text-center">
          วิธีเริ่มต้นใช้งาน EAxocial ใน 3 ขั้นตอน
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="font-mono text-cyan-400 font-bold block text-sm">STEP 1</span>
            <h4 className="font-bold text-white">โหลดไฟล์ Universal EA</h4>
            <p className="text-slate-400">ดาวน์โหลดไฟล์ <code className="text-cyan-300">EAxocial_Client.mq5</code> จากหน้าเว็บ ไปวางในโฟลเดอร์ Experts ของ MT5</p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="font-mono text-cyan-400 font-bold block text-sm">STEP 2</span>
            <h4 className="font-bold text-white">ใส่ Token & เปิด WebRequest</h4>
            <p className="text-slate-400">คัดลอก Terminal Token จากหน้า Dashboard ไปใส่ใน Input ของ EA แล้วกด OK ไฟจะขึ้น 🟢 ทันที</p>
          </div>

          <div className="space-y-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="font-mono text-cyan-400 font-bold block text-sm">STEP 3</span>
            <h4 className="font-bold text-white">ปรับค่าบนเว็บ สั่งรันได้เลย</h4>
            <p className="text-slate-400">เลือกสูตรจากฟีด หรือสร้างบล็อกของตัวเอง พารามิเตอร์จะส่งตรงเข้า MT5 แบบเรียลไทม์โดยไม่ต้องรีสตาร์ท</p>
          </div>
        </div>
      </section>
    </div>
  );
}
