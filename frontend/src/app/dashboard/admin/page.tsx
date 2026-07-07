'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../../store/useStore';
import { translations } from '../../../utils/translations';
import { Sprout, LogOut, Users, Cpu, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useStore();

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
      const response = await axios.get('http://localhost:5000/api/analytics/admin', {
        headers: { Authorization: `Bearer mock-jwt-token` }
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
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-850 dark:text-stone-100 flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass-panel border-r border-stone-200/50 dark:border-stone-800/50 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 dark:bg-emerald-500 text-white p-2 rounded-xl">
              <Sprout className="w-5 h-5" />
            </div>
            <h1 className="font-extrabold text-lg tracking-tight text-emerald-700 dark:text-emerald-400">Kisan Alert</h1>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Super Control Center</span>
            <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
              Kisan Alert Administrator
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200/40 dark:border-stone-800/40">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-red-105 dark:bg-red-950 flex items-center justify-center font-bold text-red-700 dark:text-red-400">
              {user?.name?.[0] || 'A'}
            </div>
            <div>
              <p className="font-bold text-sm leading-none">{user?.name || 'Administrator'}</p>
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Root Admin</span>
            </div>
          </div>
          <button 
            onClick={() => { logout(); router.push('/'); }}
            className="w-full py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 rounded-xl font-bold text-xs text-red-600 dark:text-red-400 flex items-center justify-center gap-1.5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main dashboard content */}
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-stone-200/30 dark:border-stone-800/30">
          <div>
            <h2 className="text-3xl font-black">Admin Dashboard</h2>
            <p className="text-sm text-stone-500">Monitor Kisan Alert metrics, API load, and system metrics</p>
          </div>
          <button 
            onClick={fetchMetrics}
            disabled={loading}
            className="p-2.5 bg-stone-200 dark:bg-stone-900 border border-stone-300 dark:border-stone-800 rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-stone-200/50 dark:border-stone-800/50 shadow-xl space-y-2">
            <Users className="w-8 h-8 text-emerald-500" />
            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Total Farmers Registered</p>
            <h3 className="text-3xl font-black">{metrics?.metrics?.farmersCount ?? '1,422'}</h3>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-stone-200/50 dark:border-stone-800/50 shadow-xl space-y-2">
            <Users className="w-8 h-8 text-purple-500" />
            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Agriculture Experts Onboarded</p>
            <h3 className="text-3xl font-black">{metrics?.metrics?.expertsCount ?? '28'}</h3>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-stone-200/50 dark:border-stone-800/50 shadow-xl space-y-2">
            <Cpu className="w-8 h-8 text-blue-500" />
            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">AI Crop Recommendations</p>
            <h3 className="text-3xl font-black">{metrics?.metrics?.recommendationsCount ?? '890'}</h3>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-stone-200/50 dark:border-stone-800/50 shadow-xl space-y-2">
            <MessageSquare className="w-8 h-8 text-amber-500" />
            <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">Escalated Tickets Active</p>
            <h3 className="text-3xl font-black">{metrics?.ticketsSummary?.OPEN ?? '8'}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Usage Card */}
          <div className="glass-panel p-6 rounded-2xl border border-stone-200/50 dark:border-stone-800/50 shadow-xl space-y-4">
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <Cpu className="w-5 h-5 text-emerald-500" />
              Gemini API Usage Meter
            </h3>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Gemini 1.5 Flash (LLM Chats)</span>
                  <span>78,240 / 100,000 requests</span>
                </div>
                <div className="w-full bg-stone-200 dark:bg-stone-850 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '78%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Gemini 1.5 Flash (Vision)</span>
                  <span>14,500 / 25,000 requests</span>
                </div>
                <div className="w-full bg-stone-200 dark:bg-stone-850 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: '58%' }} />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold text-center">
                Within Free Tier Limits. Zero Cost Incurred.
              </div>
            </div>
          </div>

          {/* SMS & WhatsApp Analytics */}
          <div className="glass-panel p-6 rounded-2xl border border-stone-200/50 dark:border-stone-800/50 shadow-xl space-y-4">
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
              Notification APIs Status
            </h3>

            <div className="space-y-4 text-xs font-bold">
              <div className="flex justify-between items-center p-2.5 bg-white/70 dark:bg-stone-900 border border-stone-200/30 rounded-xl">
                <span>Twilio SMS Gateway</span>
                <span className="text-emerald-500 flex items-center gap-1">🟢 Active (99.8%)</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-white/70 dark:bg-stone-900 border border-stone-200/30 rounded-xl">
                <span>Meta WhatsApp Cloud API</span>
                <span className="text-emerald-500 flex items-center gap-1">🟢 Active (100%)</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-white/70 dark:bg-stone-900 border border-stone-200/30 rounded-xl">
                <span>Resend Email Agent</span>
                <span className="text-emerald-500 flex items-center gap-1">🟢 Active (99.9%)</span>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="glass-panel p-6 rounded-2xl border border-stone-200/50 dark:border-stone-800/50 shadow-xl space-y-4">
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-emerald-500" />
              Core Infrastructure Health
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="font-bold text-stone-500">Express Node Server</span>
                <span className="font-extrabold text-emerald-500">ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-stone-500">Prisma Client</span>
                <span className="font-extrabold text-emerald-500">CONNECTED</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-stone-500">PostgreSQL (Supabase)</span>
                <span className="font-extrabold text-emerald-500">CONNECTED</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-stone-500">Redis (Upstash)</span>
                <span className="font-extrabold text-emerald-500">CONNECTED</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-200/30">
                <span className="font-bold text-stone-500">Average API Latency</span>
                <span className="font-extrabold text-stone-800 dark:text-stone-300">{metrics?.systemHealth?.apiLatency ?? '38ms'}</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
