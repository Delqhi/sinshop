/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check, MessageCircle, Twitter } from 'lucide-react';
import { Product } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ShareModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ product, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Build the share link
  // Use product identifier, fallback to general shop URL
  const shareUrl = `${window.location.origin}/?product=${product.id}`;
  const shareText = `Schau dir dieses tolle Produkt bei SIN-SHOP an: ${product.title} - ${product.price.toFixed(2)} €! 🔥⚡`;

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
        />

        {/* Modal Panel content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl"
        >
          {/* Close trigger button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-gray-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer border border-gray-150"
            aria-label="Schließen"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Heading title */}
          <div className="mb-5">
            <h3 className="font-sans text-base font-black text-slate-900 uppercase tracking-wide">
              Produkt teilen
            </h3>
            <p className="text-xs text-gray-450 font-medium">
              Verschicke den exklusiven Deal jetzt an deine Freunde und Familie! ⚡
            </p>
          </div>

          {/* Compact Mini Product Preview Banner */}
          <div className="mb-5 flex items-center gap-3.5 bg-slate-50/70 p-3 rounded-xl border border-gray-150/50">
            <img
              src={product.imageUrl}
              alt={product.title}
              referrerPolicy="no-referrer"
              className="h-12 w-12 rounded-lg object-cover bg-white border border-gray-150 shadow-3xs shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[9px] uppercase tracking-wider text-orange-600 font-extrabold bg-orange-50 px-1 py-0.5 rounded">
                {product.category}
              </span>
              <h4 className="font-sans text-xs font-black text-slate-900 mt-1 truncate">
                {product.title}
              </h4>
              <div className="flex items-baseline gap-0.5 mt-0.5">
                <span className="font-mono text-xs font-black text-orange-600">
                  {product.price.toFixed(2)}
                </span>
                <span className="text-[9px] text-orange-600 font-black">€</span>
              </div>
            </div>
          </div>

          {/* Core Sharing Destinations Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* WhatsApp Destination */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex items-center justify-center gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/40 py-3 text-xs font-extrabold text-emerald-800 transition-all hover:bg-emerald-50 active:scale-95 shadow-3xs"
            >
              <MessageCircle className="h-4.5 w-4.5 text-emerald-600 fill-current" />
              <span>WhatsApp</span>
            </a>

            {/* Twitter / X Destination */}
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 py-3 text-xs font-extrabold text-slate-900 transition-all hover:bg-slate-100 active:scale-95 shadow-3xs"
            >
              <Twitter className="h-4.5 w-4.5 text-slate-900 fill-current" />
              <span>Twitter / X</span>
            </a>
          </div>

          {/* Copy-Link Input Bar */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-black tracking-wider text-gray-500 block">
              Direkter Produkt-Link
            </label>
            <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-gray-200 rounded-xl">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent px-2.5 py-1.5 text-xs text-gray-700 font-mono outline-none select-all"
              />
              <button
                onClick={copyToClipboard}
                className={`flex items-center gap-1.5 shrink-0 px-4 py-1.5 text-xs rounded-lg font-black uppercase transition-all duration-200 active:scale-95 cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/10'
                    : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/15'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    <span>Kopiert</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Kopieren</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
