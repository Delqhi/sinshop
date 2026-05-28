/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Star,
  ShoppingCart,
  ShieldCheck,
  Truck,
  RefreshCw,
  MessageSquare,
  UserCheck,
  LogIn,
  Sparkles,
  Clock,
  Send,
} from "lucide-react";
import { Product, Review, User } from "../types";

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (p: Product, quantity?: number, selectedColor?: string, selectedSize?: string) => void;
  allProducts: Product[];
  browsingHistory: string[];
  currentUser: User;
  onToggleUser: () => void;
  onAddReview: (productId: string, rating: number, comment: string) => void;
  onViewProduct: (p: Product) => void;
}

export default function ProductDetailsModal({
  product,
  onClose,
  onAddToCart,
  allProducts,
  browsingHistory,
  currentUser,
  onToggleUser,
  onAddReview,
  onViewProduct,
}: ProductDetailsModalProps) {
  // New review form states
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>("");
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [formError, setFormError] = useState<string>("");

  // Local tab state: 'info' or 'reviews'
  const [activeTab, setActiveTab] = useState<"info" | "reviews">("info");

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [prevProductId, setPrevProductId] = useState<string | null>(null);

  // Synchronize options and state when product changes of a deep view (during-render to avoid flash)
  if (product && product.id !== prevProductId) {
    setPrevProductId(product.id);
    setActiveImage(product.imageUrl);
    setSelectedColor(product.colors && product.colors.length > 0 ? product.colors[0] : null);
    setSelectedSize(product.sizes && product.sizes.length > 0 ? product.sizes[0] : null);
    setActiveTab("info");
  }

  if (!product) return null;

  const isOutOfStock = product.stock === 0;

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!currentUser.isLoggedIn) {
      setFormError("Bitte loggen Sie sich ein, um eine Bewertung abzugeben.");
      return;
    }

    if (!newComment.trim()) {
      setFormError("Bitte geben Sie einen Kommentar ein.");
      return;
    }

    if (newComment.trim().length < 5) {
      setFormError("Der Kommentar muss mindestens 5 Zeichen lang sein.");
      return;
    }

    // Call state update callback upper
    onAddReview(product.id, newRating, newComment);

    // Clear local inputs
    setNewComment("");
    setNewRating(5);
  };

  // Recommendations logic:
  // 1. Same category items (except current product)
  const categoryRecs = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 2);

  // 2. Based on unique browsing history logs (except current product and category recs)
  const historyProducts = allProducts
    .filter((p) => {
      return (
        browsingHistory.includes(p.id) &&
        p.id !== product.id &&
        p.category !== product.category
      );
    })
    .slice(0, 2);

  // Merge them together for complete suggestions list
  const combinedRecommendations = [...categoryRecs, ...historyProducts].slice(
    0,
    3,
  );

  // Get current active reviews, handling undefined
  const reviewsList = product.reviews || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-6">
        {/* Backdrop Blur Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Sheet Body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-gray-250 bg-white p-6 shadow-2xl sm:p-10 max-h-[92vh] overflow-y-auto scrollbar-thin text-gray-900"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm text-gray-400 transition-colors hover:border-gray-305 hover:text-gray-950 shadow-sm"
          >
            <X className="h-4.5 w-4.5" />
          </button>

          {/* Core Product Presentation Section (Top) */}
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            {/* Left Box: Big Product Image & Gallery */}
            <div className="md:col-span-12 lg:col-span-6 flex flex-col gap-4">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 border border-gray-150 max-h-[420px] mx-auto w-full group/image shadow-xs">
                <img
                  src={activeImage}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover/image:scale-105"
                />
                <span className="absolute top-4 left-4 rounded-full bg-white/95 shadow px-3 py-1 text-[9px] uppercase font-black text-orange-600 tracking-widest border border-gray-200">
                  {product.category}
                </span>
              </div>

              {product.imageGallery && product.imageGallery.length > 0 ? (
                <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-hide">
                  {product.imageGallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all shadow-xs cursor-pointer ${
                        activeImage === img
                          ? "border-orange-500 ring-2 ring-orange-500/20 scale-102"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Gallery ${idx}`}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Right Box: Product information buying CTA */}
            <div className="md:col-span-12 lg:col-span-6 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                {/* Temu-style high urgency flash-deals banner */}
                <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 text-slate-950 px-3.5 py-2 rounded-xl text-[10px] font-black tracking-wider uppercase flex items-center justify-between select-none shadow-sm shadow-orange-500/10">
                  <span className="flex items-center gap-1.5">
                    ⚡ SCHARF KALKULIERTES BLITZANGEBOT
                  </span>
                  <span className="bg-slate-950 text-orange-400 px-1.5 py-0.5 rounded text-[8px]">PREISGARANTIE</span>
                </div>

                <h3 className="font-sans text-2xl font-black text-gray-950 sm:text-3xl tracking-tight leading-tight">
                  {product.title}
                </h3>

                {/* Stars reviews link trigger */}
                <div
                  className="flex items-center gap-1.5 cursor-pointer bg-slate-50/50 p-1.5 rounded-lg border border-gray-100 self-start justify-start w-fit"
                  onClick={() => setActiveTab("reviews")}
                >
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 fill-current ${
                          i < Math.round(product.rating)
                            ? "text-amber-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-650 hover:text-orange-600 hover:underline transition-colors font-bold">
                    {product.rating.toFixed(1)} ({reviewsList.length}{" "}
                    verifizierte Kundenstimmen)
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                  {product.description}
                </p>

                {/* Stock tracker */}
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-xs text-gray-400 font-bold">
                    Lagerbestand:
                  </span>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                      isOutOfStock
                        ? "bg-red-50 text-red-650 border-red-200"
                        : product.stock <= 5
                          ? "bg-orange-50 text-orange-600 border-orange-200 animate-pulse"
                          : "bg-emerald-50 text-emerald-600 border-emerald-100"
                    }`}
                  >
                    {isOutOfStock
                      ? "Ausverkauft"
                      : product.stock <= 5
                        ? `🔥 Nur noch ${product.stock} Stück auf Lager! Schnell bestellen`
                        : "⚡ Sofort lieferbar (In 2 Tagen bei Ihnen)"}
                  </span>
                </div>
              </div>

              {/* Options Selection (Farbe, Größe) */}
              <div className="space-y-4">
                {product.colors && product.colors.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Farbenwelt wählen
                      </span>
                      <span className="text-[10px] text-gray-550 font-black uppercase">
                        {selectedColor || "Bitte wählen"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`h-8 w-8 rounded-full border border-gray-200/55 transition-all cursor-pointer shadow-sm ${
                            selectedColor === color
                              ? "ring-2 ring-orange-500 ring-offset-2 scale-110"
                              : "hover:scale-105 hover:border-gray-300"
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
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Auswahl der Größe
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-extrabold uppercase animate-pulse">
                        {selectedSize || "Bitte wählen"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-12 h-10 rounded-xl border px-3 py-2 text-xs font-bold transition-all cursor-pointer ${
                            selectedSize === size
                              ? "border-orange-500 bg-orange-50 text-orange-600 font-extrabold shadow-xs scale-102"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Information row (Specifications & Features) */}
              {!!(product.features || product.specifications) && (
                <div className="border-t border-gray-150 pt-5 mt-2 mb-2 space-y-4">
                  {!!(product.features && product.features.length > 0) && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Produkt-Highlights</span>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {product.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs text-gray-700 font-semibold bg-[#fafafb] p-2.5 border border-gray-100 rounded-xl">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!!(product.specifications && Object.keys(product.specifications).length > 0) && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Technische Spezifikationen</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#fafafb] rounded-xl p-4 border border-gray-150/80 shadow-3xs">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center text-xs pb-1 border-b border-gray-200/60 last:border-b-0 gap-2">
                            <span className="text-gray-500 font-bold">{key}</span>
                            <span className="text-gray-900 font-black text-right truncate max-w-[150px]">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pricing row & Checkout add */}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <div className="flex items-baseline justify-between bg-slate-50/70 py-2.5 px-4 rounded-xl border border-gray-100">
                  <span className="text-xs text-gray-500 font-black uppercase tracking-wider">
                    Sonderpreis heute:
                  </span>
                  <div className="flex items-baseline gap-2">
                    {product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {product.originalPrice.toFixed(2)} €
                      </span>
                    )}
                    <span className="font-mono text-xl sm:text-2xl font-black text-orange-600">
                      {product.price.toFixed(2)} €
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    disabled={isOutOfStock || (!!product.colors?.length && !selectedColor) || (!!product.sizes?.length && !selectedSize)}
                    onClick={() => {
                      if (product.colors?.length && !selectedColor) return;
                      if (product.sizes?.length && !selectedSize) return;
                      onAddToCart(
                        product,
                        1,
                        selectedColor || undefined,
                        selectedSize || undefined,
                      );
                      onClose();
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-black transition-all duration-200 ${
                      isOutOfStock ||
                      (!!product.colors?.length && !selectedColor) ||
                      (!!product.sizes?.length && !selectedSize)
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                        : "bg-orange-600 text-white hover:bg-orange-700 active:scale-98 shadow-md shadow-orange-600/10 cursor-pointer text-[13px]"
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4 text-white shrink-0" />
                    {isOutOfStock
                      ? "Ausverkauft"
                      : "In den Warenkorb legen"}
                  </button>
                </div>

                {/* Services details inline */}
                <div className="grid grid-cols-3 gap-2 pt-1 text-[9px] text-gray-550 text-center font-bold">
                  <div className="flex flex-col items-center gap-1.5 p-2 bg-[#fcfdfe] border border-blue-50 rounded-xl shadow-3xs">
                    <Truck className="h-4 w-4 text-orange-600" />
                    <span className="uppercase text-[8px] tracking-wider text-slate-800">Express Lieferung</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 p-2 bg-[#fcfdfe] border border-blue-50 rounded-xl shadow-3xs">
                    <ShieldCheck className="h-4 w-4 text-orange-600" />
                    <span className="uppercase text-[8px] tracking-wider text-slate-800">2 Jahre Garantie</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 p-2 bg-[#fcfdfe] border border-blue-50 rounded-xl shadow-3xs">
                    <RefreshCw className="h-4 w-4 text-orange-600" />
                    <span className="uppercase text-[8px] tracking-wider text-slate-800">90T Rückgabe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lower interactive section: Tab Split for Reviews vs. Recommendations */}
          <div className="mt-8 border-t border-gray-150 pt-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* LEFT COLUMN: Customer Comments */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-orange-500" />
                    Kundenbewertungen ({reviewsList.length})
                  </h4>
                  <div className="rounded bg-gray-50 border border-gray-150 px-20 py-0.5 font-mono text-xs font-bold text-orange-500">
                    Schnitt: {product.rating.toFixed(1)} / 5
                  </div>
                </div>

                {/* Review Form */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-800">
                      {currentUser.isLoggedIn
                        ? "Ihre Bewertung verfassen"
                        : "Als Händler oder Käufer bewerten"}
                    </p>

                    {/* Switch state helper in-app to test */}
                    <button
                      type="button"
                      onClick={onToggleUser}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 hover:text-orange-500 transition-colors"
                    >
                      {currentUser.isLoggedIn ? (
                        <>
                          <UserCheck className="h-3 w-3" />
                          Angemeldet als {currentUser.name}
                        </>
                      ) : (
                        <>
                          <LogIn className="h-3 w-3" />
                          Als Premium-Kunde einloggen (Test)
                        </>
                      )}
                    </button>
                  </div>

                  {currentUser.isLoggedIn ? (
                    <form onSubmit={handleReviewSubmit} className="space-y-3.5">
                      {/* Interactive star selector with hover support */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-gray-500">
                          Sternevergabe:
                        </span>
                        <div className="flex text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const ratingValue = i + 1;
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setNewRating(ratingValue)}
                                onMouseEnter={() =>
                                  setHoveredRating(ratingValue)
                                }
                                onMouseLeave={() => setHoveredRating(null)}
                                className="transition-transform hover:scale-110 focus:outline-none"
                              >
                                <Star
                                  className={`h-4.5 w-4.5 cursor-pointer fill-current ${
                                    ratingValue <=
                                    (hoveredRating !== null
                                      ? hoveredRating
                                      : newRating)
                                      ? "text-amber-400"
                                      : "text-gray-200"
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Comment body input */}
                      <div className="relative">
                        <textarea
                          rows={2}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Teilen Sie Ihre Erfahrungen mit diesem Designprodukt... (Zustand, Optik, Haptik)"
                          className="w-full rounded-xl border border-gray-250 bg-white p-3 text-xs text-gray-900 placeholder-gray-450 outline-none focus:border-orange-500"
                        />
                      </div>

                      {formError && (
                        <p className="text-[11px] text-red-650 font-semibold">
                          {formError}
                        </p>
                      )}

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="rounded-xl bg-orange-500 border border-orange-600 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          Abschicken
                          <Send className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="rounded-lg bg-white p-3 text-center border border-gray-150">
                      <p className="text-[11px] text-gray-500">
                        Nur registrierte Käufer unseres Concept-Stores können
                        Bewertungen hinterlassen.
                      </p>
                      <button
                        onClick={onToggleUser}
                        type="button"
                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-orange-50 border border-orange-100 px-3 py-1.5 text-[10px] font-extrabold text-orange-600 hover:bg-orange-100"
                      >
                        <LogIn className="h-3.5 w-3.5" />
                        Jetzt mit Demo-Konto einloggen & testen
                      </button>
                    </div>
                  )}
                </div>

                {/* Display Feed lists */}
                <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1.5 scrollbar-thin">
                  {reviewsList.length === 0 ? (
                    <p className="text-xs text-gray-400 italic text-center py-4">
                      Noch keine Kundenbewertung veröffentlicht. Seien Sie der
                      Erste!
                    </p>
                  ) : (
                    [...reviewsList].reverse().map((rev) => (
                      <div
                        key={rev.id}
                        className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-sans text-xs font-black text-gray-800">
                              {rev.userName}
                            </span>
                            {rev.isRegistered && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-600">
                                Verifizierter Käufer
                              </span>
                            )}
                          </div>

                          <div className="flex text-amber-500">
                            {Array.from({ length: 5 }).map((_, st) => (
                              <Star
                                key={st}
                                className={`h-2.5 w-2.5 fill-current ${
                                  st < rev.rating
                                    ? "text-amber-400"
                                    : "text-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-gray-650 font-semibold leading-normal">
                          {rev.comment}
                        </p>

                        <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{rev.date}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Suggestions */}
              <div className="lg:col-span-5 space-y-5">
                <div className="border-b border-gray-100 pb-3">
                  <h4 className="text-sm font-black text-gray-900 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-orange-500 animate-spin" />
                    Das könnte Ihnen gefallen
                  </h4>
                </div>

                <div className="space-y-3.5">
                  {combinedRecommendations.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">
                      Noch keine weiteren Empfehlungen verfügbar.
                    </p>
                  ) : (
                    combinedRecommendations.map((rec) => {
                      const isFromHistory =
                        browsingHistory.includes(rec.id) &&
                        rec.category !== product.category;
                      return (
                        <div
                          key={rec.id}
                          onClick={() => onViewProduct(rec)}
                          className="group flex gap-3 rounded-xl border border-gray-200 bg-gray-50 p-2.5 cursor-pointer hover:bg-white hover:border-orange-300 hover:shadow-sm transition-all duration-200"
                        >
                          {/* Suggestion thumbnail */}
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white border border-gray-200">
                            <img
                              src={rec.imageUrl}
                              alt={rec.title}
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover transition-transform group-hover:scale-105 duration-300"
                            />
                          </div>

                          {/* Data box description */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-baseline gap-1">
                                <h5 className="text-xs font-black text-gray-800 group-hover:text-orange-600 transition-colors truncate">
                                  {rec.title}
                                </h5>
                                <span className="font-mono text-xs font-bold text-orange-600 shrink-0">
                                  {rec.price.toFixed(2)} €
                                </span>
                              </div>
                              <p className="text-[9px] text-gray-500 truncate mt-0.5">
                                {rec.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[8px] uppercase font-bold tracking-wider text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                                {isFromHistory
                                  ? "Zuletzt angesehen"
                                  : "Ähnliche Kategorie"}
                              </span>
                              <span className="text-[9px] font-bold text-gray-400 group-hover:underline">
                                Details ansehen
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Micro educational widget on browsers cookies block */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3.5">
                  <p className="text-[10px] text-gray-500 leading-normal font-bold">
                    <strong>Smarter Spar-Algorithmus</strong>: Empfehlungen
                    beruhen auf physikalischen Analogien der Produktgruppen
                    sowie Ihrem lokalen Verlauf. Keine Cookie-Weitergabe an
                    Dritte.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
