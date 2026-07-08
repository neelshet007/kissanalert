'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '../store/useStore';
import { translations } from '../utils/translations';
import { Sprout, Phone, Cpu, CloudRain, Star, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { currentLanguage, setLanguage } = useStore();
  const t = translations[currentLanguage] || translations.en;

  const features = [
    {
      icon: <Sprout className="w-8 h-8 text-emerald-400" />,
      title: t.cropRecFeatureTitle,
      desc: t.cropRecFeatureDesc
    },
    {
      icon: <CloudRain className="w-8 h-8 text-sky-400" />,
      title: t.weatherFeatureTitle,
      desc: t.weatherFeatureDesc
    },
    {
      icon: <Cpu className="w-8 h-8 text-purple-400" />,
      title: t.diseaseFeatureTitle,
      desc: t.diseaseFeatureDesc
    },
    {
      icon: <Phone className="w-8 h-8 text-indigo-400" />,
      title: t.voiceFeatureTitle,
      desc: t.voiceFeatureDesc
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-[#022c22] via-[#064e3b] to-[#042f2e] text-stone-100 transition-colors duration-300">
      
      {/* Dynamic Animated Background Highlights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full filter blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#064e3b]/50 backdrop-blur-xl border-b border-emerald-500/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-white p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-emerald-300">{t.appName}</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-400/70">{t.tagline}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-emerald-950/65 px-3 py-2 rounded-xl text-sm border border-emerald-500/20">
            <Globe className="w-4 h-4 text-emerald-400" />
            <select
              value={currentLanguage}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-emerald-200 cursor-pointer focus:ring-0"
            >
              <option value="en" className="bg-[#022c22] text-stone-200">English</option>
              <option value="hi" className="bg-[#022c22] text-stone-200">हिन्दी</option>
              <option value="te" className="bg-[#022c22] text-stone-200">తెలుగు</option>
              <option value="mr" className="bg-[#022c22] text-stone-200">मराठी</option>
              <option value="ta" className="bg-[#022c22] text-stone-200">தமிழ்</option>
              <option value="gu" className="bg-[#022c22] text-stone-200">ગુજરાતી</option>
              <option value="kn" className="bg-[#022c22] text-stone-200">ಕನ್ನಡ</option>
              <option value="ml" className="bg-[#022c22] text-stone-200">മലയാളം</option>
              <option value="pa" className="bg-[#022c22] text-stone-200">ਪੰਜਾਬੀ</option>
              <option value="bn" className="bg-[#022c22] text-stone-200">বাংলা</option>
              <option value="or" className="bg-[#022c22] text-stone-200">ଓଡ଼ିଆ</option>
            </select>
          </div>
          <Link href="/auth/login" className="bg-emerald-500 hover:bg-emerald-600 text-[#022c22] font-black px-6 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/10">
            {t.login}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Prototype Banner */}
        <div className="lg:col-span-2 bg-[#022c22]/60 border border-emerald-500/20 text-emerald-300 text-xs px-6 py-3 rounded-2xl flex items-center justify-between gap-4 font-semibold shadow-inner">
          <p>💡 <strong>Developer Note:</strong> This is a prototype demonstration platform. It includes mock agronomist data, local offline databases, and sandbox API profiles. No real financial or agricultural crop transactions are performed.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-950/80 px-4 py-1.5 rounded-full border border-emerald-500/20 text-emerald-300 text-xs font-black">
            <Star className="w-4 h-4 fill-emerald-400 text-emerald-400" />
            {t.heroTag}
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.05] text-white">
            {t.heroTitle.split(' ').slice(0, -2).join(' ')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400">
              {t.heroTitle.split(' ').slice(-2).join(' ')}
            </span>
          </h2>
          <p className="text-lg text-emerald-100/70 max-w-lg leading-relaxed font-medium">
            {t.heroSubtitle}
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/auth/login" className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-[#022c22] font-extrabold px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/10 transition-all transform hover:-translate-y-0.5">
              {t.getStarted}
            </Link>
            <a href="#features" className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-200 font-extrabold px-6 py-4 rounded-2xl transition-all hover:bg-emerald-950/70">
              {t.exploreFeatures}
            </a>
          </div>
        </motion.div>

        {/* Live Glass Monitor Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative bg-emerald-950/30 backdrop-blur-xl rounded-3xl p-8 border border-emerald-500/10 shadow-2xl overflow-hidden min-h-[380px] flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full filter blur-3xl" />
          <div className="relative space-y-4">
            <div className="flex justify-between items-center border-b border-emerald-500/10 pb-4">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">{t.liveMonitor}</span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-extrabold">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                {t.active}
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/10">
                <p className="text-xs text-emerald-400/70 font-bold">{t.recentRecommendation}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-extrabold text-white text-lg">Paddy (Rice)</span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-black border border-emerald-500/30">94%</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/10">
                <p className="text-xs text-emerald-400/70 font-bold">{t.activeSoilCondition}</p>
                <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs">
                  <div className="bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-500/10"><span className="font-black text-emerald-400">N</span><p className="font-bold text-white mt-0.5">125 mg</p></div>
                  <div className="bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-500/10"><span className="font-black text-emerald-400">P</span><p className="font-bold text-white mt-0.5">32 mg</p></div>
                  <div className="bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-500/10"><span className="font-black text-emerald-400">K</span><p className="font-bold text-white mt-0.5">220 mg</p></div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-xs text-emerald-300/50 text-center border-t border-emerald-500/10 pt-4 font-bold">
            Supports Telugu, Hindi, Marathi, Gujarati, Kannada, & Tamil
          </div>
        </motion.div>
      </main>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-[#02211a]/40 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-lg mx-auto mb-16 space-y-3">
            <h3 className="text-3xl font-black text-white">{t.featuresTitle}</h3>
            <p className="text-emerald-100/70 font-medium">{t.featuresDesc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -6 }}
                className="bg-emerald-950/30 backdrop-blur-lg p-6 rounded-2xl border border-emerald-500/10 hover:border-emerald-400/40 transition-all space-y-4 shadow-xl"
              >
                <div className="bg-emerald-500/10 w-fit p-3 rounded-xl border border-emerald-500/20">
                  {feat.icon}
                </div>
                <h4 className="font-extrabold text-lg text-white">{feat.title}</h4>
                <p className="text-sm text-emerald-100/60 leading-relaxed font-medium">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-emerald-500/10 py-8 px-6 text-center text-xs text-emerald-400/50 font-bold relative z-10">
        &copy; {new Date().getFullYear()} Kisan Alert. All rights reserved. Built for scaling Indian Agricultural Intelligence.
      </footer>
    </div>
  );
}
