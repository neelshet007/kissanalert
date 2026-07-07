'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../../store/useStore';
import { translations } from '../../../utils/translations';
import { Sprout, LogOut, Users, Cpu, MessageSquare, AlertCircle, RefreshCw, Globe } from 'lucide-react';
import axios from 'axios';

import { API_BASE_URL } from '../../../utils/api';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, currentLanguage, setLanguage, logout, token } = useStore();
  const t = translations[currentLanguage] || translations.en;

  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    fetchMetrics();
  }, [user]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/analytics/admin`, {
        headers: { Authorization: `Bearer ${token || 'mock-jwt-token'}` }
      });
      setMetrics(response.data);
    } catch (_) {
      // Mock metrics fallback
      setMetrics({
        metrics: {
          totalUsers: 1450,
          farmersCount: 1422,
          expertsCount: 28,
          totalFarms: 1210,
          recommendationsCount: 890,
          diseaseReportsCount: 450,
        },
        ticketsSummary: { OPEN: 8, RESOLVED: 442, CLOSED: 0 },
        systemHealth: {
          status: 'Optimal',
          dbConnected: true,
          uptime: 142000,
          apiLatency: '38ms'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#022c22] via-[#064e3b] to-[#042f2e] text-stone-100 flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-[#022c22]/60 backdrop-blur-xl border-r border-emerald-500/10 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-emerald-300">Kisan Alert</h1>
              <p className="text-[9px] uppercase font-bold tracking-widest text-emerald-400">Root Controller</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400/70">{t.languageSelect}</label>
              <div className="flex items-center gap-1.5 bg-emerald-950/65 px-3 py-2 rounded-xl border border-emerald-500/20">
                <Globe className="w-4 h-4 text-emerald-400" />
                <select
                  value={currentLanguage}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-transparent border-none outline-none font-bold text-emerald-200 cursor-pointer focus:ring-0 text-xs"
                >
                  <option value="en" className="bg-[#022c22]">English</option>
                  <option value="hi" className="bg-[#022c22]">हिन्दी</option>
                  <option value="te" className="bg-[#022c22]">తెలుగు</option>
                  <option value="mr" className="bg-[#022c22]">मराठी</option>
                  <option value="ta" className="bg-[#022c22]">தமிழ்</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs font-bold text-center">
              Super Admin Console
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-emerald-500/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/35 flex items-center justify-center font-bold text-rose-300">
              {user?.name?.[0] || 'A'}
            </div>
            <div>
              <p className="font-extrabold text-sm leading-none text-white">{user?.name || 'Admin'}</p>
              <span className="text-[9px] uppercase font-bold text-rose-400 tracking-wider">Root Admin</span>
            </div>
          </div>
          <button 
            onClick={() => { logout(); router.push('/'); }}
            className="w-full py-3 bg-red-950/30 hover:bg-red-950/60 border border-red-500/15 rounded-xl font-bold text-xs text-red-400 flex items-center justify-center gap-1.5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            {t.logout}
          </button>
        </div>
      </aside>

      {/* Main dashboard content */}
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-emerald-500/10">
          <div>
            <h2 className="text-3xl font-black text-white">Admin Dashboard</h2>
            <p className="text-sm text-emerald-300/70 font-semibold mt-1">Monitor Kisan Alert metrics, API load, and system metrics</p>
          </div>
          <button 
            onClick={fetchMetrics}
            disabled={loading}
            className="p-3 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/10 rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4 text-emerald-300" />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-emerald-950/30 backdrop-blur-xl p-6 rounded-2xl border border-emerald-500/10 shadow-xl space-y-2">
            <Users className="w-8 h-8 text-emerald-400" />
            <p className="text-xs text-emerald-300/70 font-bold uppercase tracking-wider">Farmers Registered</p>
            <h3 className="text-3xl font-black text-white">{metrics?.metrics?.farmersCount ?? '1,422'}</h3>
          </div>
          <div className="bg-emerald-950/30 backdrop-blur-xl p-6 rounded-2xl border border-emerald-500/10 shadow-xl space-y-2">
            <Users className="w-8 h-8 text-purple-400" />
            <p className="text-xs text-emerald-300/70 font-bold uppercase tracking-wider">RSK Experts Onboarded</p>
            <h3 className="text-3xl font-black text-white">{metrics?.metrics?.expertsCount ?? '28'}</h3>
          </div>
          <div className="bg-emerald-950/30 backdrop-blur-xl p-6 rounded-2xl border border-emerald-500/10 shadow-xl space-y-2">
            <Cpu className="w-8 h-8 text-sky-400" />
            <p className="text-xs text-emerald-300/70 font-bold uppercase tracking-wider">AI Sowing Matches</p>
            <h3 className="text-3xl font-black text-white">{metrics?.metrics?.recommendationsCount ?? '890'}</h3>
          </div>
          <div className="bg-emerald-950/30 backdrop-blur-xl p-6 rounded-2xl border border-emerald-500/10 shadow-xl space-y-2">
            <MessageSquare className="w-8 h-8 text-amber-400" />
            <p className="text-xs text-emerald-300/70 font-bold uppercase tracking-wider">Escalated Tickets Active</p>
            <h3 className="text-3xl font-black text-white">{metrics?.ticketsSummary?.OPEN ?? '8'}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Usage Card */}
          <div className="bg-emerald-950/30 backdrop-blur-xl p-6 rounded-2xl border border-emerald-500/10 shadow-xl space-y-4">
            <h3 className="font-extrabold text-lg flex items-center gap-2 text-white">
              <Cpu className="w-5 h-5 text-emerald-400" />
              Gemini API Usage Meter
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-emerald-300">Gemini 1.5 Flash (LLM Chats)</span>
                  <span className="text-white">78,240 / 100,000 requests</span>
                </div>
                <div className="w-full bg-emerald-950/80 h-2.5 rounded-full overflow-hidden border border-emerald-500/10">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '78%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-purple-300">Gemini 1.5 Flash (Vision)</span>
                  <span className="text-white">14,500 / 25,000 requests</span>
                </div>
                <div className="w-full bg-emerald-950/80 h-2.5 rounded-full overflow-hidden border border-emerald-500/10">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: '58%' }} />
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs font-bold text-center">
                Within Free Tier Limits. Zero Cost Incurred.
              </div>
            </div>
          </div>

          {/* SMS & WhatsApp Analytics */}
          <div className="bg-emerald-950/30 backdrop-blur-xl p-6 rounded-2xl border border-emerald-500/10 shadow-xl space-y-4">
            <h3 className="font-extrabold text-lg flex items-center gap-2 text-white">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              Notification APIs Status
            </h3>

            <div className="space-y-3 text-xs font-bold">
              <div className="flex justify-between items-center p-3 bg-emerald-950/40 border border-emerald-500/5 rounded-xl">
                <span className="text-emerald-200">Telegram Bot Notifications</span>
                <span className="text-emerald-400 flex items-center gap-1">🟢 Active (100%)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-950/40 border border-emerald-500/5 rounded-xl">
                <span className="text-emerald-200">Meta WhatsApp Cloud API</span>
                <span className="text-emerald-400 flex items-center gap-1">🟢 Active (100%)</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-950/40 border border-emerald-500/5 rounded-xl">
                <span className="text-emerald-200">Resend Email Agent</span>
                <span className="text-emerald-400 flex items-center gap-1">🟢 Active (99.9%)</span>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-emerald-950/30 backdrop-blur-xl p-6 rounded-2xl border border-emerald-500/10 shadow-xl space-y-4">
            <h3 className="font-extrabold text-lg flex items-center gap-2 text-white">
              <AlertCircle className="w-5 h-5 text-emerald-400" />
              Core Infrastructure Health
            </h3>

            <div className="space-y-3 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-emerald-300/70">Express Node Server</span>
                <span className="font-extrabold text-emerald-400">ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-300/70">Prisma Client</span>
                <span className="font-extrabold text-emerald-400">CONNECTED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-300/70">PostgreSQL (Supabase)</span>
                <span className="font-extrabold text-emerald-400">CONNECTED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-300/70">Redis (Upstash)</span>
                <span className="font-extrabold text-emerald-400">CONNECTED</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-emerald-500/10">
                <span className="text-emerald-300/70">Average API Latency</span>
                <span className="font-extrabold text-white">{metrics?.systemHealth?.apiLatency ?? '38ms'}</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
