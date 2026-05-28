# SIN-SHOP Design System Guidelines & Architecture

This document serves as the absolute design bible for **SIN-SHOP**. It contains the comprehensive aesthetic philosophies, interactive behaviors, typography rules, color palettes, spacing rhythm, and exact code templates to ensure that any future extension or modification adheres perfectly to our signature high-converting, high-trust Amazon & Temu-hybrid retail aesthetic.

---

## 1. Aesthetic Mission & Core Philosophies

Our UI combines the professional trust of **Amazon** with the gamified micro-urgency and rich product focus of **Temu**. Every layout must adhere to these four core pillars:

1. **Perfect Layout Stability (Anti-Jarring / Anti-Layout Shift)**
   * **Rule:** Hovering or interacting with a component **must never** expand its outer container or cause surrounding layout elements to shift. 
   * **Execution:** We utilize absolute overlaid drop-drawers and preset bounding heights to encapsulate interactive states instead of physically resizing components on mouseover.
2. **Action-Driven Layering (Slide-Up Overlays)**
   * **Rule:** Keep the primary card display layout exceptionally clean. Extra, high-converting "tactical details" (dropdown selectors, urgency indicators, alternative buys) fly up elegantly *over the media canvas* during hover interactions instead of pushing footer elements down.
3. **High-Urgency Gamified Proof (Micro-Data)**
   * **Rule:** Inject dynamic trust and velocity anchors seamlessly: Star aggregates, live visitor counts, today orders, and animated gradient claim bars.
4. **Desktop-First Precision & Touch-Sized Mobile Targets**
   * **Rule:** Pixel-perfect line clamp limits, discrete custom outline rings, and explicit flex alignments across varying viewport densities.

---

## 2. Color System & Pairings

We use standard Tailwind CSS colors coupled with high-contrast, high-impact tactical colors to guide consumer attention pools:

| Token Name | Tailwind Variable Equivalent | HEX | Primary Structural Use Case |
| :--- | :--- | :--- | :--- |
| **Cosmic Dark** | `slate-950` or `gray-950` | `#030712` | Solid heavy texts, headings, bold card anchors |
| **Temu Orange** | `orange-500` to `orange-600` | `#f97316` | Main call-to-action buttons, high-converting badges |
| **Amazon Amber** | `amber-400` | `#fbbf24` | Review stars, high-volume rating stars |
| **Live Green** | `emerald-650` or `emerald-600` | `#059669` | Instantly available shipping tags, trust guarantees |
| **Slate Gray** | `slate-500` to `slate-700` | `#64748b` | Description texts, secondary specifications |
| **Light Ice Slate**| `gray-50/50` or `slate-50/75` | `#f9fafb` | Persistent footer backgrounds, inactive selections |

---

## 3. Typography Hierarchy

We import **Inter** for clean, scalable, high-trust digital reading coupled with **JetBrains Mono** for pricing blocks because monospaced prices look highly structured, elite, and mathematically precise.

* **Main Titles / Headings:**
  `font-sans text-sm font-black text-gray-950 group-hover:text-orange-550 transition-colors line-clamp-1`
* **Static Descriptions / Body:**
  `text-[11px] text-gray-500 line-clamp-2 leading-relaxed`
* **Pricing Elements (Mathematical Mono Font):**
  `font-mono text-base font-black text-slate-900 leading-none`
* **Urgency Signals / Small Tags:**
  `text-[9px] uppercase tracking-widest text-[#ef5006] font-extrabold bg-orange-55 px-1.5 py-0.5 rounded`

---

## 4. Key Component Structure: The Static Bounded Product Card

The crown jewel of our user conversion layout is the **ProductCard** component. Below is the exact code architecture for creating or modifying product lists. It features:
- Core manual image gallery switching via hover-dependent, event-stopped **ChevronLeft & ChevronRight** controls.
- Dynamic interactive Drawer Overlay (`absolute bottom-0 left-0 right-0 z-20`) for choosing variant sizes & colors.
- Zero layout expansion when rendering detailed subviews.

### Reference Code Blueprint

