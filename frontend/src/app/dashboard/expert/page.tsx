'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../../store/useStore';
import { translations } from '../../../utils/translations';
import { Sprout, LogOut, FileText, CheckCircle, Clock, MapPin, Clipboard } from 'lucide-react';
import axios from 'axios';

export default function ExpertDashboard() {
  const router = useRouter();
  const { user, currentLanguage, logout } = useStore();
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
      const response = await axios.get('http://localhost:5000/api/tickets', {
        headers: { Authorization: `Bearer mock-jwt-token` }
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
      await axios.post(`http://localhost:5000/api/tickets/${selectedTicket.id}/resolve`, {
        resolutionNotes
      }, {
        headers: { Authorization: `Bearer mock-jwt-token` }
      });
      fetchTickets();
      setResolutionNotes('');
    } catch (_) {
      // Offline fallback state update
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
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-850 dark:text-stone-100 flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass-panel border-r border-stone-200/50 dark:border-stone-800/50 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 dark:bg-emerald-500 text-white p-2 rounded-xl">
              <Sprout className="w-5 h-5" />
            </div>
            <h1 className="font-extrabold text-lg tracking-tight text-emerald-700 dark:text-emerald-400">{t.appName}</h1>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Expertise RSK Hub</span>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold">
              Rythu Seva Kendra Office
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200/40 dark:border-stone-800/40">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center font-bold text-purple-700 dark:text-purple-400">
              {user?.name?.[0] || 'E'}
            </div>
            <div>
              <p className="font-bold text-sm leading-none">{user?.name || 'Expert'}</p>
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">RSK Specialist</span>
            </div>
          </div>
          <button 
            onClick={() => { logout(); router.push('/'); }}
            className="w-full py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 rounded-xl font-bold text-xs text-red-600 dark:text-red-400 flex items-center justify-center gap-1.5 transition-all"
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
            <h2 className="text-2xl font-black">{t.expertDashboard}</h2>
            <p className="text-xs text-stone-500">Review crop disease cases escalated by AI</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[75vh]">
            {tickets.map(ticket => (
              <div 
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedTicket?.id === ticket.id 
                    ? 'bg-white dark:bg-stone-900 border-purple-500 shadow-lg' 
                    : 'glass-panel border-stone-200/50 dark:border-stone-850 hover:border-stone-300 dark:hover:border-stone-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-extrabold text-sm">{ticket.title}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    ticket.status === 'OPEN' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 line-clamp-2">{ticket.description}</p>
                
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-stone-100 dark:border-stone-850 text-[10px] text-stone-400 font-bold">
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
        <div className="flex-1 glass-panel p-6 rounded-3xl border border-stone-200/50 dark:border-stone-800/50 shadow-xl space-y-6">
          {selectedTicket ? (
            <div className="space-y-6">
              
              <div className="flex justify-between items-start border-b border-stone-200/40 dark:border-stone-800/40 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Ticket ID: {selectedTicket.id}</span>
                  <h3 className="text-xl font-extrabold text-stone-800 dark:text-stone-100 mt-1">{selectedTicket.title}</h3>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs bg-purple-50 dark:bg-purple-950 text-purple-700 px-3 py-1 rounded-full font-bold">
                    Farmer Lang: {selectedTicket.farmer?.language.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Farmer Profile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-100/50 dark:bg-stone-900/60 p-4 rounded-2xl border border-stone-200/35">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400">Farmer Details</span>
                  <p className="font-bold text-sm text-stone-700 dark:text-stone-300">{selectedTicket.farmer?.name}</p>
                  <p className="text-xs text-stone-500">Phone: {selectedTicket.farmer?.phone} | Email: {selectedTicket.farmer?.email}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-stone-600 dark:text-stone-400">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span>Farm Location: Guntur Rural, AP</span>
                </div>
              </div>

              {/* AI Diagnostic Output */}
              <div className="p-4 bg-white/60 dark:bg-stone-900/60 rounded-2xl border border-stone-250/20 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-200/30 pb-2">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">AI Gemini Vision Report</span>
                  <span className="text-xs font-bold text-red-500 bg-red-100/50 dark:bg-red-950 px-2 py-0.5 rounded">
                    Severity: {selectedTicket.diseaseReport?.severity || 'HIGH'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="font-bold text-stone-400">Identified Disease</span>
                    <p className="font-bold text-stone-700 dark:text-stone-300">{selectedTicket.diseaseReport?.diseaseName}</p>
                  </div>
                  <div>
                    <span className="font-bold text-stone-400">AI Confidence</span>
                    <p className="font-bold text-stone-700 dark:text-stone-300">{Math.round((selectedTicket.diseaseReport?.confidenceScore || 0.75) * 100)}%</p>
                  </div>
                </div>

                <div className="text-xs leading-relaxed text-stone-600 dark:text-stone-300 pt-1.5 border-t border-stone-200/30">
                  <span className="font-bold block text-stone-400 mb-1">AI Treatment Proposal</span>
                  {selectedTicket.diseaseReport?.treatment}
                </div>
              </div>

              {/* Resolution Action */}
              {selectedTicket.status === 'OPEN' ? (
                <form onSubmit={handleResolveTicket} className="space-y-4 pt-4 border-t border-stone-200/40">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Manual Diagnosis & Instructions</label>
                    <textarea
                      required
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Specify your expert pesticide dosage recommendations, fertilizer scheduling, or soil treatment advice to the farmer..."
                      className="w-full p-4 rounded-2xl bg-white/70 dark:bg-stone-900 border border-stone-250 focus:border-purple-500 outline-none text-sm font-medium h-32"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-extrabold px-8 py-3.5 rounded-xl text-sm transition-all"
                  >
                    {loading ? 'Submitting resolution...' : 'Resolve Ticket & Notify Farmer'}
                  </button>
                </form>
              ) : (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400">Ticket Resolved</span>
                  </div>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed font-medium">
                    <span className="font-bold block text-emerald-700 dark:text-emerald-400">Resolution Notes:</span>
                    {selectedTicket.resolutionNotes}
                  </p>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-20 text-stone-400">
              Select an escalated crop disease ticket to begin expert manual review.
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
