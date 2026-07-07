'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../../store/useStore';
import { translations } from '../../../utils/translations';
import { 
  Sprout, CloudRain, ShieldAlert, Mic, Thermometer, Droplets, Wind, 
  Settings, LogOut, Compass, Plus, Landmark, CheckCircle, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function FarmerDashboard() {
  const router = useRouter();
  const { user, currentLanguage, logout } = useStore();
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
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-850 dark:text-stone-100 flex flex-col md:flex-row pb-12 md:pb-0">
      
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 glass-panel border-r border-stone-200/50 dark:border-stone-800/50 p-6 flex flex-col justify-between">
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 dark:bg-emerald-500 text-white p-2 rounded-xl">
              <Sprout className="w-5 h-5" />
            </div>
            <h1 className="font-extrabold text-lg tracking-tight text-emerald-700 dark:text-emerald-400">{t.appName}</h1>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400">Active Farm</label>
              <div className="relative mt-2">
                <select
                  value={selectedFarm?.id || ''}
                  onChange={(e) => setSelectedFarm(farms.find(f => f.id === e.target.value))}
                  className="w-full bg-white/70 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-2.5 rounded-xl outline-none font-bold text-stone-700 dark:text-stone-300 text-sm cursor-pointer"
                >
                  {farms.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              onClick={() => setShowCreateFarm(true)}
              className="w-full py-2.5 bg-stone-200 hover:bg-stone-300 dark:bg-stone-900 dark:hover:bg-stone-850 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              {t.createFarm}
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200/40 dark:border-stone-800/40">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-400">
              {user?.name?.[0] || 'F'}
            </div>
            <div>
              <p className="font-bold text-sm leading-none">{user?.name || 'Farmer'}</p>
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Farmer account</span>
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

      {/* Main content grid */}
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl mx-auto overflow-y-auto">
        <div className="flex justify-between items-center pb-4 border-b border-stone-200/30 dark:border-stone-800/30">
          <div>
            <h2 className="text-3xl font-black">{t.farmerDashboard}</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">Manage, monitor, and diagnose your farm operations</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowSoilReport(true)}
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
            >
              {t.uploadSoil}
            </button>
            <button 
              onClick={() => setShowDiseaseDetect(true)}
              className="bg-stone-900 hover:bg-stone-850 dark:bg-stone-900 dark:hover:bg-stone-800 border border-stone-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all"
            >
              {t.diseaseDetection}
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Weather Advisory Card */}
          <div className="glass-panel p-6 rounded-2xl border border-stone-200/50 dark:border-stone-800/50 shadow-xl space-y-4 lg:col-span-2">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-emerald-500" />
                {t.advisory}
              </h3>
              <span className="text-xs bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full font-bold">
                Live Open-Meteo Advisory
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-white/50 dark:bg-stone-900 p-3 rounded-xl border border-stone-200/25 dark:border-stone-800/25 flex flex-col items-center">
                <Thermometer className="w-5 h-5 text-red-500" />
                <span className="text-xs text-stone-500 mt-1">Temperature</span>
                <p className="font-black text-lg">{weatherAlert?.temperature ?? '28'}°C</p>
              </div>
              <div className="bg-white/50 dark:bg-stone-900 p-3 rounded-xl border border-stone-200/25 dark:border-stone-800/25 flex flex-col items-center">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span className="text-xs text-stone-500 mt-1">Humidity</span>
                <p className="font-black text-lg">{weatherAlert?.humidity ?? '72'}%</p>
              </div>
              <div className="bg-white/50 dark:bg-stone-900 p-3 rounded-xl border border-stone-200/25 dark:border-stone-800/25 flex flex-col items-center">
                <CloudRain className="w-5 h-5 text-indigo-500" />
                <span className="text-xs text-stone-500 mt-1">Rainfall</span>
                <p className="font-black text-lg">{weatherAlert?.rainfall ?? '0'} mm</p>
              </div>
              <div className="bg-white/50 dark:bg-stone-900 p-3 rounded-xl border border-stone-200/25 dark:border-stone-800/25 flex flex-col items-center">
                <Wind className="w-5 h-5 text-teal-500" />
                <span className="text-xs text-stone-500 mt-1">Wind Speed</span>
                <p className="font-black text-lg">{weatherAlert?.windSpeed ?? '12'} km/h</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/25 rounded-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">AI Agronomist Note</span>
              <p className="text-sm text-emerald-800 dark:text-emerald-300 mt-1 leading-relaxed">{weatherAlert?.advisory}</p>
            </div>
          </div>

          {/* Multilingual Voice Assistant Panel */}
          <div className="glass-panel p-6 rounded-2xl border border-stone-200/50 dark:border-stone-800/50 shadow-xl flex flex-col justify-between space-y-4">
            <div>
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Mic className="w-5 h-5 text-emerald-500" />
                {t.voiceAssistant}
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">Ask the assistant about soil fertility, seed sowing, or pesticide application.</p>
            </div>

            <div className="space-y-3">
              <textarea
                value={voiceQuery}
                onChange={(e) => setVoiceQuery(e.target.value)}
                placeholder="Type your question or simulate speech here... (e.g. My cotton leaves are turning yellow)"
                className="w-full p-3 rounded-xl bg-white/70 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 outline-none text-sm font-medium h-24"
              />
              <button 
                onClick={handleVoiceQuery}
                disabled={voiceLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              >
                <Mic className="w-4 h-4 animate-pulse" />
                {voiceLoading ? 'AI Reasoning...' : t.speak}
              </button>
            </div>

            {voiceAnswer && (
              <div className="p-3 bg-stone-100 dark:bg-stone-900 rounded-xl text-xs font-bold space-y-1">
                <span className="text-emerald-700 dark:text-emerald-400 uppercase tracking-widest text-[10px]">AI response ({currentLanguage})</span>
                <p className="font-semibold">{voiceAnswer}</p>
              </div>
            )}
          </div>

          {/* Soil Health Card & Recommendations */}
          <div className="glass-panel p-6 rounded-2xl border border-stone-200/50 dark:border-stone-800/50 shadow-xl lg:col-span-3 space-y-4">
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-500" />
              {t.recommendation}
            </h3>

            {cropRec ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-500/20">
                  <span className="text-xs uppercase text-emerald-700 dark:text-emerald-400 font-extrabold">Recommended Crop</span>
                  <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{cropRec.recommendedCrop}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="text-xs text-stone-500">Confidence score:</span>
                    <span className="text-xs font-bold bg-emerald-200 dark:bg-emerald-900 px-2 py-0.5 rounded-full">{Math.round(cropRec.confidenceScore * 100)}%</span>
                  </div>
                </div>

                <div className="p-4 bg-stone-100 dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800">
                  <span className="text-xs uppercase text-stone-500 font-extrabold">Expected Yield / Acre</span>
                  <p className="text-lg font-black mt-1">{cropRec.expectedYield}</p>
                </div>

                <div className="p-4 bg-stone-100 dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800">
                  <span className="text-xs uppercase text-stone-500 font-extrabold">Water Requirement</span>
                  <p className="text-lg font-black mt-1">{cropRec.waterRequirement}</p>
                </div>

                <div className="p-4 bg-stone-100 dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-stone-800">
                  <span className="text-xs uppercase text-stone-500 font-extrabold">Risk Level</span>
                  <p className={`text-lg font-black mt-1 ${cropRec.riskLevel.toLowerCase() === 'high' ? 'text-red-500' : 'text-emerald-500'}`}>{cropRec.riskLevel}</p>
                </div>

                <div className="col-span-1 md:col-span-2 lg:col-span-4 p-4 bg-white/70 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 rounded-xl">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">AI Agronomist Sowing Reason</span>
                  <p className="text-sm text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">{cropRec.reasoning}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <p className="text-stone-500 dark:text-stone-400 font-semibold">No crop recommendations yet. Upload your soil report parameters (N, P, K, pH) to trigger AI recommendation.</p>
                <button 
                  onClick={() => setShowSoilReport(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl"
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
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-3xl p-6 w-full max-w-md space-y-4 border border-stone-200 dark:border-stone-800"
            >
              <h3 className="font-extrabold text-xl">{t.createFarm}</h3>
              <form onSubmit={handleCreateFarm} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-stone-500 dark:text-stone-400">Farm Name</label>
                  <input
                    type="text"
                    required
                    value={farmForm.name}
                    onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-stone-500 dark:text-stone-400">Location</label>
                  <input
                    type="text"
                    required
                    value={farmForm.location}
                    onChange={(e) => setFarmForm({ ...farmForm, location: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-stone-500 dark:text-stone-400">Size (Acres)</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={farmForm.size}
                      onChange={(e) => setFarmForm({ ...farmForm, size: parseFloat(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-stone-500 dark:text-stone-400">Soil Type</label>
                    <input
                      type="text"
                      required
                      value={farmForm.soilType}
                      onChange={(e) => setFarmForm({ ...farmForm, soilType: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowCreateFarm(false)}
                    className="px-4 py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
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
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-3xl p-6 w-full max-w-lg space-y-4 border border-stone-200 dark:border-stone-800"
            >
              <h3 className="font-extrabold text-xl">{t.uploadSoil}</h3>
              <form onSubmit={handleSoilReport} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-stone-500 dark:text-stone-400">pH Level</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={soilForm.ph}
                      onChange={(e) => setSoilForm({ ...soilForm, ph: parseFloat(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-stone-500 dark:text-stone-400">Sowing Season</label>
                    <select
                      value={soilForm.season}
                      onChange={(e) => setSoilForm({ ...soilForm, season: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-sm"
                    >
                      <option value="Kharif">Kharif (Monsoon)</option>
                      <option value="Rabi">Rabi (Winter)</option>
                      <option value="Zaid">Zaid (Summer)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-stone-500 dark:text-stone-400">Nitrogen (N)</label>
                    <input
                      type="number"
                      required
                      value={soilForm.nitrogen}
                      onChange={(e) => setSoilForm({ ...soilForm, nitrogen: parseFloat(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-stone-500 dark:text-stone-400">Phosphorus (P)</label>
                    <input
                      type="number"
                      required
                      value={soilForm.phosphorus}
                      onChange={(e) => setSoilForm({ ...soilForm, phosphorus: parseFloat(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-bold text-stone-500 dark:text-stone-400">Potassium (K)</label>
                    <input
                      type="number"
                      required
                      value={soilForm.potassium}
                      onChange={(e) => setSoilForm({ ...soilForm, potassium: parseFloat(e.target.value) })}
                      className="w-full p-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-stone-500 dark:text-stone-400">Organic Carbon (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={soilForm.organicCarbon}
                    onChange={(e) => setSoilForm({ ...soilForm, organicCarbon: parseFloat(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-stone-100 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 outline-none text-sm"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowSoilReport(false)}
                    className="px-4 py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
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
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-stone-900 rounded-3xl p-6 w-full max-w-lg space-y-4 border border-stone-200 dark:border-stone-800 max-h-[85vh] overflow-y-auto"
            >
              <h3 className="font-extrabold text-xl">{t.diseaseDetection}</h3>
              
              {!diseaseReport ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-stone-300 dark:border-stone-800 rounded-2xl p-8 text-center space-y-2 cursor-pointer hover:border-emerald-500/50 transition-all">
                    <CloudRain className="w-8 h-8 mx-auto text-stone-400" />
                    <p className="font-bold text-sm">Upload crop leaf photo</p>
                    <p className="text-xs text-stone-500">Supports JPG, PNG up to 10MB</p>
                    <input 
                      type="file" 
                      onChange={(e) => setDiseaseInput(e.target.files?.[0] || null)}
                      className="hidden" 
                      id="disease-upload-input"
                    />
                    <label htmlFor="disease-upload-input" className="inline-block mt-3 bg-stone-200 dark:bg-stone-800 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">
                      {diseaseInput ? `Selected: ${diseaseInput.name}` : 'Browse File'}
                    </label>
                  </div>

                  <button 
                    onClick={handleDiseaseDiagnose}
                    disabled={diseaseLoading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm"
                  >
                    {diseaseLoading ? 'AI Vision Diagnosing...' : 'Submit to Gemini Vision'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-stone-100 dark:bg-stone-950 p-4 rounded-xl border border-stone-200/50">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Diagnosis</span>
                      <h4 className="font-black text-emerald-700 dark:text-emerald-400 text-lg leading-tight">{diseaseReport.diseaseName}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full">
                        {diseaseReport.severity} Severity
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-stone-100 dark:bg-stone-900 rounded-xl">
                      <span className="font-bold block text-stone-500">Suggested Pesticide</span>
                      <p className="font-semibold text-stone-700 dark:text-stone-300">{diseaseReport.suggestedPesticide}</p>
                    </div>
                    <div className="p-3 bg-stone-100 dark:bg-stone-900 rounded-xl">
                      <span className="font-bold block text-stone-500">Suggested Fertilizer</span>
                      <p className="font-semibold text-stone-700 dark:text-stone-300">{diseaseReport.suggestedFertilizer}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-stone-100 dark:bg-stone-900 rounded-xl space-y-1">
                    <span className="text-xs font-bold block text-stone-500">Organic and Chemical Treatment</span>
                    <p className="text-sm leading-relaxed">{diseaseReport.treatment}</p>
                  </div>

                  {diseaseReport.expertEscalationRequired && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-500/20 rounded-xl flex gap-3 items-start">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400 block uppercase">Auto Expert Escalation</span>
                        <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed mt-0.5">
                          AI confidence is moderate. A support ticket has been raised at Rythu Seva Kendra. An agriculture expert will review and message you.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      onClick={() => setDiseaseReport(null)}
                      className="px-4 py-2 bg-stone-200 dark:bg-stone-800 rounded-xl font-bold text-xs"
                    >
                      Diagnose Another Leaf
                    </button>
                    <button 
                      onClick={() => setShowDiseaseDetect(false)}
                      className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs"
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
