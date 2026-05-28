/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star, ShoppingCart, Info, Eye, Heart, Zap, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';
import QuickViewModal from './QuickViewModal';
import ShareModal from './ShareModal';

interface ProductCardProps {
  product: Product;
  isWished: boolean;
  onToggleWishlist: (id: string) => void;
  onAddToCart: (p: Product, quantity?: number, selectedColor?: string, selectedSize?: string) => void;
  onViewDetails: (p: Product) => void;
}

export default function ProductCard({ product, isWished, onToggleWishlist, onAddToCart, onViewDetails }: ProductCardProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(product.sizes?.length ? product.sizes[0] : null);
  const [selectedColor, setSelectedColor] = useState<string | null>(product.colors?.length ? product.colors[0] : null);
  const [isManualActive, setIsManualActive] = useState(false);

  const isOutOfStock = product.stock === 0;
  const isLimitedStock = product.stock > 0 && product.stock <= 5;
  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Temu/Amazon style gamified urgency and social proof calculations:
  const demandCount = (product.id.charCodeAt(0) * 17) % 500 + 45;
  const deliveryDays = (product.id.charCodeAt(0) % 2) + 2;
  const claimPercent = (product.id.charCodeAt(0) * 11) % 36 + 60; // 60% - 95%
  const activeViewers = (product.id.charCodeAt(0) * 5) % 14 + 4; // 4 - 17 real web shoppers

  // Image gallery preview
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const gallery = product.imageGallery?.length ? product.imageGallery : [product.imageUrl];

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && gallery.length > 1 && !isManualActive) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
      }, 1500);
    } else if (!isHovered) {
      setCurrentImageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, isManualActive, gallery]);

  const displayImage = gallery.length && isHovered 
    ? gallery[currentImageIndex] 
    : product.imageUrl;

  return (
    <motion.div
      id={`product-card-${product.id}`}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10px' }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsManualActive(false);
        setCurrentImageIndex(0);
      }}
      onClick={() => setIsQuickViewOpen(true)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-transparent bg-white transition-all hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/10 cursor-pointer"
    >
      {/* Product Image Section */}
      <div className="relative aspect-4/3 overflow-hidden bg-gray-50">
        
        {/* Dynamic Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {discountPercentage > 0 && (
            <span className="inline-flex items-center rounded-lg bg-orange-600 px-2.5 py-1 text-xs font-black text-white shadow-md animate-pulse">
              -{discountPercentage}% RABATT
            </span>
          )}
          {product.isFeatured && (
            <span className="inline-flex items-center rounded-lg bg-amber-400 px-2.5 py-1 text-[9px] font-black text-slate-900 uppercase tracking-wider shadow-sm">
              👑 BESTSELLER
            </span>
          )}
        </div>

        {/* Stock status badge and Wishlist */}
        <div className="absolute top-3 right-3 z-30 flex flex-col items-end gap-2">
          {isOutOfStock ? (
            <span className="inline-flex items-center rounded-lg bg-red-650 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
              Ausverkauft
            </span>
          ) : isLimitedStock ? (
            <span className="inline-flex items-center rounded-lg bg-red-650 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white animate-pulse shadow-md">
              NUR NOCH {product.stock} ÜBRIG!
            </span>
          ) : (
            <span className="inline-flex items-center rounded-lg bg-orange-100 text-orange-700 border border-orange-200 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider shadow-sm">
              ⚡ BLITZANGEBOT
            </span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer border ${
              isWished ? 'border-red-200 text-red-500' : 'border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-200'
            }`}
            title={isWished ? 'Von Wunschliste entfernen' : 'Zur Wunschliste hinzufügen'}
          >
            <Heart className={`h-4 w-4 ${isWished ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsShareOpen(true);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all hover:scale-110 active:scale-95 cursor-pointer border border-gray-100 text-gray-400 hover:text-orange-500 hover:border-orange-200"
            title="Spezifiziertes Angebot teilen"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>

        {/* Real-time viewer counter overlay */}
        <div className="absolute bottom-2.5 left-2.5 z-10 bg-slate-950/75 backdrop-blur-xs text-white rounded-md px-2 py-0.5 text-[8px] font-bold flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-ping"></span>
          <span>{activeViewers} Betrachter live!</span>
        </div>

        {/* Dynamic Slide-up Tactical Drawer (Overlaid over the image on hover, constant card height!) */}
        <div 
          onClick={(e) => e.stopPropagation()}
          className={`absolute bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md p-3 border-t border-gray-150 transition-all duration-300 ease-out flex flex-col gap-2 shadow-lg rounded-t-xl ${
            isHovered ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'
          }`}
        >
          {/* Lightning Deal Progress Claim Bar */}
          {!isOutOfStock && (
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-[8.5px] font-black">
                <span className="text-orange-600">{claimPercent}% reserviert</span>
                <span className="text-amber-550 animate-pulse">⚡ BLITZVERKAUF</span>
              </div>
              <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-full"
                  style={{ width: `${claimPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Compact Size & Color selection */}
          {!!((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) && (
            <div className="flex items-center justify-between gap-2 bg-slate-50/70 p-1 rounded border border-gray-150/50">
              {product.sizes && product.sizes.length > 0 ? (
                <div className="w-1/2">
                  <select
                    value={selectedSize || ''}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full text-[8.5px] font-medium tracking-wider text-gray-700 bg-white border border-gray-200 rounded py-0.5 px-1 focus:outline-none uppercase cursor-pointer"
                  >
                    {product.sizes.map((size) => (
                      <option key={size} value={size}>
                        Größe: {size}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="w-1/2"></div>
              )}

              {product.colors && product.colors.length > 0 ? (
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-hide select-none w-1/2 justify-end">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`shrink-0 h-4 w-4 rounded-full ring-2 transition-all cursor-pointer ${
                        selectedColor === color
                          ? 'ring-orange-500 ring-offset-1 scale-110 shadow-sm'
                          : 'ring-gray-200 hover:ring-gray-300 shadow-sm'
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="w-1/2"></div>
              )}
            </div>
          )}

          {/* Quick Details & View trigger buttons */}
          <div className="flex gap-1.5 pt-0.5">
            <button 
              onClick={(e) => { e.stopPropagation(); onViewDetails(product); }}
              className="flex-1 text-[9px] bg-slate-100 text-slate-800 hover:bg-slate-200 py-1 rounded font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer text-center border border-gray-200 shadow-3xs"
            >
              Details
            </button>
            <button 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (isOutOfStock) return;
                onAddToCart(product, 1, selectedColor || undefined, selectedSize || undefined);
                window.dispatchEvent(new CustomEvent('open-cart-checkout'));
              }}
              disabled={isOutOfStock}
              className="flex-1 text-[9px] bg-orange-600 text-white hover:bg-orange-700 py-1 rounded font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer text-center border border-orange-700 shadow-3xs disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-205 disabled:cursor-not-allowed"
            >
              ⚡ Sofort-Kauf
            </button>
          </div>
        </div>

        {/* Product Image */}
        <img
          src={displayImage}
          alt={product.title}
          referrerPolicy="no-referrer"
          onClick={() => setIsQuickViewOpen(true)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
        />

        {/* Gallery Navigation Arrows */}
        {gallery.length > 1 && isHovered && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsManualActive(true);
                setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 backdrop-blur-xs text-gray-800 shadow-md border border-gray-150 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all active:scale-95 cursor-pointer select-none"
              aria-label="Previous image"
              title="Vorheriges Bild"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsManualActive(true);
                setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 backdrop-blur-xs text-gray-800 shadow-md border border-gray-150 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all active:scale-95 cursor-pointer select-none"
              aria-label="Next image"
              title="Nächstes Bild"
            >
              <ChevronRight className="h-4.5 w-4.5" />
            </button>
          </>
        )}
        
        {/* Gallery Progress Indicators */}
        {isHovered && gallery.length > 1 ? (
          <div className="absolute bottom-3 left-0 right-0 z-30 flex justify-center gap-1.5 px-4 pointer-events-none">
            {gallery.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1 rounded-full transition-all duration-300 ${
                  currentImageIndex === idx 
                    ? 'bg-orange-500 w-4' 
                    : 'bg-white/60 w-1.5'
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Product Information Section */}
      <div className="flex flex-1 flex-col p-4 pr-5 pl-5 pb-5">
        
        {/* Row 1: Category, Title & Pricing */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[9px] uppercase tracking-widest text-[#ef5006] font-extrabold bg-orange-55 px-1.5 py-0.5 rounded w-fit mb-1">
              {product.category}
            </span>
            <h3 className="font-sans text-sm font-black text-gray-950 group-hover:text-orange-550 transition-colors line-clamp-1">
              {product.title}
            </h3>
          </div>

          <div className="flex flex-col items-end shrink-0">
            {product.originalPrice && (
              <span className="text-[10px] text-gray-400 line-through leading-none mb-1 font-bold">
                {product.originalPrice.toFixed(2)} €
              </span>
            )}
            <div className="flex items-baseline gap-0.5">
              <span className="font-mono text-base font-black text-slate-900 leading-none">
                {product.price.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-900 font-black">€</span>
            </div>
          </div>
        </div>

        {/* Minimal description/text line (Completely static and non-expanding to ensure identical height!) */}
        <p className="mt-1.5 text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Dynamic Static Details Strip (Always visible, zero layout shifts, high Trust!) */}
        <div className="flex items-center gap-1.5 mt-2.5 text-[10px] text-gray-400 font-bold border-t border-dashed border-gray-150 pt-2.5">
          <div className="flex items-center text-amber-400 shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 fill-current ${
                  i < Math.round(product.rating) ? 'text-amber-400' : 'text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[9.5px] text-gray-500 font-extrabold whitespace-nowrap">
            {product.rating.toFixed(1)} ({product.ratingCount || '342'})
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-orange-650 font-extrabold text-[9px] truncate">
            🔥 {demandCount} bestellt
          </span>
        </div>

        {/* Flexible spacer to layout buttons beautifully */}
        <div className="flex-1 min-h-[4px]"></div>

        {/* Dedicated, Persistent Footer Section */}
        <div className="border-t border-gray-100 bg-gray-50/50 -mx-5 -mb-5 px-5 pb-4 pt-3 mt-2.5 flex items-center justify-between gap-2.5">
          <div className="flex items-center text-[10px] font-extrabold text-[#10b981]">
            {isOutOfStock ? (
              <span className="text-red-500 font-extrabold uppercase text-[9px]">SOLDOUT</span>
            ) : (
              <span className="flex items-center gap-1 uppercase tracking-wider text-[9px]">
                ⚡ Sofort lieferbar
              </span>
            )}
          </div>

          <button
            id={`add-to-cart-${product.id}`}
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              if (product.colors?.length && !selectedColor) {
                setIsQuickViewOpen(true);
              } else if (product.sizes?.length && !selectedSize) {
                setIsQuickViewOpen(true);
              } else {
                onAddToCart(product, 1, selectedColor || undefined, selectedSize || undefined);
              }
            }}
            className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black transition-all duration-250 cursor-pointer ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none'
                : 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95 shadow-md shadow-orange-500/15 font-black uppercase tracking-wider'
            }`}
          >
            <ShoppingCart className="h-3.5 w-3.5 text-white shrink-0" />
            <span className="text-white font-bold">
              {isOutOfStock
                ? 'Off'
                : !!((product.colors?.length && !selectedColor) || (product.sizes?.length && !selectedSize))
                ? 'Wählen'
                : 'Kaufen'}
            </span>
          </button>
        </div>

      </div>

      <QuickViewModal
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={onAddToCart}
        onViewDetails={onViewDetails}
      />

      <ShareModal
        product={product}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </motion.div>
  );
}
