/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Clock, ShieldCheck, Truck, BadgePercent, Check, Sparkles, ChevronRight } from 'lucide-react';
import { Product } from '../types';

interface HeroProps {
  products: Product[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  onAddToCart: (p: Product) => void;
  onViewDetails: (p: Product) => void;
  onApplyDiscount?: (code: string, percent: number) => void;
}

export default function Hero({
  products,
  selectedCategory,
  setSelectedCategory,
  onApplyDiscount,
}: HeroProps) {
  // Category configuration
  const categoryImages: Record<string, string> = {
    'All Products': 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=120&q=80',
    'Tech & Gadgets': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=120&q=80',
    'Lifestyle & Accessories': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=120&q=80',
    'Home & Living': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=120&q=80',
  };

  const categories = ['All Products', 'Tech & Gadgets', 'Lifestyle & Accessories', 'Home & Living'];

  // Countdown timer for scarcity-based deals
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 18, seconds: 43 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { hours: prev.hours, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 12, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic coupons & slide definitions
  const slides = [
    {
      badge: '🔥 BLITZDEALS',
      title: 'Tiefpreis-Garantie: Bis zu 80% Rabatt',
      desc: 'Werksverkauf-Direktpreise ohne Zwischenhändler. Spare jetzt mit Code BLITZ80!',
      color: 'from-orange-600 to-red-600',
      coupon: 'BLITZ80',
      percent: 80,
    },
    {
      badge: '🚚 GRATIS EXPRESS',
      title: 'Versandkostenfreie Lieferung ab 0 €',
      desc: 'Zustellung per DHL Express + 15% Zusatzrabatt mit Code FREESHIP15!',
      color: 'from-slate-900 via-slate-950 to-indigo-950',
      coupon: 'FREESHIP15',
      percent: 15,
    },
    {
      badge: '🎟️ NEUKUNDEN',
      title: 'Zusätzlich 30% Extra-Sparen',
      desc: 'Willkommensgeschenk für Neukunden. Rabattcode WELCOME30 direkt einlösen.',
      color: 'from-amber-600 to-[#ef5006]',
      coupon: 'WELCOME30',
      percent: 30,
    }
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-slide effect: Switch to the next slide automatically every 5 seconds
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, [slides.length]);

  // Keep track of applied coupons dynamically so each slide can keep track if its coupon was activated
  const [appliedCoupons, setAppliedCoupons] = useState<Record<string, boolean>>({});

  const currentCoupon = slides[activeSlide].coupon;
  const currentPercent = slides[activeSlide].percent;
  const isCurrentApplied = !!appliedCoupons[currentCoupon];

  const handleApplyCoupon = () => {
    if (onApplyDiscount) {
      onApplyDiscount(currentCoupon, currentPercent);
      setAppliedCoupons((prev) => ({ ...prev, [currentCoupon]: true }));
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. CLEAN SEGMENTED FEATURED DEALS BANNER (At the very top, less vertical space to prioritize products) */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-150 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Slide display with quick side tab segments */}
          <div className="lg:col-span-8 bg-slate-950 p-4 flex flex-col justify-center text-white relative min-h-[85px] sm:min-h-[95px] overflow-hidden">
            {/* Ambient sliding background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-r opacity-90 transition-all duration-750 ${slides[activeSlide].color}`}></div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-0.5 flex-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center bg-black/40 px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black text-white uppercase tracking-wider">
                      {slides[activeSlide].badge}
                    </span>
                    <div className="flex items-center gap-1 text-[9px] font-mono text-amber-200">
                      <Clock className="h-3.5 w-3.5 animate-pulse text-amber-305" />
                      <span>
                        Endet in: {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                      </span>
                    </div>
                  </div>
                  <h3 className="font-sans text-xs sm:text-sm font-black tracking-tight uppercase">
                    {slides[activeSlide].title}
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-white/90 font-semibold leading-tight">
                    {slides[activeSlide].desc}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Minimal Slide Segment Nav to make it interactive & clean */}
              <div className="flex gap-1 shrink-0">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      activeSlide === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/45'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Quick coupon claim action */}
          <div className="lg:col-span-4 bg-gray-50 p-4 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-gray-250 min-h-[85px] sm:min-h-[95px] relative overflow-hidden">
            {/* Visual glow indicator */}
            <div className="absolute right-0 bottom-0 h-16 w-16 bg-orange-500/5 blur-lg rounded-full pointer-events-none" />
            
            <div className="w-full space-y-1.5 relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={isCurrentApplied}
                    className={`w-full py-2 px-3 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isCurrentApplied 
                        ? 'bg-emerald-100 border border-emerald-200 text-emerald-800'
                        : 'bg-[#ef5006] text-white hover:bg-orange-700 hover:scale-[1.02] active:scale-[0.98] shadow-sm shadow-orange-500/10'
                    }`}
                  >
                    {isCurrentApplied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{currentPercent}% Rabatt Aktiv! ⚡</span>
                      </>
                    ) : (
                      <>
                        <BadgePercent className="h-3.5 w-3.5 shrink-0 animate-bounce" />
                        <span>🎟️ Coupon: {currentCoupon}</span>
                      </>
                    )}
                  </button>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-gray-500 font-bold px-1 select-none">
                <span className="flex items-center gap-0.5">✓ 100% Sicher</span>
                <span>•</span>
                <span className="flex items-center gap-0.5">✓ 90T Rückgabe</span>
                <span>•</span>
                <span className="flex items-center gap-0.5">✓ DHL Versand</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. CATEGORY SELECTION NAVIGATION (Clearly positioned directly below the banner, transitioning nicely to the products) */}
      <div id="category-selector-container" className="relative bg-white rounded-3xl p-5 shadow-sm border border-gray-100 overflow-hidden bg-gradient-to-br from-white to-orange-50/5">
        {/* Subtle decorative background spots */}
        <div className="absolute top-0 right-0 h-24 w-24 bg-orange-500/5 blur-xl rounded-full" />
        <div className="absolute -bottom-8 -left-8 h-20 w-20 bg-amber-500/5 blur-xl rounded-full" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="relative flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75 animate-ping"></span>
              <span className="relative h-2 w-2 rounded-full bg-[#ef5006]"></span>
            </div>
            <div>
              <span className="block font-sans text-xs font-black text-gray-950 uppercase tracking-wider">
                Blitzangebot-Katalog filtern
              </span>
              <span className="block text-[9px] text-gray-400 font-bold -mt-0.5">Schnelle Rabatt-Kategorien</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-550 font-bold bg-white/85 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-gray-150/70 shadow-3xs">
            <span>🚀 Live-Deals aktualisiert</span>
          </div>
        </div>

        {/* Categories Carousel scroll wrapper */}
        <div className="relative">
          {/* Subtle fade modifiers for horizontal overflow indicator */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-10 hidden sm:block" />
          
          <div className="flex items-center gap-3 overflow-x-auto py-1.5 px-0.5 scrollbar-none justify-start relative z-10">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="relative group flex items-center gap-2.5 rounded-2xl px-3.5 py-2 cursor-pointer focus:outline-none shrink-0 transition-all duration-300 select-none"
                >
                  {/* Floating glass overlay background pill using Framer Motion */}
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryBannerPill"
                      className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-md shadow-orange-500/15 -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  {!isActive && (
                    <div className="absolute inset-0 bg-gray-50/80 border border-gray-200/60 rounded-2xl group-hover:border-orange-200 group-hover:bg-orange-50/20 -z-10 transition-all duration-300" />
                  )}

                  {/* Icon Image block */}
                  <div
                    className={`relative flex h-8 w-8 items-center justify-center rounded-full overflow-hidden border p-0.5 transition-all shrink-0 ${
                      isActive
                        ? 'border-white/40 bg-white/20'
                        : 'border-gray-200 bg-white group-hover:border-orange-300'
                    }`}
                  >
                    <img
                      src={categoryImages[cat]}
                      alt={cat}
                      referrerPolicy="no-referrer"
                      className="h-full w-full rounded-full object-cover transition-transform duration-300 group-hover:scale-106"
                    />
                    {cat !== 'All Products' && (
                      <div className="absolute top-0 right-0 bg-[#ef5006] text-[6px] text-white px-0.5 rounded-bl font-extrabold">
                        %
                      </div>
                    )}
                  </div>

                  {/* Label Text block */}
                  <div className="text-left shrink-0 max-w-[120px] sm:max-w-[160px]">
                    <span
                      className={`block text-[10px] sm:text-[11px] font-black tracking-wide leading-tight transition-colors ${
                        isActive ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {cat === 'All Products' ? 'Alle Schnäppchen' : cat}
                    </span>
                    <span
                      className={`block text-[8px] font-bold uppercase tracking-wider transition-colors ${
                        isActive ? 'text-orange-100' : 'text-gray-400'
                      }`}
                    >
                      {cat === 'All Products' ? 'Blitzrabatte' : 'Direkt-Deals'}
                    </span>
                  </div>

                  {/* Micro-indicator pulse or arrow only on active category */}
                  {isActive && (
                    <motion.span
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex h-1.5 w-1.5 rounded-full bg-white ml-0.5 select-none shrink-0"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
