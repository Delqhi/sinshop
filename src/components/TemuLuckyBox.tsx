/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Percent, X, Check, Copy, ShieldCheck, Tag } from 'lucide-react';

interface TemuLuckyBoxProps {
  onApplyDiscount: (code: string, percent: number) => void;
}

export default function TemuLuckyBox({ onApplyDiscount }: TemuLuckyBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(() => {
    return localStorage.getItem('sin_shop_gamified_played') === 'true';
  });
  const [isOpening, setIsOpening] = useState(false);
  const [reward, setReward] = useState<{ code: string; percent: number } | null>(null);
  const [copied, setCopied] = useState(false);

  // Trigger professional floating prompt slightly after load
  const [showBubble, setShowBubble] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasPlayed) {
        setShowBubble(true);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [hasPlayed]);

  const handleOpenGift = () => {
    setIsOpening(true);
    setShowBubble(false);
    
    // Simulate premium verification delay
    setTimeout(() => {
      const chosen = { code: 'WELCOME30', percent: 30 }; 
      setReward(chosen);
      setIsOpening(false);
      setHasPlayed(true);
      localStorage.setItem('sin_shop_gamified_played', 'true');
    }, 1200);
  };

  const handleApplyCoupon = () => {
    if (reward) {
      onApplyDiscount(reward.code, reward.percent);
      setIsOpen(false);
    }
  };

  const handleCopyCode = () => {
    if (reward) {
      navigator.clipboard.writeText(reward.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Floating Premium Discounter Badge (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 text-gray-900">
        <AnimatePresence>
          {showBubble && !isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative rounded-2xl border border-gray-150 bg-white p-4 shadow-xl max-w-[210px] text-center select-none"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBubble(false);
                }}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-950"
                title="Schließen"
              >
                <X className="h-3 w-3" />
              </button>
              <p className="text-[10px] text-emerald-600 font-extrabold flex items-center justify-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Besucher-Aktion aktiv
              </p>
              <p className="text-[9.5px] text-gray-605 mt-1 font-bold leading-tight">
                Schalten Sie jetzt Ihren persönlichen 30% Rabatt-Code frei.
              </p>
              <button
                onClick={() => setIsOpen(true)}
                className="mt-2 text-[10px] font-black text-white bg-slate-900 hover:bg-slate-950 px-3 py-1.5 rounded-xl w-full transition-colors cursor-pointer uppercase tracking-wider"
              >
                Code freischalten
              </button>
              {/* Elegant bottom speech pin */}
              <div className="absolute right-6 -bottom-1.5 h-3 w-3 rotate-45 border-r border-b border-gray-150 bg-white"></div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Core Indicator */}
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 hover:bg-slate-950 text-white shadow-lg shadow-slate-900/15 cursor-pointer border border-slate-800"
          title="Rabattaktion anzeigen"
        >
          <Tag className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Modern, Highly Serious Discount Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-gray-150 bg-white p-6 shadow-2xl text-center"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              {!reward ? (
                /* Unchecked verification state */
                <div className="space-y-4 py-2">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-800">
                    <Tag className="h-7 w-7" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black text-gray-950 tracking-tight">
                      Besucher-Rabatt freischalten
                    </h3>
                    <p className="text-xs text-gray-550 leading-relaxed font-semibold max-w-xs mx-auto">
                      Als verifizierter Besucher dieses Sonderportals erhalten Sie einmalig 30% Direkt-Rabatt auf das gesamte Sortiment.
                    </p>
                  </div>

                  <button
                    onClick={handleOpenGift}
                    disabled={isOpening}
                    className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 font-extrabold text-white text-xs shadow-md tracking-wider transition-all cursor-pointer disabled:opacity-50 uppercase"
                  >
                    {isOpening ? 'Einen Moment...' : 'Rabatt-Code generieren'}
                  </button>

                  <p className="text-[10px] text-gray-400 font-medium">
                    * Gültig für alle Produkte im Warenkorb. Kein Mindestbestellwert.
                  </p>
                </div>
              ) : (
                /* Coupon successfully generated state */
                <div className="space-y-5 py-2">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                    ✓ Rabatt-Code generiert
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-xl font-black text-gray-950">Ihr 30% Spargutschein ist bereit</h3>
                    <p className="text-xs text-gray-500 font-semibold">Der Rabatt wird direkt vom Gesamtbetrag im Checkout abgezogen</p>
                  </div>

                  {/* Clean design voucher card */}
                  <div className="relative rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 flex items-center justify-center flex-col p-5 select-all">
                    {/* Visual notches */}
                    <div className="absolute top-1/2 -left-2.5 h-4 w-4 -translate-y-1/2 rounded-full bg-white border-r border-gray-200"></div>
                    <div className="absolute top-1/2 -right-2.5 h-4 w-4 -translate-y-1/2 rounded-full bg-white border-l border-gray-200"></div>

                    <div className="flex flex-col items-center">
                      <span className="text-4.5xl font-extrabold text-[#ef5006] font-mono leading-none tracking-tight">
                        -30%
                      </span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1.5 font-bold">Direkt-Import Gutschein</span>

                      <div className="mt-4 flex items-center justify-between gap-2.5 bg-white border border-gray-200 rounded-xl px-3.5 py-2 w-full">
                        <span className="font-mono text-xs text-gray-950 font-black select-all">{reward.code}</span>
                        <button
                          onClick={handleCopyCode}
                          className="text-gray-450 hover:text-gray-950 transition-colors"
                          title="In die Zwischenablage kopieren"
                        >
                          {copied ? <Check className="h-4 w-4 text-emerald-600 font-black" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={handleApplyCoupon}
                      className="w-full py-3 rounded-xl bg-gray-950 text-white hover:bg-black font-extrabold text-xs shadow-md transition-all cursor-pointer uppercase tracking-wider"
                    >
                      Direkt aktivieren & schließen
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="text-xs text-gray-450 hover:text-gray-800 font-semibold transition-colors"
                    >
                      Später nutzen
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
