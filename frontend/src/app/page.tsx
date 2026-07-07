'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '../store/useStore';
import { translations } from '../utils/translations';
import { Sprout, Phone, Shield, Cpu, CloudRain, Star, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { currentLanguage, setLanguage } = useStore();
  const t = translations[currentLanguage] || translations.en;

  const features = [
    {
      icon: <Sprout className="w-8 h-8 text-emerald-500" />,
      title: "Smart Crop Recommendations",
      desc: "Upload your soil reports to obtain precise recommendations customized for N-P-K ratios, location, and season."
    },
    {
      icon: <CloudRain className="w-8 h-8 text-sky-500" />,
      title: "Localized Weather Advisories",
      desc: "Daily morning insights based on weather patterns, predicting optimal sowing, fertilization, and harvesting windows."
    },
    {
      icon: <Cpu className="w-8 h-8 text-purple-500" />,
      title: "AI Disease Diagnosis",
      desc: "Instantly identify leaf spots, pests, and rot by uploading crop images. Get instant organic and chemical treatments."
    },
    {
      icon: <Phone className="w-8 h-8 text-indigo-500" />,
      title: "Multilingual Voice Assistant",
      desc: "Speak naturally in local languages. Receive localized, high-fidelity voice-guided advice immediately."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-stone-50 via-emerald-50 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-emerald-950 text-stone-800 dark:text-stone-100 transition-colors duration-300">
      
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-stone-200/50 dark:border-stone-800/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-600 dark:bg-emerald-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-500/20">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-tight text-emerald-700 dark:text-emerald-400">{t.appName}</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-stone-500 dark:text-stone-400">{t.tagline}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-stone-200/60 dark:bg-stone-850 px-3 py-1.5 rounded-lg text-sm border border-stone-300/35">
            <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <select
              value={currentLanguage}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-none outline-none font-semibold text-stone-700 dark:text-stone-300 cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="te">తెలుగు</option>
              <option value="mr">मराठी</option>
              <option value="ta">தமிழ்</option>
            </select>
          </div>
          <Link href="/auth/login" className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white px-5 py-2 rounded-lg font-bold transition-all shadow-md shadow-emerald-500/10">
            {t.login}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-100/65 dark:bg-emerald-950/45 px-3 py-1 rounded-full border border-emerald-300/20 text-emerald-700 dark:text-emerald-400 text-sm font-bold">
            <Star className="w-4 h-4 fill-current" />
            Empowering Over 1 Million Sowing Journeys
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
            Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">Agricultural Intelligence</span> For Indian Farms.
          </h2>
          <p className="text-lg text-stone-600 dark:text-stone-300 max-w-lg leading-relaxed">
            Choose the right crop, schedule dynamic waterings, analyze crop diseases in seconds, and access expert advice when you need it most.
          </p>
          <div className="flex gap-4 pt-2">
            <Link href="/auth/login" className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5">
              Get Started For Free
            </Link>
            <a href="#features" className="bg-white/80 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 font-bold px-6 py-4 rounded-xl transition-all hover:bg-stone-50 dark:hover:bg-stone-850">
              Explore Features
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative glass-panel rounded-3xl p-8 border border-stone-200/50 dark:border-stone-800/50 shadow-2xl overflow-hidden min-h-[380px] flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full filter blur-3xl" />
          <div className="relative space-y-4">
            <div className="flex justify-between items-center border-b border-stone-200/40 dark:border-stone-800/40 pb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-stone-500 dark:text-stone-400">Live Platform Monitor</span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                Active
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white/70 dark:bg-stone-900/60 border border-stone-200/30 dark:border-stone-800/30">
                <p className="text-xs text-stone-500 dark:text-stone-400">Recent AI Crop Recommendation</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">Paddy (Rice)</span>
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-bold">Confidence: 94%</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/70 dark:bg-stone-900/60 border border-stone-200/30 dark:border-stone-800/30">
                <p className="text-xs text-stone-500 dark:text-stone-400">Active Soil Condition</p>
                <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs">
                  <div className="bg-stone-100 dark:bg-stone-950 p-2 rounded-lg"><span className="font-bold">N</span><p className="font-semibold text-stone-600 dark:text-stone-400">125 mg</p></div>
                  <div className="bg-stone-100 dark:bg-stone-950 p-2 rounded-lg"><span className="font-bold">P</span><p className="font-semibold text-stone-600 dark:text-stone-400">32 mg</p></div>
                  <div className="bg-stone-100 dark:bg-stone-950 p-2 rounded-lg"><span className="font-bold">K</span><p className="font-semibold text-stone-600 dark:text-stone-400">220 mg</p></div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 text-center border-t border-stone-200/40 dark:border-stone-800/40 pt-4">
            Supports Telugu, Hindi, Marathi, Gujarati, Kannada, & Tamil
          </div>
        </motion.div>
      </main>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-stone-100/60 dark:bg-stone-900/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-lg mx-auto mb-16 space-y-3">
            <h3 className="text-3xl font-bold tracking-tight">Features Tailored For Smart Farming</h3>
            <p className="text-stone-600 dark:text-stone-400">Advanced AI services engineered specifically for agriculture and local deployment.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="glass-panel p-6 rounded-2xl border border-stone-200/40 dark:border-stone-800/40 hover:border-emerald-500/40 transition-all space-y-4"
              >
                <div className="bg-emerald-50 dark:bg-emerald-950/30 w-fit p-3 rounded-xl">
                  {feat.icon}
                </div>
                <h4 className="font-bold text-lg">{feat.title}</h4>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200/50 dark:border-stone-800/50 py-8 px-6 text-center text-sm text-stone-500 dark:text-stone-400">
        &copy; {new Date().getFullYear()} Kisan Alert. All rights reserved. Built for scaling Indian Agricultural Intelligence.
      </footer>
    </div>
  );
}
