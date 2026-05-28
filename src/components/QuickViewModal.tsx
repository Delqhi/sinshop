/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Star, ShieldCheck, Truck, CheckCircle2, Zap } from 'lucide-react';
import { Product } from '../types';

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (p: Product, quantity?: number, selectedColor?: string, selectedSize?: string) => void;
  onViewDetails: (p: Product) => void;
}

export default function QuickViewModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onViewDetails,
}: QuickViewModalProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string>(product.imageUrl);
  const [wasOpen, setWasOpen] = useState(false);
  const [isFastAdding, setIsFastAdding] = useState(false);

  // Synchronize options and state when the modal opens or is updated
  if (isOpen && !wasOpen) {
    setWasOpen(true);
    setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : null);
    setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : null);
    setActiveImage(product.imageUrl);
  } else if (!isOpen && wasOpen) {
    setWasOpen(false);
  }

  const isOutOfStock = product.stock === 0;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 text-gray-900">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col sm:flex-row max-h-[85vh] overflow-y-auto">
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-gray-700 hover:bg-black/20 transition-colors backdrop-blur-sm"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Left: Product Image */}
              <div className="relative w-full sm:w-1/2 bg-gray-50 flex-shrink-0 flex flex-col">
                <div className="aspect-square sm:aspect-auto sm:h-[400px] sm:flex-shrink-0 relative overflow-hidden">
                  <img
                    src={activeImage}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-opacity duration-300"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    <span className="inline-flex items-center rounded-lg bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#ef5006] shadow-md border border-gray-100">
                      {product.category}
                    </span>
                    {product.originalPrice && (
                      <span className="inline-flex items-center rounded-lg bg-orange-600 px-2.5 py-1 text-[10px] font-black text-white shadow-md">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% SPAREN
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Thumbnail Gallery Row */}
                {product.imageGallery && product.imageGallery.length > 0 && (
                  <div className="flex bg-white gap-2 overflow-x-auto p-4 border-t border-gray-100 scrollbar-hide">
                    {product.imageGallery.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                          activeImage === img
                            ? 'border-orange-500'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Gallery Thumbnail ${idx}`}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Essential Details */}
              <div className="flex w-full flex-col p-6 sm:p-8 sm:w-1/2">
                <h2 className="text-xl sm:text-2xl font-black text-gray-950 leading-tight mb-2">
                  {product.title}
                </h2>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 fill-current ${
                          i < Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-550">{product.rating.toFixed(1)} Bewertungen</span>
                </div>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-mono text-2xl font-black text-orange-600">
                    {product.price.toFixed(2)} €
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm font-medium text-gray-400 line-through">
                      {product.originalPrice.toFixed(2)} €
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-650 leading-relaxed font-semibold mb-6 flex-grow">
                  {product.description}
                </p>

                {/* Product Options */}
                <div className="space-y-4 mb-6">
                  {product.colors && product.colors.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Farbe</span>
                      <div className="flex flex-wrap gap-2.5">
                        {product.colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`h-8 w-8 rounded-full border border-gray-200/55 transition-all cursor-pointer shadow-sm ${
                              selectedColor === color
                                ? 'ring-2 ring-orange-500 ring-offset-2 scale-110'
                                : 'hover:scale-105 hover:border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                            title={`Farbe: ${color}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {product.sizes && product.sizes.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Größe</span>
                      <div className="flex flex-wrap gap-2">
                        {product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`min-w-12 h-10 rounded-xl border px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                              selectedSize === size
                                ? 'border-orange-500 bg-orange-50 text-orange-600 font-extrabold shadow-xs shadow-orange-100 scale-102'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Information row */}
                {!!(product.features || product.specifications) && (
                  <div className="space-y-4 mb-6 border-t border-gray-100 pt-4">
                    {!!(product.features && product.features.length > 0) && (
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5 block">Highlights</span>
                        <ul className="grid grid-cols-1 gap-1">
                          {product.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-600 font-medium">
                              <span className="text-orange-500 mt-0.5">•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!!(product.specifications && Object.keys(product.specifications).length > 0) && (
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5 block">Spezifikationen</span>
                        <div className="grid grid-cols-1 gap-1 bg-gray-50 rounded-lg p-3 border border-gray-150">
                          {Object.entries(product.specifications).map(([key, value]) => (
                            <div key={key} className="flex justify-between items-center text-xs">
                              <span className="text-gray-500 font-semibold">{key}:</span>
                              <span className="text-gray-900 font-bold text-right">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Status and Action */}
                <div className="space-y-4 pt-4 border-t border-gray-100 mt-auto">
                  {/* Stock status */}
                  <div className="flex items-center gap-2 text-xs font-bold">
                    {isOutOfStock ? (
                      <span className="flex items-center gap-1.5 text-red-500">
                        <X className="h-4 w-4" /> Ausverkauft
                      </span>
                    ) : product.stock <= 5 ? (
                      <span className="flex items-center gap-1.5 text-orange-600">
                        <Star className="h-4 w-4 fill-current" /> Nur noch {product.stock} Stück auf Lager
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" /> Sofort lieferbar
                      </span>
                    )}
                  </div>

                  {/* Micro guarantees */}
                  <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold mb-4">
                    <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Gratis Versand</span>
                    <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> 100% Sicher</span>
                  </div>

                  <div className="space-y-2">
                    <button
                      id="fast-add-btn"
                      disabled={isOutOfStock || (!!product.colors?.length && !selectedColor) || (!!product.sizes?.length && !selectedSize)}
                      onClick={() => {
                        if (product.colors?.length && !selectedColor) return;
                        if (product.sizes?.length && !selectedSize) return;
                        onAddToCart(product, 1, selectedColor || undefined, selectedSize || undefined);
                        setIsFastAdding(true);
                        setTimeout(() => setIsFastAdding(false), 1500);
                      }}
                      className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase transition-all duration-200 cursor-pointer ${
                        isOutOfStock || (!!product.colors?.length && !selectedColor) || (!!product.sizes?.length && !selectedSize)
                          ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                          : isFastAdding
                            ? 'bg-emerald-600 border border-emerald-700 text-white shadow-md shadow-emerald-500/15'
                            : 'bg-slate-900 border border-slate-950 text-white hover:bg-slate-800 shadow-md shadow-slate-900/15'
                      }`}
                    >
                      {isFastAdding ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-white" />
                          <span>Hinzugefügt! 🎉</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 text-amber-400 fill-amber-400 animate-pulse" />
                          <span>Fast Add / Direkt hinzufügen</span>
                        </>
                      )}
                    </button>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        disabled={isOutOfStock || (!!product.colors?.length && !selectedColor) || (!!product.sizes?.length && !selectedSize)}
                        onClick={() => {
                          if (product.colors?.length && !selectedColor) return;
                          if (product.sizes?.length && !selectedSize) return;
                          onAddToCart(product, 1, selectedColor || undefined, selectedSize || undefined);
                          onClose();
                        }}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-black uppercase transition-all duration-200 cursor-pointer ${
                          isOutOfStock || (!!product.colors?.length && !selectedColor) || (!!product.sizes?.length && !selectedSize)
                            ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                            : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-500/15'
                        }`}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {isOutOfStock ? 'Nicht verfügbar' : 'Kaufen & Schließen'}
                      </button>
                      <button
                        onClick={() => {
                          onClose();
                          onViewDetails(product);
                        }}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-black bg-gray-50 text-gray-900 border border-gray-200 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
                      >
                        Vollständige Details
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
}
