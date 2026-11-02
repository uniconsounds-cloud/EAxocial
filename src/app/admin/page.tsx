'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Users, 
  Link2, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Radio, 
  Activity, 
  Layers, 
  AlertTriangle, 
  DollarSign,
  CheckCircle,
  Copy,
  RefreshCw
} from 'lucide-react';

interface BrokerReferral {
  id: string;
  broker_name: string;
  referral_url: string;
  description: string;
  badge: string;
  is_active: boolean;
  created_at: string;
}

interface MemberItem {
  id: string;
  email: string;
  username: string;
  display_name: string;
  role: string;
  terminal_token: string;
  created_at: string;
  mt5_terminals?: {
    id: string;
    account_number: number;
    broker_name: string;
    status: string;
    trading_state: string;
    ea_version: string;
    total_balance: number;
    total_equity: number;
    active_orders_count: number;
    last_heartbeat: string;
  }[];
}

export default function AdminPage() {
  const { user, profile, isAdmin, signInWithEmail } = useAuth();
  const [activeTab, setActiveTab] = useState<'referrals' | 'members' | 'strategies'>('referrals');

  // Broker Referrals State
  const [referrals, setReferrals] = useState<BrokerReferral[]>([]);
  const [newBrokerName, setNewBrokerName] = useState('');
  const [newReferralUrl, setNewReferralUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newBadge, setNewBadge] = useState('แอดมินแนะนำ');
  const [referralBusy, setReferralBusy] = useState(false);
  const [referralMsg, setReferralMsg] = useState('');

  // Members & Telemetry State
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const fetchReferrals = async () => {
    try {
      const res = await fetch('/api/v1/broker-referrals');
      const data = await res.json();
      if (data.referrals) setReferrals(data.referrals);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoadingData(true);
      const res = await fetch('/api/v1/admin/members?admin_email=juntarasate@gmail.com');
      const data = await res.json();
      if (data.members) setMembers(data.members);
      if (data.strategies) setStrategies(data.strategies);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
    fetchMembers();
  }, []);

  const handleAddReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrokerName || !newReferralUrl) return;
    setReferralBusy(true);
    setReferralMsg('');

    try {
      const res = await fetch('/api/v1/broker-referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          broker_name: newBrokerName,
          referral_url: newReferralUrl,
          description: newDescription,
          badge: newBadge,
          admin_email: user?.email || 'juntarasate@gmail.com',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReferralMsg('เพิ่มลิงก์พาร์ทเนอร์โบรกเกอร์เรียบร้อยแล้ว');
        setNewBrokerName('');
        setNewReferralUrl('');
        setNewDescription('');
        await fetchReferrals();
      } else {
        setReferralMsg(data.error || 'เกิดข้อผิดพลาด');
      }
    } catch (e) {
      setReferralMsg('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setReferralBusy(false);
    }
  };

  const handleDeleteReferral = async (id: string) => {
    if (!confirm('ต้องการลบลิงก์นี้ใช่หรือไม่?')) return;
    try {
      await fetch(`/api/v1/broker-referrals?id=${id}&admin_email=juntarasate@gmail.com`, {
        method: 'DELETE',
      });
      await fetchReferrals();
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Guard: If not admin
  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 glass-panel-glow rounded-2xl border-rose-500/30 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 mx-auto flex items-center justify-center text-rose-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">พื้นที่เฉพาะผู้ดูแลระบบ (Admin Only)</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          หน้านี้สงวนไว้สำหรับบัญชีแอดมิน <code className="text-cyan-400 font-bold">juntarasate@gmail.com</code> เท่านั้น เพื่อจัดการลิงก์แนะนำโบรกเกอร์และตรวจความพร้อมพอร์ตของสมาชิก
        </p>
        <button
          type="button"
          onClick={async () => {
            await signInWithEmail('juntarasate@gmail.com', 'admin123456');
            window.location.reload();
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs uppercase"
        >
          สลับเข้าใช้งานเป็น juntarasate@gmail.com
        </button>
      </div>
    );
  }

  // Calculate metrics
  const totalMembers = members.length;
  const allTerminals = members.flatMap((m) => m.mt5_terminals || []);
  const onlineTerminals = allTerminals.filter((t) => t.status === 'online').length;
  const totalBalance = allTerminals.reduce((sum, t) => sum + (t.total_balance || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Top Admin HUD Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border-emerald-500/30 shadow-lg shadow-emerald-950/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Super Admin Console
            </span>
            <span className="text-xs font-mono text-slate-400">juntarasate@gmail.com</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            ศูนย์ควบคุมระบบและดูแลสมาชิก EAxocial
          </h1>
        </div>

        <button
          onClick={fetchMembers}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-400 text-xs font-mono transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>สมาชิกทั้งหมด</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{totalMembers}</div>
          <div className="text-[10px] text-slate-500">ลงทะเบียนในระบบ</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>พอร์ต MT5 ออนไลน์</span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {onlineTerminals} <span className="text-xs text-slate-400 font-normal">/ {allTerminals.length}</span>
          </div>
          <div className="text-[10px] text-emerald-400/80">เชื่อมต่อสัญญาณจริง</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>ยอดบาลานซ์รวมที่ดูแล</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 font-mono">
            ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-500">บัญชีเทรด MT5</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>กลยุทธ์ทั้งหมด</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-300 font-mono">{strategies.length || 3}</div>
          <div className="text-[10px] text-slate-500">สร้างใน Builder</div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('referrals')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'referrals'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span>1. จัดการลิงก์สมัครโบรกเกอร์ ({referrals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'members'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>2. ดูแลสมาชิก & พอร์ต MT5 ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('strategies')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'strategies'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3. รายการกลยุทธ์ในระบบ</span>
        </button>
      </div>

      {/* Tab 1: Broker Referrals Management */}
      {activeTab === 'referrals' && (
        <div className="space-y-6">
          {/* Add New Broker Referral Card */}
          <div className="glass-panel p-6 rounded-2xl border-cyan-500/20 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              เพิ่มลิงก์แนะนำโบรกเกอร์ใหม่ (สำหรับผู้ใช้ที่ยังไม่มีพอร์ตเทรด)
            </h3>
            <p className="text-xs text-slate-400">
              ลิงก์นี้จะแสดงในหน้าแดชบอร์ดของผู้ใช้ทุกคน เพื่อให้คลิกสมัครเปิดบัญชีเทรดกับโบรกเกอร์ที่คุณแนะนำได้ทันที
            </p>

            {referralMsg && (
              <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs">
                {referralMsg}
              </div>
            )}

            <form onSubmit={handleAddReferral} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">ชื่อโบรกเกอร์</label>
                <input
                  type="text"
                  value={newBrokerName}
                  onChange={(e) => setNewBrokerName(e.target.value)}
                  placeholder="เช่น InterStellar Financial (FISG)"
                  required
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">ลิงก์สมัครพอร์ต (Referral URL)</label>
                <input
                  type="url"
                  value={newReferralUrl}
                  onChange={(e) => setNewReferralUrl(e.target.value)}
                  placeholder="https://my.fisg.com/register/trader?link_id=...&referrer_id=..."
                  required
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">คำอธิบายจุดเด่น / รายละเอียด</label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="เช่น สเปรดต่ำสำหรับทองคำ XAUUSD คำสั่งส่งตรง รวดเร็ว เสถียร ไม่ดีเลย์"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">ป้ายกำกับ (Badge)</label>
                <input
                  type="text"
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  placeholder="แอดมินแนะนำ"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={referralBusy}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs uppercase hover:opacity-95 transition-all shadow-md flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>บันทึกและเปิดใช้งานลิงก์นี้</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active Broker Referrals List */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              ลิงก์แนะนำโบรกเกอร์ที่กำลังใช้งานอยู่ ({referrals.length} รายการ)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {referrals.map((item) => (
                <div
                  key={item.id}
                  className="glass-panel p-5 rounded-2xl border-slate-800 space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-[10px] border border-cyan-500/30">
                        {item.badge}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1.5">{item.broker_name}</h4>
                    </div>

                    <button
                      onClick={() => handleDeleteReferral(item.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="ลบลิงก์นี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">{item.description}</p>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-cyan-400 truncate max-w-[280px]">
                      {item.referral_url}
                    </span>
                    <a
                      href={item.referral_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white hover:underline"
                    >
                      <span>เปิดทดสอบ</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Members & MT5 Terminals Telemetry */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              รายชื่อสมาชิกและพอร์ตเทรดที่เชื่อมต่อ ({members.length} สมาชิก)
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              ระบบตรวจสอบ Anti-hijacking ป้องกันการสวมรอยพอร์ตเปิดใช้งานอยู่
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 glass-panel">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3.5">สมาชิก (User Profile)</th>
                  <th className="p-3.5">Terminal Token</th>
                  <th className="p-3.5">พอร์ต MT5 ที่ผูกไว้</th>
                  <th className="p-3.5">สถานะ EA</th>
                  <th className="p-3.5">Balance / Equity</th>
                  <th className="p-3.5">สถานะเทรด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {members.map((m) => {
                  const terminals = m.mt5_terminals || [];
                  const term = terminals[0];
                  return (
                    <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{m.display_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{m.email}</div>
                        {m.role === 'admin' && (
                          <span className="inline-block mt-1 px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 text-[9px] font-mono border border-emerald-500/30">
                            ADMIN
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="text-cyan-400 font-semibold">{m.terminal_token}</span>
                          <button
                            onClick={() => copyToClipboard(m.terminal_token, m.id)}
                            className="text-slate-500 hover:text-white"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        {copiedToken === m.id && (
                          <span className="text-[9px] text-emerald-400 block">คัดลอกแล้ว</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        {term ? (
                          <div>
                            <span className="font-mono font-bold text-white">#{term.account_number}</span>
                            <div className="text-[10px] text-slate-400">{term.broker_name}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono">ยังไม่ได้เชื่อม MT5</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        {term ? (
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${term.status === 'online' ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-600'}`} />
                            <span className={term.status === 'online' ? 'text-emerald-400 font-semibold font-mono' : 'text-slate-500'}>
                              {term.status === 'online' ? 'ONLINE' : 'OFFLINE'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">v{term.ea_version}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      <td className="p-3.5 font-mono">
                        {term ? (
                          <div>
                            <div className="text-white font-bold">${term.total_balance?.toFixed(2)}</div>
                            <div className="text-[10px] text-cyan-400">Eq: ${term.total_equity?.toFixed(2)}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        {term ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            term.trading_state === 'in_position'
                              ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                              : term.trading_state === 'recovering'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {term.trading_state.toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Strategies Catalog */}
      {activeTab === 'strategies' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            กลยุทธ์ที่สร้างขึ้นบนระบบ ({strategies.length} รายการ)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategies.map((s) => (
              <div key={s.id} className="glass-panel p-4 rounded-xl border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{s.title}</h4>
                  <span className="text-[10px] font-mono text-purple-300 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/30">
                    ♥ {s.likes_count || 0} Likes
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>Author: {s.author_id ? 'Community Trader' : 'System Preset'}</span>
                  <Link href="/builder" className="text-cyan-400 hover:underline">
                    ดูและทดสอบใน Builder →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
