'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../../store/useStore';
import { translations } from '../../../utils/translations';
import { 
  Sprout, CloudRain, ShieldAlert, Mic, Thermometer, Droplets, Wind, 
  Settings, LogOut, Compass, Plus, Landmark, CheckCircle, AlertTriangle, Globe, Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../../../utils/api';

export default function FarmerDashboard() {
  const router = useRouter();
  const { user, token, currentLanguage, setLanguage, logout } = useStore();
  const t = translations[currentLanguage] || translations.en;

  const [farms, setFarms] = useState<any[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);

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

  const [soilUploadMode, setSoilUploadMode] = useState<'image' | 'manual'>('image');
  const [soilReportImage, setSoilReportImage] = useState<File | null>(null);
  const [soilReportImageLoading, setSoilReportImageLoading] = useState(false);

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
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('kisan_farms');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.length > 0) {
            setFarms(parsed);
            setSelectedFarm(parsed[0]);
          }
        } catch (e) {}
      }
    }
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchFarms();
  }, [user]);

  const fetchFarms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/farms`, {
        headers: { Authorization: `Bearer ${token || 'mock-jwt-token'}` }
      });
      setFarms(response.data);
      if (response.data.length > 0) {
        setSelectedFarm(response.data[0]);
        localStorage.setItem('kisan_farms', JSON.stringify(response.data));
      }
    } catch (_) {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('kisan_farms');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.length > 0) {
              setFarms(parsed);
              setSelectedFarm(parsed[0]);
              return;
            }
          } catch (e) {}
        }
      }
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
      const weatherRes = await axios.get(`${API_BASE_URL}/api/farms/${selectedFarm.id}/weather`, {
        headers: { 
          Authorization: `Bearer ${token || 'mock-jwt-token'}`,
          'x-user-language': currentLanguage
        }
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
      const response = await axios.post(`${API_BASE_URL}/api/farms`, farmForm, {
        headers: { Authorization: `Bearer ${token || 'mock-jwt-token'}` }
      });
      const updated = [...farms, response.data];
      setFarms(updated);
      setSelectedFarm(response.data);
      localStorage.setItem('kisan_farms', JSON.stringify(updated));
      setShowCreateFarm(false);
    } catch (_) {
      const mockNew = {
        id: `mock-farm-${Date.now()}`,
        ...farmForm,
        soilReports: []
      };
      const updated = [...farms, mockNew];
      setFarms(updated);
      setSelectedFarm(mockNew);
      localStorage.setItem('kisan_farms', JSON.stringify(updated));
      setShowCreateFarm(false);
    }
  };

  const handleSoilReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSoilReportImageLoading(true);
    try {
      if (soilUploadMode === 'image') {
        if (!soilReportImage) {
          alert('Please select a soil report image first');
          setSoilReportImageLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('image', soilReportImage);
        formData.append('season', soilForm.season);

        const response = await axios.post(`${API_BASE_URL}/api/farms/${selectedFarm.id}/soil-report-image`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token || 'mock-jwt-token'}`,
            'x-user-language': currentLanguage
          }
        });
        
        const updatedFarm = {
          ...selectedFarm,
          soilReports: [response.data.soilReport, ...(selectedFarm.soilReports || [])],
          cropRecommendations: [response.data.cropRec, ...(selectedFarm.cropRecommendations || [])]
        };
        const updatedFarms = farms.map(f => f.id === selectedFarm.id ? updatedFarm : f);
        setFarms(updatedFarms);
        setSelectedFarm(updatedFarm);
        localStorage.setItem('kisan_farms', JSON.stringify(updatedFarms));

        setCropRec(response.data.cropRec);
        setShowSoilReport(false);
      } else {
        const response = await axios.post(`${API_BASE_URL}/api/farms/${selectedFarm.id}/soil-report`, soilForm, {
          headers: { 
            Authorization: `Bearer ${token || 'mock-jwt-token'}`,
            'x-user-language': currentLanguage
          }
        });
        
        const updatedFarm = {
          ...selectedFarm,
          soilReports: [response.data.soilReport, ...(selectedFarm.soilReports || [])],
          cropRecommendations: [response.data.cropRec, ...(selectedFarm.cropRecommendations || [])]
        };
        const updatedFarms = farms.map(f => f.id === selectedFarm.id ? updatedFarm : f);
        setFarms(updatedFarms);
        setSelectedFarm(updatedFarm);
        localStorage.setItem('kisan_farms', JSON.stringify(updatedFarms));

        setCropRec(response.data.cropRec);
        setShowSoilReport(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit soil report: " + (err.response?.data?.error || err.message));
    } finally {
      setSoilReportImageLoading(false);
    }
  };

  const handleDetectLocation = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(4));
          const lng = parseFloat(position.coords.longitude.toFixed(4));
          setFarmForm(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            location: `Detected Farm (Lat: ${lat}, Lng: ${lng})`
          }));
        },
        () => {
          setFarmForm(prev => ({
            ...prev,
            latitude: 16.3060,
            longitude: 80.4360,
            location: "Guntur (Lat: 16.3060, Lng: 80.4360)"
          }));
        }
      );
    }
  };


  const [isListening, setIsListening] = useState(false);

  const handleVoiceQuery = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type your query.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'te' ? 'te-IN' : currentLanguage === 'mr' ? 'mr-IN' : currentLanguage === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceQuery("Listening... Speak now...");
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
      setVoiceQuery("");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setVoiceQuery(speechToText);
      submitVoiceQuery(speechToText);
    };

    recognition.start();
  };

  const submitVoiceQuery = async (queryText: string) => {
    if (!queryText) return;
    setVoiceLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/voice/query`, {
        farmId: selectedFarm.id,
        transcription: queryText,
        language: currentLanguage
      }, {
        headers: { Authorization: `Bearer mock-jwt-token` }
      });
      setVoiceAnswer(response.data.aiResponseText);
    } catch (_) {
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
    if (!diseaseInput) {
      alert("Please select a crop leaf image first");
      return;
    }
    setDiseaseLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', diseaseInput);
      formData.append('farmId', selectedFarm.id);

      const response = await axios.post(`${API_BASE_URL}/api/diseases/detect`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token || 'mock-jwt-token'}`,
          'x-user-language': currentLanguage
        }
      });
      
      setDiseaseReport(response.data.report);
      
      const updatedFarm = {
        ...selectedFarm,
        diseaseReports: [response.data.report, ...(selectedFarm.diseaseReports || [])]
      };
      const updatedFarms = farms.map(f => f.id === selectedFarm.id ? updatedFarm : f);
      setFarms(updatedFarms);
      setSelectedFarm(updatedFarm);
      localStorage.setItem('kisan_farms', JSON.stringify(updatedFarms));

      alert("AI Disease detection completed successfully! " + (response.data.ticketEscalated ? "Low confidence case escalated to Rythu Seva Kendra." : "Handled completely by AI."));
    } catch (error) {
      console.error("Failed to run disease diagnosis:", error);
      alert("Failed to analyze crop leaf disease: " + (error.response?.data?.error || error.message));
    } finally {
      setDiseaseLoading(false);
    }
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
                  <option value="gu" className="bg-[#022c22]">ગુજરાતી</option>
                  <option value="kn" className="bg-[#022c22]">ಕನ್ನಡ</option>
                  <option value="ml" className="bg-[#022c22]">മലയാളം</option>
                  <option value="pa" className="bg-[#022c22]">ਪੰਜਾਬੀ</option>
                  <option value="bn" className="bg-[#022c22]">বাংলা</option>
                  <option value="or" className="bg-[#022c22]">ଓଡ଼ିଆ</option>
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

            <button 
              onClick={() => router.push('/dashboard/farmer/sell-my-crop')}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-[#022c22] rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25"
            >
              <Coins className="w-4 h-4" />
              {t.sellMyCrop || "Sell My Crop"}
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

        {/* Daily 6:00 AM Sowing Briefing & Advisory */}
        <div className="bg-gradient-to-r from-emerald-900/60 to-teal-900/40 backdrop-blur-xl p-6 rounded-3xl border border-emerald-500/20 shadow-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm flex items-center gap-2 text-emerald-300">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              ☀️ {t.sowingBriefingTitle || "Daily 6:00 AM Sowing Briefing & Advisory"}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSmsEnabled(!smsEnabled)}
                className={`text-[10px] uppercase font-black px-3 py-1.5 rounded-full border transition-all ${
                  smsEnabled 
                    ? 'bg-emerald-500 text-[#022c22] border-emerald-400 font-black' 
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/20 hover:bg-emerald-900'
                }`}
              >
                {smsEnabled ? (t.smsAlertsEnabled || "✅ SMS Alerts Enabled") : (t.enableSmsAlerts || "📱 Enable SMS Alerts")}
              </button>
              <span className="text-[10px] uppercase font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                {t.sixAmUpdate || "6:00 AM UPDATE"}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-950/60 rounded-2xl border border-emerald-500/10">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t.morningForecastSummary || "Morning Forecast Summary"}</span>
              <p className="text-xs text-emerald-100 font-semibold mt-1">
                {t.morningForecastText
                  ? t.morningForecastText
                      .replace('{temp}', (weatherAlert?.temperature ?? '31').toString())
                      .replace('{humidity}', (weatherAlert?.humidity ?? '75').toString())
                  : `Temperature is rising to ${weatherAlert?.temperature ?? '31'}°C with ${weatherAlert?.humidity ?? '75'}% humidity. Sowing operations are highly recommended in the morning hours before wind speeds pick up.`}
              </p>
            </div>
            <div className="p-4 bg-emerald-950/60 rounded-2xl border border-emerald-500/10">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t.aiSowingTip || "AI Sowing & Irrigation Tip"}</span>
              <p className="text-xs text-emerald-100 font-semibold mt-1">
                {weatherAlert?.advisory || 'Keep soil moisture levels steady. Crop vegetative phase requires consistent moisture monitoring.'}
              </p>
            </div>
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
                <span className="text-[10px] font-bold text-emerald-300/70 mt-1.5">{t.Temperature || "Temperature"}</span>
                <p className="font-black text-xl text-white mt-0.5">{weatherAlert?.temperature ?? '31'}°C</p>
              </div>
              <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/5 flex flex-col items-center">
                <Droplets className="w-6 h-6 text-sky-400" />
                <span className="text-[10px] font-bold text-emerald-300/70 mt-1.5">{t.Humidity || "Humidity"}</span>
                <p className="font-black text-xl text-white mt-0.5">{weatherAlert?.humidity ?? '75'}%</p>
              </div>
              <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/5 flex flex-col items-center">
                <CloudRain className="w-6 h-6 text-indigo-400" />
                <span className="text-[10px] font-bold text-emerald-300/70 mt-1.5">{t.Rainfall || "Rainfall"}</span>
                <p className="font-black text-xl text-white mt-0.5">{weatherAlert?.rainfall ?? '0'} mm</p>
              </div>
              <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/5 flex flex-col items-center">
                <Wind className="w-6 h-6 text-teal-400" />
                <span className="text-[10px] font-bold text-emerald-300/70 mt-1.5">{t["Wind Speed"] || "Wind Speed"}</span>
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
            <div className="flex justify-between items-center w-full">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-400" />
                {t.recommendation}
              </h3>
              <button 
                onClick={() => setShowSoilReport(true)}
                className="bg-emerald-500/10 hover:bg-emerald-500 hover:text-[#022c22] border border-emerald-500/20 px-4 py-1.5 rounded-xl text-xs font-black transition-all"
              >
                {t.uploadSoil || "Upload Soil Health Card"}
              </button>
            </div>

            {(() => {
              const activeCropRec = cropRec || {
                recommendedCrop: t.mockRecommendedCrop || "Wheat",
                confidenceScore: 0.92,
                expectedYield: t.mockExpectedYield || "20-22 Quintals",
                waterRequirement: t.mockWaterRequirement || "Medium",
                riskLevel: t.mockRiskLevel || "Low",
                reasoning: t.mockReasoning || "The soil profile indicates ideal pH and organic carbon content. A cool season ensures wheat will thrive. Light watering and standard DAP are recommended."
              };
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                  <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <span className="text-xs uppercase text-emerald-400 font-extrabold">{t.recommendation || "Recommended Crop"}</span>
                    <p className="text-2xl font-black text-white mt-1">{t[activeCropRec.recommendedCrop] || activeCropRec.recommendedCrop}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-emerald-300">{t.confidence || "Confidence"}:</span>
                      <span className="text-[10px] font-bold bg-emerald-500/25 px-2.5 py-0.5 rounded-full border border-emerald-500/30">{Math.round(activeCropRec.confidenceScore * 100)}%</span>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-950/40 rounded-2xl border border-emerald-500/5">
                    <span className="text-xs uppercase text-emerald-300/70 font-extrabold">{t.expectedYield || "Expected Yield"} / {t.Acre || "Acre"}</span>
                    <p className="text-lg font-black mt-1 text-white">{t[activeCropRec.expectedYield] || activeCropRec.expectedYield}</p>
                  </div>

                  <div className="p-4 bg-emerald-950/40 rounded-2xl border border-emerald-500/5">
                    <span className="text-xs uppercase text-emerald-300/70 font-extrabold">{t.waterRequirement || "Water Requirement"}</span>
                    <p className="text-lg font-black mt-1 text-white">{t[activeCropRec.waterRequirement] || activeCropRec.waterRequirement}</p>
                  </div>

                  <div className="p-4 bg-emerald-950/40 rounded-2xl border border-emerald-500/5">
                    <span className="text-xs uppercase text-emerald-300/70 font-extrabold">{t.riskLevel || "Risk Level"}</span>
                    <p className={`text-lg font-black mt-1 ${activeCropRec.riskLevel.toLowerCase() === 'high' ? 'text-rose-400' : 'text-emerald-400'}`}>{t[activeCropRec.riskLevel] || activeCropRec.riskLevel}</p>
                  </div>

                  <div className="col-span-1 md:col-span-2 lg:col-span-4 p-4 bg-emerald-950/50 border border-emerald-500/10 rounded-2xl">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">{t.aiRecommendation || "AI Recommendation"}</span>
                    <p className="text-sm text-emerald-100 mt-1.5 leading-relaxed font-semibold">{t[activeCropRec.reasoning] || activeCropRec.reasoning}</p>
                  </div>
                </div>
              );
            })()}
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
              <div className="flex justify-between items-center pb-2">
                <h3 className="font-extrabold text-xl">{t.createFarm}</h3>
                <button type="button" onClick={() => setShowCreateFarm(false)} className="text-emerald-300 hover:text-white transition-all text-xl font-bold">&times;</button>
              </div>
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
                  <div className="flex justify-between items-center">
                    <label className="text-xs uppercase font-bold text-emerald-300">Location</label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      className="text-[10px] font-black bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-lg"
                    >
                      📍 Detect Location
                    </button>
                  </div>
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
              <div className="flex justify-between items-center pb-2">
                <h3 className="font-extrabold text-xl">{t.uploadSoil}</h3>
                <button type="button" onClick={() => setShowSoilReport(false)} className="text-emerald-300 hover:text-white transition-all text-xl font-bold">&times;</button>
              </div>
              
              {/* Tab Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-emerald-950/60 rounded-xl border border-emerald-500/10">
                <button
                  type="button"
                  onClick={() => setSoilUploadMode('image')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${soilUploadMode === 'image' ? 'bg-emerald-500 text-[#022c22]' : 'text-emerald-300'}`}
                >
                  📄 Upload Report Image
                </button>
                <button
                  type="button"
                  onClick={() => setSoilUploadMode('manual')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${soilUploadMode === 'manual' ? 'bg-emerald-500 text-[#022c22]' : 'text-emerald-300'}`}
                >
                  ✏️ Manual Entry
                </button>
              </div>

              <form onSubmit={handleSoilReport} className="space-y-3">
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

                {soilUploadMode === 'image' ? (
                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-emerald-500/20 rounded-2xl p-6 text-center space-y-2 hover:border-emerald-400/50 transition-all cursor-pointer">
                      <CloudRain className="w-8 h-8 mx-auto text-emerald-400" />
                      <p className="font-bold text-sm">Upload Soil Health Card Photo</p>
                      <p className="text-xs text-emerald-300/70">AI will automatically read pH, Nitrogen, Phosphorus, Potassium</p>
                      <input 
                        type="file" 
                        required={soilUploadMode === 'image'}
                        onChange={(e) => setSoilReportImage(e.target.files?.[0] || null)}
                        className="hidden" 
                        id="soil-report-image-input"
                      />
                      <label htmlFor="soil-report-image-input" className="inline-block mt-2 bg-emerald-950/60 hover:bg-emerald-500 hover:text-[#022c22] border border-emerald-500/20 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
                        {soilReportImage ? `Selected: ${soilReportImage.name}` : 'Browse File'}
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs uppercase font-bold text-emerald-300">{t.ph}</label>
                        <input
                          type="number"
                          step="0.1"
                          required={soilUploadMode === 'manual'}
                          value={soilForm.ph}
                          onChange={(e) => setSoilForm({ ...soilForm, ph: parseFloat(e.target.value) })}
                          className="w-full p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/10 outline-none text-sm text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs uppercase font-bold text-emerald-300">{t.organicCarbon}</label>
                        <input
                          type="number"
                          step="0.01"
                          required={soilUploadMode === 'manual'}
                          value={soilForm.organicCarbon}
                          onChange={(e) => setSoilForm({ ...soilForm, organicCarbon: parseFloat(e.target.value) })}
                          className="w-full p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/10 outline-none text-sm text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs uppercase font-bold text-emerald-300">{t.nitrogen}</label>
                        <input
                          type="number"
                          required={soilUploadMode === 'manual'}
                          value={soilForm.nitrogen}
                          onChange={(e) => setSoilForm({ ...soilForm, nitrogen: parseFloat(e.target.value) })}
                          className="w-full p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/10 outline-none text-sm text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs uppercase font-bold text-emerald-300">{t.phosphorus}</label>
                        <input
                          type="number"
                          required={soilUploadMode === 'manual'}
                          value={soilForm.phosphorus}
                          onChange={(e) => setSoilForm({ ...soilForm, phosphorus: parseFloat(e.target.value) })}
                          className="w-full p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/10 outline-none text-sm text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs uppercase font-bold text-emerald-300">{t.potassium}</label>
                        <input
                          type="number"
                          required={soilUploadMode === 'manual'}
                          value={soilForm.potassium}
                          onChange={(e) => setSoilForm({ ...soilForm, potassium: parseFloat(e.target.value) })}
                          className="w-full p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/10 outline-none text-sm text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

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
                    disabled={soilReportImageLoading}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 text-[#022c22] font-black text-xs"
                  >
                    {soilReportImageLoading ? 'Processing...' : 'Get Recommendation'}
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
              <div className="flex justify-between items-center pb-2">
                <h3 className="font-extrabold text-xl">{t.diseaseDetection}</h3>
                <button type="button" onClick={() => setShowDiseaseDetect(false)} className="text-emerald-300 hover:text-white transition-all text-xl font-bold">&times;</button>
              </div>
              
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
