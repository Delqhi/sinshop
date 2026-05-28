/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Ticket,
  Percent,
  Lock,
} from "lucide-react";
import { CartItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (
    productId: string,
    quantity: number,
    selectedColor?: string,
    selectedSize?: string,
  ) => void;
  onRemoveItem: (
    productId: string,
    selectedColor?: string,
    selectedSize?: string,
  ) => void;
  onCheckout: (appliedDiscount: { code: string; percent: number }) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );

  // Custom coupon validations
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");
    const code = couponCode.trim().toUpperCase();

    if (code === "WELCOME10") {
      setDiscountPercent(10);
      setCouponSuccess("10% Gutscheincode erfolgreich angewendet!");
    } else if (code === "SINSHOP25" || code === "SUPERDEAL25") {
      setDiscountPercent(25);
      setCouponSuccess("Spektakuläre 25% Rabatt gewährt!");
    } else if (code === "BLITZ30") {
      setDiscountPercent(30);
      setCouponSuccess("Premium 30% Rabatt gewährt!");
    } else if (code === "CONCEPT20") {
      setDiscountPercent(20);
      setCouponSuccess("Zukunfts-Rabatt von 20% angewendet!");
    } else if (code === "") {
      setCouponError("Bitte geben Sie einen Code ein.");
    } else {
      setCouponError(
        "Ungültiger Code. Versuchen Sie BLITZ30, SUPERDEAL25 oder WELCOME10",
      );
    }
  };

  const discountValue = subtotal * (discountPercent / 100);
  const shippingCost = subtotal > 150 || subtotal === 0 ? 0 : 4.9;
  const total = subtotal - discountValue + shippingCost;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm"
          />

          {/* Cart Sliding Canvas Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-gray-200 bg-white p-6 shadow-2xl sm:max-w-lg text-gray-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-orange-600" />
                <h2 className="text-lg font-black text-gray-900">
                  Ihr Warenkorb
                </h2>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-bold text-gray-500">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-950 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Cart Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center px-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 border border-gray-150 text-gray-400 mb-4 animate-bounce">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-black text-gray-800">
                    Warenkorb ist leer
                  </h3>
                  <p className="mt-2 text-xs text-gray-500 max-w-xs font-bold leading-normal">
                    Fügen Sie Produkte hinzu, um mit Ihrer Bestellung
                    fortzufahren. Besuchen Sie unsere Highlights für
                    Schnäppchen-Deals!
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 rounded-xl bg-orange-50 border border-orange-100 px-5 py-2.5 text-xs font-black text-orange-600 transition-colors hover:bg-orange-100 cursor-pointer"
                  >
                    Weiter einkaufen
                  </button>
                </div>
              ) : (
                cartItems.map((item, idx) => (
                  <div
                    key={`${item.product.id}-${idx}`}
                    className="flex gap-4 rounded-xl border border-gray-200 bg-gray-50 p-3 transition-colors hover:border-orange-200"
                  >
                    {/* Item Image */}
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white border border-gray-200">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Meta details */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-sans text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">
                            {item.product.title}
                          </h4>
                          <button
                            onClick={() =>
                              onRemoveItem(
                                item.product.id,
                                item.selectedColor,
                                item.selectedSize,
                              )
                            }
                            className="text-gray-400 transition-colors hover:text-red-650 cursor-pointer"
                            title="Entfernen"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] uppercase font-extrabold text-gray-400">
                            {item.product.category}
                          </span>
                          {item.selectedColor && (
                            <span
                              className="h-2 w-2 rounded-full border border-gray-300"
                              style={{ backgroundColor: item.selectedColor }}
                              title="Gewählte Farbe"
                            />
                          )}
                          {item.selectedSize && (
                            <span className="text-[9px] text-gray-600 bg-gray-100 border border-gray-200 rounded px-1.5 py-[0.5px] font-black">
                              {item.selectedSize}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center rounded-lg border border-gray-250 bg-white p-1">
                          <button
                            disabled={item.quantity <= 1}
                            onClick={() =>
                              onUpdateQuantity(
                                item.product.id,
                                item.quantity - 1,
                                item.selectedColor,
                                item.selectedSize,
                              )
                            }
                            className="flex h-5 w-5 items-center justify-center rounded text-gray-450 hover:bg-gray-50 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-extrabold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            disabled={item.quantity >= item.product.stock}
                            onClick={() =>
                              onUpdateQuantity(
                                item.product.id,
                                item.quantity + 1,
                                item.selectedColor,
                                item.selectedSize,
                              )
                            }
                            className="flex h-5 w-5 items-center justify-center rounded text-gray-450 hover:bg-gray-50 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Price computation */}
                        <span className="font-mono text-sm font-black text-orange-600">
                          {(item.product.price * item.quantity).toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-100 pt-4 space-y-4 bg-white">
                {/* Coupon Code Section */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                      <Ticket className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Gutscheincode (z.B. BLITZ30 / WELCOME10)"
                      className="w-full rounded-xl border border-gray-250 bg-gray-50 py-2 pl-9 pr-3 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 focus:bg-white transition-all font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-white border border-gray-200 px-4 py-2 text-xs font-extrabold text-gray-700 hover:bg-gray-100 active:scale-95 cursor-pointer"
                  >
                    Einlösen
                  </button>
                </form>

                {/* Coupon messages */}
                {couponError && (
                  <p className="text-[11px] text-red-650 font-bold">
                    {couponError}
                  </p>
                )}
                {couponSuccess && (
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-extrabold">
                    <Percent className="h-3 w-3 shrink-0" />
                    {couponSuccess}
                  </div>
                )}

                {/* Subtotals & Final sum */}
                <div className="rounded-xl bg-gray-50 border border-gray-150 p-3.5 space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 font-bold">
                    <span>Zwischensumme:</span>
                    <span className="font-mono">{subtotal.toFixed(2)} €</span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600 font-bold">
                      <span>Rabatt ({discountPercent}%):</span>
                      <span className="font-mono">
                        -{discountValue.toFixed(2)} €
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs text-gray-500 font-bold">
                    <span>Versandkosten:</span>
                    <span className="font-mono">
                      {shippingCost === 0 ? (
                        <span className="text-emerald-600 font-black">
                          Kostenlos
                        </span>
                      ) : (
                        `${shippingCost.toFixed(2)} €`
                      )}
                    </span>
                  </div>

                  {shippingCost > 0 && (
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                      (Kostenloser Versand ab 150.00 € Bestellwert)
                    </p>
                  )}

                  <div className="border-t border-gray-200 pt-2 flex items-center justify-between font-sans text-sm font-bold text-gray-900">
                    <span>Gesamtsumme inkl. MwSt.</span>
                    <span className="font-mono text-base font-black text-orange-600">
                      {total.toFixed(2)} €
                    </span>
                  </div>
                </div>

                {/* Final CTA Buttons */}
                <button
                  id="cart-checkout-btn"
                  onClick={() =>
                    onCheckout({ code: couponCode, percent: discountPercent })
                  }
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/10 transition-all duration-200 hover:bg-orange-650 cursor-pointer"
                >
                  <Lock className="h-4 w-4 text-white" />
                  Sicher zur Kasse
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