```tsx
import React, { useState } from 'react';
import { Star, ShoppingCart, Info, Eye, Heart, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { motion } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number, color?: string, size?: string) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onViewDetails }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(product.sizes?.length ? product.sizes[0] : null);
  const [selectedColor, setSelectedColor] = useState<string | null>(product.colors?.length ? product.colors[0] : null);
  const [isManualActive, setIsManualActive] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isOutOfStock = product.stock === 0;
  const gallery = product.imageGallery?.length ? product.imageGallery : [product.imageUrl];
  const claimPercent = Math.min(92, Math.max(12, Math.floor(((product.id.charCodeAt(0) || 45) % 80) + 12))); 

  // Image Rotation Logic (only autoscales if manual nav has not hijacked the view)
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

  const displayImage = gallery.length && isHovered ? gallery[currentImageIndex] : product.imageUrl;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsManualActive(false);
        setCurrentImageIndex(0);
      }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-transparent bg-white transition-all hover:border-orange-500 hover:shadow-2xl hover:shadow-orange-500/10"
    >
      {/* Product Image Stage */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        
        {/* Dynamic Image Content */}
        <img
          src={displayImage}
          alt={product.title}
          referrerPolicy="no-referrer"
          onClick={() => onViewDetails(product)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
        />

        {/* Gallery Manual Navigation Arrows */}
        {gallery.length > 1 && isHovered && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsManualActive(true);
                setCurrentImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 backdrop-blur-xs text-gray-800 shadow-md border border-gray-150 hover:bg-orange-500 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsManualActive(true);
                setCurrentImageIndex((prev) => (prev + 1) % gallery.length);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-30 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 backdrop-blur-xs text-gray-800 shadow-md border border-gray-150 hover:bg-orange-500 hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Temu-Style Drawer Slide-Up (Saves Layout Heights!) */}
        <div 
          onClick={(e) => e.stopPropagation()}
          className={`absolute bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md p-3 border-t border-gray-150 transition-all duration-300 ease-out flex flex-col gap-2 shadow-lg rounded-t-xl ${
            isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
          }`}
        >
          {/* Lightning Deal Progress Claim Bar */}
          {!isOutOfStock && (
            <div className="space-y-0.5">
              <div className="flex justify-between items-center text-[8.5px] font-black">
                <span className="text-orange-600">{claimPercent}% reserviert</span>
                <span className="text-orange-500 animate-pulse">⚡ BLITZVERKAUF</span>
              </div>
              <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600"
                  style={{ width: `${claimPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Compact Dropdowns inside Overlay */}
          {!!((product.sizes?.length) || (product.colors?.length)) && (
            <div className="flex items-center justify-between gap-2 bg-slate-50/70 p-1 rounded border border-gray-150/50">
              {product.sizes && product.sizes.length > 0 && (
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
              )}

              {product.colors && product.colors.length > 0 && (
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 justify-end w-1/2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`shrink-0 h-4 w-4 rounded-full ring-2 transition-all cursor-pointer ${
                        selectedColor === color
                          ? 'ring-orange-500 ring-offset-1 scale-110'
                          : 'ring-gray-200 hover:ring-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Dual Instant Interactions */}
          <div className="flex gap-1.5 pt-0.5">
            <button 
              onClick={() => onViewDetails(product)}
              className="flex-1 text-[9px] bg-slate-100 text-slate-800 hover:bg-slate-200 py-1 rounded font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer text-center border border-gray-200"
            >
              Details
            </button>
            <button 
              onClick={() => { 
                if (isOutOfStock) return;
                onAddToCart(product, 1, selectedColor || undefined, selectedSize || undefined);
                // Dispatch event to force sidebar panel or slide drawer to toggle open instantly
                window.dispatchEvent(new CustomEvent('open-cart-checkout'));
              }}
              className="flex-1 text-[9px] bg-orange-650 text-white hover:bg-orange-700 py-1 rounded font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer text-center"
            >
              ⚡ Sofort-Kauf
            </button>
          </div>
        </div>

      </div>

      {/* Product Narrative Metadata */}
      <div className="flex flex-1 flex-col p-4 pr-5 pl-5 pb-5">
        
        {/* Title, Category & Pricing Block in balanced Grid */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-[9px] uppercase tracking-widest text-[#ef5006] font-extrabold bg-orange-50 px-1.5 py-0.5 rounded w-fit mb-1">
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

        {/* Narrative description (keeps constant heights!) */}
        <p className="mt-1.5 text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Static Details Strip (Adds Amazon-style Credibility & Social Proof) */}
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
          <span className="text-[9.5px] text-gray-550 font-extrabold whitespace-nowrap">
            {product.rating.toFixed(1)}
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-orange-600 font-extrabold text-[9px] truncate">
            🔥 Beliebt
          </span>
        </div>

        <div className="flex-1 min-h-[4px]"></div>

        {/* Footing Checkout Controls */}
        <div className="border-t border-gray-100 bg-gray-50/50 -mx-5 -mb-5 px-5 pb-4 pt-3 mt-2.5 flex items-center justify-between gap-2.5">
          <span className="text-[9px] uppercase tracking-wider text-emerald-600 font-black">
            ⚡ Sofort lieferbar
          </span>

          <button
            onClick={() => onAddToCart(product, 1, selectedColor || undefined, selectedSize || undefined)}
            className="flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>In den Warenkorb</span>
          </button>
        </div>

      </div>
    </motion.div>
  );
};
```

---

## 5. Micro-Interaction Rules For Developers

When introducing new interactive elements or modifying current components:

1. **Triggering `open-cart-checkout` Events:**
   * When any **Sofort-Kauf** or **Blitzbestellung** action is registered, developers must dispatch the local event `window.dispatchEvent(new CustomEvent('open-cart-checkout'))`.
   * This is automatically caught in `App.tsx` and transitions the active view tab to `cart` instantly to keep conversion rates peaked and seamless.
2. **Standardizing Form Inputs (Buttons, Dropdowns):**
   * Keep select boxes compact, capitalizing font weighting (`font-black`), and applying consistent letter heights.
   * Color selector rings should have outer spacing (`ring-offset-1`) during active selection to guarantee perfect contrast and visibility.
3. **Transition Vectors:**
   * Prefer using `motion` animations (`motion/react`) for layout elements. Transition curves should remain fast, generally between `duration: 0.2` and `duration: 0.3` with `ease-out`.

---

*This document was established in May 2026. Any alterations must be logged and approved to keep the premium, conversion-optimized retail feel intact.*
