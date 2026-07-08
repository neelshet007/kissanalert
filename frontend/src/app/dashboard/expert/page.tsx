'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../../store/useStore';
import { translations } from '../../../utils/translations';
import { Sprout, LogOut, FileText, CheckCircle, Clock, MapPin, Globe } from 'lucide-react';
import axios from 'axios';

import { API_BASE_URL } from '../../../utils/api';

export default function ExpertDashboard() {
  const router = useRouter();
  const { user, token, currentLanguage, setLanguage, logout } = useStore();
  const t = translations[currentLanguage] || translations.en;

  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'EXPERT') {
      router.push('/auth/login');
      return;
    }
    fetchTickets();
  }, [user]);

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tickets`, {
        headers: { Authorization: `Bearer ${token || 'mock-jwt-token'}` }
      });
      setTickets(response.data);
      if (response.data.length > 0) {
        setSelectedTicket(response.data[0]);
      }
    } catch (_) {
      // Mock Fallback Tickets
      const mockTickets = [
        {
          id: 'mock-ticket-1',
          title: 'Cotton Leaf Curl Escalation',
          description: 'AI detected Cotton Leaf Curl Virus with 74% confidence. Farmer Ramesh Kumar reported fast spreading in the north sector.',
          status: 'OPEN',
          createdAt: new Date().toISOString(),
          farmer: {
            name: 'Ramesh Kumar',
            phone: '9876543210',
            email: 'farmer@kisanalert.com',
            language: 'hi'
          },
          diseaseReport: {
            diseaseName: 'Cotton Leaf Curl Virus',
            confidenceScore: 0.74,
            severity: 'HIGH',
            treatment: 'Uproot infected cotton crops. Spray Imidacloprid.',
            suggestedPesticide: 'Imidacloprid 17.8% SL',
            suggestedFertilizer: 'MOP Potash'
          }
        },
        {
          id: 'mock-ticket-2',
          title: 'Tomato Yellow Leaf Curl',
          description: 'AI detected Whitefly pest presence with 79% confidence. Crop looks weakened and yellowing is widespread.',
          status: 'RESOLVED',
          createdAt: new Date().toISOString(),
          resolutionNotes: 'Advised farmer to set up yellow sticky traps and apply Neem Oil spray (1500 ppm) early mornings.',
          farmer: {
            name: 'Devendra Patil',
            phone: '9123456789',
            email: 'devendra@example.com',
            language: 'mr'
          },
          diseaseReport: {
            diseaseName: 'Tomato Leaf Curl',
            confidenceScore: 0.79,
            severity: 'MEDIUM',
            treatment: 'Remove weeds. Keep field clean.',
            suggestedPesticide: 'Neem Oil spray',
            suggestedFertilizer: 'Micronutrient foliar spray'
          }
        }
      ];
      setTickets(mockTickets);
      setSelectedTicket(mockTickets[0]);
    }
  };

  const handleResolveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionNotes) return;
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/api/tickets/${selectedTicket.id}/resolve`, {
        resolutionNotes
      }, {
        headers: { Authorization: `Bearer ${token || 'mock-jwt-token'}` }
      });
      fetchTickets();
      setResolutionNotes('');
    } catch (_) {
      const updated = tickets.map(t => {
        if (t.id === selectedTicket.id) {
          return { ...t, status: 'RESOLVED', resolutionNotes };
        }
        return t;
      });
      setTickets(updated);
      setSelectedTicket({ ...selectedTicket, status: 'RESOLVED', resolutionNotes });
      setResolutionNotes('');
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
              <h1 className="font-extrabold text-lg tracking-tight text-emerald-300">{t.appName}</h1>
              <p className="text-[9px] uppercase font-bold tracking-widest text-emerald-400">RSK Expert Hub</p>
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
                  <option value="gu" className="bg-[#022c22]">ગુજરાતી</option>
                  <option value="kn" className="bg-[#022c22]">ಕನ್ನಡ</option>
                  <option value="ml" className="bg-[#022c22]">മലയാളം</option>
                  <option value="pa" className="bg-[#022c22]">ਪੰਜਾਬੀ</option>
                  <option value="bn" className="bg-[#022c22]">বাংলা</option>
                  <option value="or" className="bg-[#022c22]">ଓଡ଼ିଆ</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-emerald-950/50 border border-emerald-500/10 text-emerald-300 rounded-xl text-xs font-bold">
              📍 RSK Guntur Center
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-emerald-500/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/35 flex items-center justify-center font-bold text-purple-300">
              {user?.name?.[0] || 'E'}
            </div>
            <div>
              <p className="font-extrabold text-sm leading-none text-white">{user?.name || 'Expert'}</p>
              <span className="text-[9px] uppercase font-bold text-purple-400 tracking-wider">RSK Specialist</span>
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
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        
        {/* Ticket List Panel */}
        <div className="w-full lg:w-96 flex flex-col space-y-4">
          <div>
            <h2 className="text-3xl font-black text-white">{t.expertDashboard}</h2>
            <p className="text-xs text-emerald-300/70 font-semibold mt-1">Review crop disease cases escalated by AI</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[75vh]">
            {tickets.map(ticket => (
              <div 
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedTicket?.id === ticket.id 
                    ? 'bg-emerald-950/50 border-emerald-400 shadow-xl' 
                    : 'bg-emerald-950/20 border-emerald-500/10 hover:border-emerald-500/30'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-extrabold text-sm text-white">{ticket.title}</h4>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    ticket.status === 'OPEN' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-xs text-emerald-100/60 mt-2 line-clamp-2">{ticket.description}</p>
                
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-emerald-500/10 text-[10px] text-emerald-400/70 font-bold">
                  <span>Farmer: {ticket.farmer?.name}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Today
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ticket Detail Panel */}
        <div className="flex-1 bg-emerald-950/30 backdrop-blur-xl p-6 rounded-3xl border border-emerald-500/10 shadow-xl space-y-6">
          {selectedTicket ? (
            <div className="space-y-6">
              
              <div className="flex justify-between items-start border-b border-emerald-500/10 pb-4">
                <div>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Ticket ID: {selectedTicket.id}</span>
                  <h3 className="text-xl font-extrabold text-white mt-1">{selectedTicket.title}</h3>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3.5 py-1 rounded-full font-bold">
                    Farmer Lang: {selectedTicket.farmer?.language.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Farmer Profile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400/70">Farmer Details</span>
                  <p className="font-extrabold text-sm text-white">{selectedTicket.farmer?.name}</p>
                  <p className="text-xs text-emerald-100/60 mt-0.5">Phone: {selectedTicket.farmer?.phone} | Email: {selectedTicket.farmer?.email}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Farm Location: Guntur Rural, AP</span>
                </div>
              </div>

              {/* AI Diagnostic Output */}
              <div className="p-4 bg-emerald-950/60 rounded-2xl border border-emerald-500/10 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-500/10 pb-2">
                  <span className="text-xs font-extrabold text-emerald-300">AI Gemini Vision Report</span>
                  <span className="text-[10px] font-black text-rose-300 bg-rose-500/20 border border-rose-500/20 px-2 py-0.5 rounded">
                    Severity: {selectedTicket.diseaseReport?.severity || 'HIGH'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-bold text-emerald-400/60">Identified Disease</span>
                    <p className="font-extrabold text-white mt-0.5">{t[selectedTicket.diseaseReport?.diseaseName] || selectedTicket.diseaseReport?.diseaseName}</p>
                  </div>
                  <div>
                    <span className="font-bold text-emerald-400/60">AI Confidence</span>
                    <p className="font-extrabold text-white mt-0.5">{Math.round((selectedTicket.diseaseReport?.confidenceScore || 0.75) * 100)}%</p>
                  </div>
                </div>

                <div className="text-xs leading-relaxed text-emerald-100 pt-2.5 border-t border-emerald-500/10">
                  <span className="font-bold block text-emerald-400/70 mb-1">AI Treatment Proposal</span>
                  {selectedTicket.diseaseReport?.treatment}
                </div>
              </div>

              {/* Resolution Action */}
              {selectedTicket.status === 'OPEN' ? (
                <form onSubmit={handleResolveTicket} className="space-y-4 pt-4 border-t border-emerald-500/10">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-emerald-400">Manual Diagnosis & Instructions</label>
                    <textarea
                      required
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Specify your expert pesticide dosage recommendations, fertilizer scheduling, or soil treatment advice to the farmer..."
                      className="w-full p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/15 focus:border-emerald-400 outline-none text-sm font-medium h-32 text-white placeholder-emerald-400/40"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 text-[#022c22] font-black px-8 py-3.5 rounded-xl text-sm transition-all"
                  >
                    {loading ? 'Submitting resolution...' : 'Resolve Ticket & Notify Farmer'}
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-sm text-emerald-300">Ticket Resolved</span>
                  </div>
                  <p className="text-xs text-emerald-100 leading-relaxed font-semibold">
                    <span className="font-bold block text-emerald-400 mb-1">Resolution Notes:</span>
                    {selectedTicket.resolutionNotes}
                  </p>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-20 text-emerald-400/60 font-bold">
              Select an escalated crop disease ticket to begin expert manual review.
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
