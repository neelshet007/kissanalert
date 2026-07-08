'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../../../store/useStore';
import { translations } from '../../../../utils/translations';
import { 
  ArrowLeft, Sprout, Search, MessageCircle, CheckCircle, 
  MapPin, Coins, Navigation, Leaf, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Buyers Data
const MOCK_BUYERS = [
  { id: '1', name: 'ABC Agro Traders', crops: ['Cotton', 'Soybean', 'Wheat', 'Maize'], distance: 1.5, baseMultiplier: 1.05 },
  { id: '2', name: 'Maharashtra Farmers Market', crops: ['Paddy', 'Rice', 'Wheat', 'Onion', 'Tomato'], distance: 5.2, baseMultiplier: 1.02 },
  { id: '3', name: 'Green Harvest Pvt Ltd', crops: ['Sugarcane', 'Soybean', 'Cotton', 'Groundnut', 'Mango'], distance: 8.0, baseMultiplier: 1.08 },
  { id: '4', name: 'Local Mandi', crops: ['Bajra', 'Jowar', 'Millet', 'Pulses', 'Potato', 'Onion'], distance: 12.4, baseMultiplier: 0.95 },
  { id: '5', name: 'Food Processing Company', crops: ['Tomato', 'Potato', 'Banana', 'Mango', 'Sugarcane', 'Maize'], distance: 15.1, baseMultiplier: 1.10 }
];

// Mock Base Crop Prices per Quintal (in INR)
const CROP_BASE_PRICES: Record<string, number> = {
  Paddy: 2200,
  Rice: 3500,
  Wheat: 2275,
  Soybean: 4600,
  Cotton: 7200,
  Sugarcane: 315,
  Maize: 2090,
  Bajra: 2500,
  Jowar: 3200,
  Millet: 2350,
  Pulses: 6800,
  Groundnut: 6300,
  Onion: 1800,
  Tomato: 1500,
  Potato: 1200,
  Banana: 2500,
  Mango: 5500
};

export default function SellMyCropPage() {
  const router = useRouter();
  const { currentLanguage } = useStore();
  const t = translations[currentLanguage] || translations.en;

  // Form states
  const [cropName, setCropName] = useState('Cotton');
  const [quantity, setQuantity] = useState('10');
  const [unit, setUnit] = useState('Quintal');
  const [location, setLocation] = useState('Guntur, AP');
  const [expectedPrice, setExpectedPrice] = useState('');

  // Results & AI suggestions
  const [searched, setSearched] = useState(false);
  const [matchingBuyers, setMatchingBuyers] = useState<any[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [suggestionType, setSuggestionType] = useState<'today' | 'wait' | 'nearby'>('today');

  // Interactive UI states
  const [contactedId, setContactedId] = useState<string | null>(null);
  const [interestedIds, setInterestedIds] = useState<string[]>([]);

  const handleSearchBuyers = (e: React.FormEvent) => {
    e.preventDefault();

    // Filter buyers purchasing this crop
    const buyers = MOCK_BUYERS.filter(buyer => 
      buyer.crops.map(c => c.toLowerCase()).includes(cropName.toLowerCase())
    );

    // Calculate dynamic selling prices based on buyer's multiplier and selected crop base price
    const basePrice = CROP_BASE_PRICES[cropName] || 2000;
    const computedBuyers = buyers.map(buyer => {
      const buyingPrice = Math.round(basePrice * buyer.baseMultiplier);
      return {
        ...buyer,
        buyingPrice
      };
    });

    setMatchingBuyers(computedBuyers);
    setSearched(true);

    // AI Selling Recommendation Simulation based on Expected Price or Crop Type
    const expectedNum = expectedPrice ? parseFloat(expectedPrice) : 0;
    const maxBuyingPrice = computedBuyers.length > 0 
      ? Math.max(...computedBuyers.map(b => b.buyingPrice)) 
      : basePrice;

    if (expectedNum > maxBuyingPrice * 1.1) {
      setAiSuggestion('betterPriceNearby');
      setSuggestionType('nearby');
    } else if (Math.random() > 0.5) {
      setAiSuggestion('sellToday');
      setSuggestionType('today');
    } else {
      setAiSuggestion('wait23Days');
      setSuggestionType('wait');
    }
  };

  const toggleInterest = (id: string) => {
    if (interestedIds.includes(id)) {
      setInterestedIds(interestedIds.filter(item => item !== id));
    } else {
      setInterestedIds([...interestedIds, id]);
    }
  };

  return (
    <div className="min-h-screen bg-[#022c22] text-[#f5f5f4] pb-16 font-sans relative overflow-x-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#064e3b]/50 backdrop-blur-xl border-b border-emerald-500/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/dashboard/farmer')}
            className="p-2 hover:bg-emerald-800/40 rounded-xl text-emerald-300 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-emerald-300">
              {t.sellMyCrop || "Sell My Crop"}
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-400/70">
              {t.tagline}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-500/20 text-xs font-black text-emerald-300">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          Prototype Mode
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6 relative z-10">
        
        {/* Banner */}
        <div className="bg-[#064e3b]/40 border border-emerald-500/10 p-5 rounded-3xl backdrop-blur-xl flex flex-col md:flex-row items-center gap-4">
          <div className="bg-emerald-500/20 p-3.5 rounded-2xl border border-emerald-500/30 text-emerald-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-300 text-sm">
              Demonstration Feature: Post-Harvest Sowing Cycle
            </h3>
            <p className="text-xs text-stone-300/80 leading-relaxed mt-1">
              "Sell My Crop" is a visionary concept demonstration mapping local buyers directly to harvested yields. No real payments, transactions, or order logs are handled here.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sowing/Sell crop input form */}
          <div className="md:col-span-1 bg-emerald-950/30 backdrop-blur-xl p-6 rounded-3xl border border-emerald-500/10 shadow-xl space-y-4 h-fit">
            <h3 className="font-extrabold text-base flex items-center gap-2 text-white">
              <Leaf className="w-4 h-4 text-emerald-400" />
              {t.sellCropHeader || "Sell Your Crop"}
            </h3>

            <form onSubmit={handleSearchBuyers} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-emerald-300">{t.cropName || "Crop Name"}</label>
                <select
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/15 outline-none text-xs text-white focus:ring-1 focus:ring-emerald-400"
                >
                  {Object.keys(CROP_BASE_PRICES).map(crop => (
                    <option key={crop} value={crop} className="bg-[#022c22]">
                      {t[crop] || crop}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-emerald-300">{t.quantity || "Quantity"}</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/15 outline-none text-xs text-white focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-emerald-300">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/15 outline-none text-xs text-white focus:ring-1 focus:ring-emerald-400"
                  >
                    <option value="Quintal" className="bg-[#022c22]">{t.Quintal || "Quintal"}</option>
                    <option value="Kilogram" className="bg-[#022c22]">{t.Kilogram || "Kilogram"}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-emerald-300">{t.location || "Location"}</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/15 outline-none text-xs text-white focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black text-emerald-300">
                  {t.expectedPrice || "Expected Price (Optional)"}
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#022c22]/60 border border-emerald-500/15 outline-none text-xs text-white focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-[#022c22] font-black rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:scale-[1.01]"
              >
                <Search className="w-4 h-4" />
                {t.findBuyers || "Find Buyers for My Crop"}
              </button>
            </form>
          </div>

          {/* Sowing/Sell results display */}
          <div className="md:col-span-2 space-y-4">
            <AnimatePresence mode="wait">
              {searched ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-4"
                >
                  {/* AI Recommendation Alert */}
                  <div className="bg-emerald-950/20 border border-emerald-500/15 p-5 rounded-3xl flex items-start gap-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-400 p-2.5 rounded-2xl text-[#022c22] shrink-0 font-bold">
                      AI
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">
                        {t.aiSellingSuggestion || "AI Selling Suggestion"}
                      </span>
                      <p className="text-sm font-bold text-white mt-1">
                        {aiSuggestion === 'sellToday' && (t.sellToday || "Sell Today - Prices are historically high this week.")}
                        {aiSuggestion === 'wait23Days' && (t.wait23Days || "Wait 2-3 Days - Market influx is expected to decrease, pushing prices up.")}
                        {aiSuggestion === 'betterPriceNearby' && (t.betterPriceNearby || "Better Price Available Nearby - Local Mandi or Food Processing Company are buying at high margins.")}
                      </p>
                      <p className="text-xs text-emerald-300/60 mt-1">
                        Estimated market average: ₹{(CROP_BASE_PRICES[cropName] || 2000)} / {t[unit] || unit}
                      </p>
                    </div>
                  </div>

                  {/* Buyers list */}
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-sm text-stone-300/80 uppercase tracking-wider">
                      {t.nearbyBuyers || "Nearby Buyers"} ({matchingBuyers.length})
                    </h3>

                    {matchingBuyers.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {matchingBuyers.map(buyer => {
                          const isContacted = contactedId === buyer.id;
                          const isInterested = interestedIds.includes(buyer.id);

                          return (
                            <motion.div 
                              key={buyer.id}
                              className="bg-emerald-950/40 border border-emerald-500/10 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-emerald-500/20 transition-all"
                            >
                              <div className="space-y-1">
                                <h4 className="font-black text-white text-base">{buyer.name}</h4>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-300/70">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                    {buyer.distance} km
                                  </span>
                                  <span className="flex items-center gap-1 font-bold text-emerald-300">
                                    <Coins className="w-3.5 h-3.5" />
                                    ₹{buyer.buyingPrice} / {t[unit] || unit}
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={() => {
                                    setContactedId(buyer.id);
                                    setTimeout(() => setContactedId(null), 3000);
                                  }}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                    isContacted 
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                      : 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/15 text-emerald-300'
                                  }`}
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  {isContacted ? "Calling..." : (t.contact || "Contact")}
                                </button>
                                <button
                                  onClick={() => toggleInterest(buyer.id)}
                                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                                    isInterested 
                                      ? 'bg-emerald-500 text-[#022c22]' 
                                      : 'bg-gradient-to-r from-emerald-500/20 to-teal-400/20 hover:from-emerald-500/30 hover:to-teal-400/30 border border-emerald-500/20 text-emerald-300'
                                  }`}
                                >
                                  {isInterested && <CheckCircle className="w-3.5 h-3.5" />}
                                  {isInterested ? "Interested Registered" : (t.interested || "Interested")}
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-emerald-950/20 rounded-3xl border border-emerald-500/5">
                        <p className="text-xs text-stone-300/60 font-bold">
                          {t.noBuyersAvailable || "No buyers are currently available nearby for this crop."}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-emerald-950/20 border border-dashed border-emerald-500/15 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-3"
                >
                  <Navigation className="w-8 h-8 text-emerald-400/60 animate-bounce" />
                  <h4 className="font-bold text-emerald-300/80 text-sm">Find nearby buyers instantly</h4>
                  <p className="text-xs text-stone-300/60 max-w-sm leading-relaxed">
                    Select your crop and quantity in the form, then click search to look up active buyers purchasing in your local district.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </main>
    </div>
  );
}
