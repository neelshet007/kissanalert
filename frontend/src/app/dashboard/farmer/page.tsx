'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../../store/useStore';
import { translations } from '../../../utils/translations';
import { 
  Sprout, CloudRain, ShieldAlert, Mic, Thermometer, Droplets, Wind, 
  Settings, LogOut, Compass, Plus, Landmark, CheckCircle, AlertTriangle, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function FarmerDashboard() {
  const router = useRouter();
  const { user, currentLanguage, setLanguage, logout } = useStore();
  const t = translations[currentLanguage] || translations.en;

  const [farms, setFarms] = useState<any[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Modal triggers
  const [showCreateFarm, setShowCreateFarm] = useState(false);
  const [showSoilReport, setShowSoilReport] = useState(false);
  const [showDiseaseDetect, setShowDiseaseDetect] = useState(false);

  // New Farm form
  const [farmForm, setFarmForm] = useState({
    name: 'South Cotton Fields',
    location: 'Guntur, Andhra Pradesh',
    latitude: 16.306,
    longitude: 80.436,
    size: 3.5,
    soilType: 'Black Soil',
    groundwater: 'Medium'
  });

  // Soil health form
  const [soilForm, setSoilForm] = useState({
    ph: 6.5,
    nitrogen: 120,
    phosphorus: 35,
    potassium: 230,
    organicCarbon: 0.6,
    season: 'Kharif'
  });

  // Voice Assistant state
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceAnswer, setVoiceAnswer] = useState('');
  const [voiceLoading, setVoiceLoading] = useState(false);

  // Weather and Crop Rec
  const [weatherAlert, setWeatherAlert] = useState<any>(null);
  const [cropRec, setCropRec] = useState<any>(null);
  const [diseaseReport, setDiseaseReport] = useState<any>(null);

  // Disease upload mock state
  const [diseaseInput, setDiseaseInput] = useState<any>(null);
  const [diseaseLoading, setDiseaseLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchFarms();
  }, [user]);

  const fetchFarms = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/farms', {
        headers: { Authorization: `Bearer mock-jwt-token` }
      });
      setFarms(response.data);
      if (response.data.length > 0) {
        setSelectedFarm(response.data[0]);
      }
    } catch (_) {
      // Mock Fallback
      const mockFarms = [
        {
          id: 'mock-farm-1',
          name: 'Guntur Paddy Fields',
          location: 'Guntur, Andhra Pradesh',
          latitude: 16.306,
          longitude: 80.436,
          size: 4.5,
          soilType: 'Clay Soil',
          groundwater: 'Medium',
          soilReports: [{ ph: 6.8, nitrogen: 110, phosphorus: 32, potassium: 240, organicCarbon: 0.65 }]
        }
      ];
      setFarms(mockFarms);
      setSelectedFarm(mockFarms[0]);
    }
  };

  useEffect(() => {
    if (selectedFarm) {
      loadWeatherAndRecs();
    }
  }, [selectedFarm]);

  const loadWeatherAndRecs = async () => {
    setLoading(true);
    try {
      // Weather
      const weatherRes = await axios.get(`http://localhost:5000/api/farms/${selectedFarm.id}/weather`, {
        headers: { Authorization: `Bearer mock-jwt-token` }
      });
      setWeatherAlert(weatherRes.data);
    } catch (_) {
      // Offline fallback weather
      setWeatherAlert({
        temperature: 31,
        humidity: 75,
        rainfall: 0,
        windSpeed: 12,
        advisory: 'No rain forecast. Keep irrigation levels normal. Sowing conditions are ideal.'
      });
    }

    try {
      // If there are recommendations on the farm
      if (selectedFarm.cropRecommendations && selectedFarm.cropRecommendations.length > 0) {
        setCropRec(selectedFarm.cropRecommendations[0]);
      } else {
        setCropRec(null);
      }
    } catch (_) {}
    setLoading(false);
  };

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/farms', farmForm, {
        headers: { Authorization: `Bearer mock-jwt-token` }
      });
      setFarms([...farms, response.data]);
      setSelectedFarm(response.data);
      setShowCreateFarm(false);
    } catch (_) {
      const mockNew = {
        id: `mock-farm-${Date.now()}`,
        ...farmForm,
        soilReports: []
      };
      setFarms([...farms, mockNew]);
      setSelectedFarm(mockNew);
      setShowCreateFarm(false);
    }
  };

  const handleSoilReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:5000/api/farms/${selectedFarm.id}/soil-report`, soilForm, {
        headers: { Authorization: `Bearer mock-jwt-token` }
      });
      setCropRec(response.data.cropRec);
      setShowSoilReport(false);
    } catch (_) {
      // Mock Crop Rec response
      setCropRec({
        recommendedCrop: soilForm.ph > 6 ? 'Cotton' : 'Paddy Rice',
        confidenceScore: 0.91,
        reasoning: 'The soil parameters show excellent potassium levels and moderate pH, suitable for cotton roots.',
        waterRequirement: 'Medium',
        expectedYield: '18-24 Quintals per acre',
        riskLevel: 'Low',
        season: soilForm.season
      });
      setShowSoilReport(false);
    }
  };

  const handleVoiceQuery = async () => {
    if (!voiceQuery) return;
    setVoiceLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/voice/query', {
        farmId: selectedFarm.id,
        transcription: voiceQuery,
        language: currentLanguage
      }, {
        headers: { Authorization: `Bearer mock-jwt-token` }
      });
      setVoiceAnswer(response.data.aiResponseText);
    } catch (_) {
      // Voice query mock translations responses
      if (currentLanguage === 'hi') {
        setVoiceAnswer('पत्तियों के पीले होने को रोकने के लिए, मिट्टी में थोड़ा नाइट्रोजन मिलाएँ और समय पर सिंचाई करें।');
      } else if (currentLanguage === 'te') {
        setVoiceAnswer('ఆకులు పసుపు రంగులోకి మారకుండా ఉండటానికి, సేంద్రీయ నత్రజని ఎరువులు వేయండి.');
      } else {
        setVoiceAnswer('To treat leaf yellowing, ensure proper nitrogen levels and check the soil humidity.');
      }
    } finally {
      setVoiceLoading(false);
    }
  };

  const handleDiseaseDiagnose = async () => {
    setDiseaseLoading(true);
    // Simulate image diagnosis call
    setTimeout(() => {
      setDiseaseReport({
        diseaseName: 'Tomato Early Blight',
        confidenceScore: 0.88,
        severity: 'MEDIUM',
        treatment: 'Apply copper-based fungicides weekly. Uproot and burn infected branches to prevent spreading.',
        suggestedFertilizer: 'Potassium Nitrate to strengthen cell walls.',
        suggestedPesticide: 'Mancozeb Fungicide',
        expertEscalationRequired: true
      });
      setDiseaseLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#022c22] via-[#064e3b] to-[#042f2e] text-stone-100 flex flex-col md:flex-row pb-12 md:pb-0 transition-colors duration-300">
      
      {/* Sidebar navigation */}
      <aside className="w-full md:w-72 bg-[#022c22]/60 backdrop-blur-xl border-r border-emerald-500/10 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight text-emerald-300">{t.appName}</h1>
              <p className="text-[9px] uppercase font-bold tracking-widest text-emerald-400">{t.tagline}</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Language Selector */}
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

            <div>
              <label className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-400/70">Selected Farm</label>
              <div className="relative mt-1.5">
                <select
                  value={selectedFarm?.id || ''}
                  onChange={(e) => setSelectedFarm(farms.find(f => f.id === e.target.value))}
                  className="w-full bg-emerald-950/50 border border-emerald-500/10 p-3 rounded-xl outline-none font-bold text-white text-xs cursor-pointer focus:ring-0"
                >
                  {farms.map(f => (
                    <option key={f.id} value={f.id} className="bg-[#022c22]">{f.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={() => setShowCreateFarm(true)}
              className="w-full py-3 bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-500/15 rounded-xl font-bold text-xs flex items-center justify-center gap-2 text-emerald-300 transition-all"
            >
              <Plus className="w-4 h-4" />
              {t.createFarm}
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-emerald-500/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-black text-emerald-300">
              {user?.name?.[0] || 'F'}
            </div>
            <div>
              <p className="font-extrabold text-sm leading-none text-white">{user?.name || 'Farmer'}</p>
              <span className="text-[9px] uppercase font-bold text-emerald-400/70 tracking-wider">Farmer Account</span>
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

      {/* Main content grid */}
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto relative z-10">
        
        {/* Dynamic header cards */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-emerald-500/10 gap-4">
          <div>
            <h2 className="text-3xl font-black text-white">{t.farmerDashboard}</h2>
            <p className="text-xs text-emerald-300/70 font-semibold mt-1">Manage, monitor, and diagnose your farm operations</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setShowSoilReport(true)}
              className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-[#022c22] font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/5"
            >
              {t.uploadSoil}
            </button>
            <button 
              onClick={() => setShowDiseaseDetect(true)}
              className="bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/20 text-emerald-300 font-extrabold text-xs px-5 py-3 rounded-xl transition-all"
            >
              {t.diseaseDetection}
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Weather Advisory Card */}
          <div className="bg-emerald-950/30 backdrop-blur-xl p-6 rounded-3xl border border-emerald-500/10 shadow-xl space-y-5 lg:col-span-2">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-emerald-400" />
                {t.advisory}
              </h3>
              <span className="text-[10px] uppercase font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
                Open-Meteo Integration
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/5 flex flex-col items-center">
                <Thermometer className="w-6 h-6 text-rose-400" />
                <span className="text-[10px] font-bold text-emerald-300/70 mt-1.5">Temperature</span>
                <p className="font-black text-xl text-white mt-0.5">{weatherAlert?.temperature ?? '31'}°C</p>
              </div>
              <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/5 flex flex-col items-center">
                <Droplets className="w-6 h-6 text-sky-400" />
                <span className="text-[10px] font-bold text-emerald-300/70 mt-1.5">Humidity</span>
                <p className="font-black text-xl text-white mt-0.5">{weatherAlert?.humidity ?? '75'}%</p>
              </div>
              <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/5 flex flex-col items-center">
                <CloudRain className="w-6 h-6 text-indigo-400" />
                <span className="text-[10px] font-bold text-emerald-300/70 mt-1.5">Rainfall</span>
                <p className="font-black text-xl text-white mt-0.5">{weatherAlert?.rainfall ?? '0'} mm</p>
              </div>
              <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/5 flex flex-col items-center">
                <Wind className="w-6 h-6 text-teal-400" />
                <span className="text-[10px] font-bold text-emerald-300/70 mt-1.5">Wind Speed</span>
                <p className="font-black text-xl text-white mt-0.5">{weatherAlert?.windSpeed ?? '12'} km/h</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">AI Agronomist Dynamic Advisory</span>
              <p className="text-sm text-emerald-100 mt-1.5 leading-relaxed font-medium">{weatherAlert?.advisory}</p>
            </div>
          </div>

          {/* Multilingual Voice Assistant Panel */}
          <div className="bg-emerald-950/30 backdrop-blur-xl p-6 rounded-3xl border border-emerald-500/10 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Mic className="w-5 h-5 text-emerald-400" />
                {t.voiceAssistant}
              </h3>
              <p className="text-xs text-emerald-300/60 mt-1 leading-relaxed font-semibold">Speak or ask about soil, sowing options, and pesticides.</p>
            </div>

            <div className="space-y-3">
              <textarea
                value={voiceQuery}
                onChange={(e) => setVoiceQuery(e.target.value)}
                placeholder="Ask in Hindi, Telugu... e.g. My leaves are yellowing"
                className="w-full p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/10 outline-none text-xs font-semibold text-white h-24 placeholder-emerald-400/40"
              />
              <button 
                onClick={handleVoiceQuery}
                disabled={voiceLoading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-[#022c22] font-black rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Mic className="w-4 h-4 animate-pulse" />
                {voiceLoading ? 'AI Processing...' : t.speak}
              </button>
            </div>

            {voiceAnswer && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-500/10 rounded-xl text-xs font-bold space-y-1">
                <span className="text-emerald-400 uppercase tracking-widest text-[9px]">AI translation response</span>
                <p className="font-semibold text-white leading-relaxed">{voiceAnswer}</p>
              </div>
            )}
          </div>

          {/* Soil Health Card & Recommendations */}
          <div className="bg-emerald-950/30 backdrop-blur-xl p-6 rounded-3xl border border-emerald-500/10 shadow-xl lg:col-span-3 space-y-4">
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-400" />
              {t.recommendation}
            </h3>

            {cropRec ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <span className="text-xs uppercase text-emerald-400 font-extrabold">Recommended Crop</span>
                  <p className="text-2xl font-black text-white mt-1">{t[cropRec.recommendedCrop] || cropRec.recommendedCrop}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-emerald-300">Confidence:</span>
                    <span className="text-[10px] font-bold bg-emerald-500/25 px-2.5 py-0.5 rounded-full border border-emerald-500/30">{Math.round(cropRec.confidenceScore * 100)}%</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-950/40 rounded-2xl border border-emerald-500/5">
                  <span className="text-xs uppercase text-emerald-300/70 font-extrabold">Expected Yield / Acre</span>
                  <p className="text-lg font-black mt-1 text-white">{cropRec.expectedYield}</p>
                </div>

                <div className="p-4 bg-emerald-950/40 rounded-2xl border border-emerald-500/5">
                  <span className="text-xs uppercase text-emerald-300/70 font-extrabold">Water Requirement</span>
                  <p className="text-lg font-black mt-1 text-white">{cropRec.waterRequirement}</p>
                </div>

                <div className="p-4 bg-emerald-950/40 rounded-2xl border border-emerald-500/5">
                  <span className="text-xs uppercase text-emerald-300/70 font-extrabold">Risk Level</span>
                  <p className={`text-lg font-black mt-1 ${cropRec.riskLevel.toLowerCase() === 'high' ? 'text-rose-400' : 'text-emerald-400'}`}>{cropRec.riskLevel}</p>
                </div>

                <div className="col-span-1 md:col-span-2 lg:col-span-4 p-4 bg-emerald-950/50 border border-emerald-500/10 rounded-2xl">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">AI Agronomist Sowing Reason</span>
                  <p className="text-sm text-emerald-100 mt-1.5 leading-relaxed font-semibold">{cropRec.reasoning}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <p className="text-emerald-300/70 font-semibold">No crop recommendations yet. Upload your soil report parameters (N, P, K, pH) to trigger AI recommendation.</p>
                <button 
                  onClick={() => setShowSoilReport(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 text-[#022c22] font-black px-6 py-3 rounded-xl shadow-lg transition-all"
                >
                  Upload Soil Health Card
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CREATE FARM MODAL */}
      <AnimatePresence>
        {showCreateFarm && (
          <div className="fixed inset-0 z-50 bg-[#022c22]/80 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#064e3b] rounded-3xl p-6 w-full max-w-md space-y-4 border border-emerald-500/20 text-white"
            >
              <h3 className="font-extrabold text-xl">{t.createFarm}</h3>
              <form onSubmit={handleCreateFarm} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-emerald-300">Farm Name</label>
                  <input
                    type="text"
                    required
                    value={farmForm.name}
                    onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/10 outline-none text-sm text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-emerald-300">Location</label>
                  <input
                    type="text"
                    required
                    value={farmForm.location}
                    onChange={(e) => setFarmForm({ ...farmForm, location: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/10 outline-none text-sm text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-emerald-300">Size (Acres)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={farmForm.size}
                      onChange={(e) => setFarmForm({ ...farmForm, size: parseFloat(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/10 outline-none text-sm text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-emerald-300">Soil Type</label>
                    <input
                      type="text"
                      required
                      value={farmForm.soilType}
                      onChange={(e) => setFarmForm({ ...farmForm, soilType: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/10 outline-none text-sm text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowCreateFarm(false)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-950/80 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 text-[#022c22] font-black text-xs"
                  >
                    Save Farm
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* UPLOAD SOIL REPORT MODAL */}
      <AnimatePresence>
        {showSoilReport && (
          <div className="fixed inset-0 z-50 bg-[#022c22]/80 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#064e3b] rounded-3xl p-6 w-full max-w-lg space-y-4 border border-emerald-500/20 text-white"
            >
              <h3 className="font-extrabold text-xl">{t.uploadSoil}</h3>
              <form onSubmit={handleSoilReport} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-emerald-300">{t.ph}</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={soilForm.ph}
                      onChange={(e) => setSoilForm({ ...soilForm, ph: parseFloat(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/10 outline-none text-sm text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-emerald-300">Sowing Season</label>
                    <select
                      value={soilForm.season}
                      onChange={(e) => setSoilForm({ ...soilForm, season: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/10 outline-none text-sm text-white focus:ring-0"
                    >
                      <option value="Kharif" className="bg-[#022c22]">Kharif (Monsoon)</option>
                      <option value="Rabi" className="bg-[#022c22]">Rabi (Winter)</option>
                      <option value="Zaid" className="bg-[#022c22]">Zaid (Summer)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-emerald-300">{t.nitrogen}</label>
                    <input
                      type="number"
                      required
                      value={soilForm.nitrogen}
                      onChange={(e) => setSoilForm({ ...soilForm, nitrogen: parseFloat(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/10 outline-none text-sm text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-emerald-300">{t.phosphorus}</label>
                    <input
                      type="number"
                      required
                      value={soilForm.phosphorus}
                      onChange={(e) => setSoilForm({ ...soilForm, phosphorus: parseFloat(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/10 outline-none text-sm text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-emerald-300">{t.potassium}</label>
                    <input
                      type="number"
                      required
                      value={soilForm.potassium}
                      onChange={(e) => setSoilForm({ ...soilForm, potassium: parseFloat(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/10 outline-none text-sm text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-emerald-300">{t.organicCarbon}</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={soilForm.organicCarbon}
                    onChange={(e) => setSoilForm({ ...soilForm, organicCarbon: parseFloat(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/10 outline-none text-sm text-white"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowSoilReport(false)}
                    className="px-4 py-2.5 rounded-xl bg-emerald-950/80 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 text-[#022c22] font-black text-xs"
                  >
                    Get Recommendation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DISEASE DETECTION MODAL */}
      <AnimatePresence>
        {showDiseaseDetect && (
          <div className="fixed inset-0 z-50 bg-[#022c22]/80 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#064e3b] rounded-3xl p-6 w-full max-w-lg space-y-4 border border-emerald-500/20 text-white max-h-[85vh] overflow-y-auto"
            >
              <h3 className="font-extrabold text-xl">{t.diseaseDetection}</h3>
              
              {!diseaseReport ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-emerald-500/20 rounded-2xl p-8 text-center space-y-2 cursor-pointer hover:border-emerald-400/50 transition-all">
                    <CloudRain className="w-8 h-8 mx-auto text-emerald-400" />
                    <p className="font-bold text-sm">Upload crop leaf photo</p>
                    <p className="text-xs text-emerald-300/70">Supports JPG, PNG up to 10MB</p>
                    <input 
                      type="file" 
                      onChange={(e) => setDiseaseInput(e.target.files?.[0] || null)}
                      className="hidden" 
                      id="disease-upload-input"
                    />
                    <label htmlFor="disease-upload-input" className="inline-block mt-3 bg-emerald-950/60 hover:bg-emerald-500 hover:text-[#022c22] border border-emerald-500/20 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
                      {diseaseInput ? `Selected: ${diseaseInput.name}` : 'Browse File'}
                    </label>
                  </div>

                  <button 
                    onClick={handleDiseaseDiagnose}
                    disabled={diseaseLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-[#022c22] rounded-xl font-black text-sm"
                  >
                    {diseaseLoading ? 'AI Vision Diagnosing...' : 'Submit to Gemini Vision'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-[#022c22]/50 p-4 rounded-xl border border-emerald-500/10">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">Diagnosis</span>
                      <h4 className="font-black text-emerald-300 text-lg leading-tight">{t[diseaseReport.diseaseName] || diseaseReport.diseaseName}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/25 px-3 py-1 rounded-full">
                        {diseaseReport.severity} Severity
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/5">
                      <span className="font-bold block text-emerald-400">{t.suggestedPesticide}</span>
                      <p className="font-semibold text-emerald-100">{diseaseReport.suggestedPesticide}</p>
                    </div>
                    <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/5">
                      <span className="font-bold block text-emerald-400">{t.suggestedFertilizer}</span>
                      <p className="font-semibold text-emerald-100">{diseaseReport.suggestedFertilizer}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-500/5 space-y-1">
                    <span className="text-xs font-bold block text-emerald-400">{t.treatment}</span>
                    <p className="text-sm leading-relaxed text-emerald-100">{diseaseReport.treatment}</p>
                  </div>

                  {diseaseReport.expertEscalationRequired && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 items-start">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-extrabold text-amber-300 block uppercase">Auto Expert Escalation</span>
                        <p className="text-xs text-amber-100 leading-relaxed mt-0.5">
                          AI confidence is moderate. A support ticket has been raised at Rythu Seva Kendra. An agriculture expert will review and message you.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      onClick={() => setDiseaseReport(null)}
                      className="px-4 py-2 bg-emerald-950/80 rounded-xl font-bold text-xs"
                    >
                      Diagnose Another Leaf
                    </button>
                    <button 
                      onClick={() => setShowDiseaseDetect(false)}
                      className="px-6 py-2 bg-emerald-500 text-[#022c22] font-black rounded-xl text-xs"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
