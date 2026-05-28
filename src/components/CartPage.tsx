/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Ticket,
  Percent,
  Lock,
  ChevronRight,
  MapPin,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Landmark,
  Printer,
  ArrowLeft,
  Mail,
  Truck,
} from "lucide-react";
import { CartItem, Product, Order } from "../types";

interface CartPageProps {
  cartItems: CartItem[];
  products: Product[];
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
  onClearCart: () => void;
  onOrderCompleted: (order: Order) => void;
  onBackToShop: () => void;
}

export default function CartPage({
  cartItems,
  products,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCompleted,
  onBackToShop,
}: CartPageProps) {
  // Navigation internal stepper state
  // Step 1: Review Cart
  // Step 2: Delivery & Shipping
  // Step 3: Payment Choice
  // Step 4: Processing order
  // Step 5: Order complete receipt
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Promo Coupon Codes
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Step 2 form (Versand)
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [addressErrors, setAddressErrors] = useState<{ [key: string]: string }>(
    {},
  );

  // Step 3 form (Zahlungsweise)
  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "paypal" | "klarna"
  >("card");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [klarnaEmail, setKlarnaEmail] = useState("");
  const [klarnaBirthdate, setKlarnaBirthdate] = useState("");
  const [paymentErrors, setPaymentErrors] = useState<{ [key: string]: string }>(
    {},
  );

  // Receipt details states
  const [orderId, setOrderId] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [loadingText, setLoadingText] = useState(
    "Verschlüsselte Verbindung aufbauen...",
  );

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );

  // Coupon processing codes
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");
    const code = couponCode.trim().toUpperCase();

    if (code === "WELCOME10") {
      setDiscountPercent(10);
      setCouponSuccess("10% Gutschein erfolgreich freigeschaltet!");
    } else if (code === "SINSHOP25" || code === "SUPERDEAL25") {
      setDiscountPercent(25);
      setCouponSuccess("Premium-Vorteil gewährt: 25% Rabatt erzielt!");
    } else if (code === "BLITZ30") {
      setDiscountPercent(30);
      setCouponSuccess("Blitz-Rabatt: 30% Rabatt optimal angerechnet!");
    } else if (code === "") {
      setCouponError("Bitte Gutscheincode eintragen.");
    } else {
      setCouponError(
        "Gutschein unbekannt. Versuchen Sie BLITZ30, SUPERDEAL25 oder WELCOME10",
      );
    }
  };

  const discountValue = subtotal * (discountPercent / 100);
  const shippingCost = subtotal > 150 || subtotal === 0 ? 0 : 4.9;
  const total = subtotal - discountValue + shippingCost;

  // Mask / helper formats
  const handleCardNumberChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, "").substring(0, 16);
    const masked = cleanValue.match(/.{1,4}/g)?.join(" ") || cleanValue;
    setCardNumber(masked);
  };

  const handleExpiryChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, "").substring(0, 4);
    if (cleanValue.length >= 3) {
      setCardExpiry(
        `${cleanValue.substring(0, 2)}/${cleanValue.substring(2, 4)}`,
      );
    } else {
      setCardExpiry(cleanValue);
    }
  };

  const handleCvvChange = (value: string) => {
    setCardCvv(value.replace(/\D/g, "").substring(0, 3));
  };

  // Validators
  const validateAddress = () => {
    const errors: { [key: string]: string } = {};
    if (!customerName.trim())
      errors.customerName = "Vollständiger Name ist erforderlich";
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      errors.email = "Gültige E-Mail-Adresse erforderlich";
    if (!address.trim())
      errors.address = "Straße und Hausnummer sind erforderlich";
    if (!city.trim()) errors.city = "Empfängerstadt ist erforderlich";
    if (!zipCode.trim()) errors.zipCode = "Postleitzahl ist erforderlich";

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePayment = () => {
    const errors: { [key: string]: string } = {};
    if (paymentMethod === "card") {
      if (!cardHolder.trim())
        errors.cardHolder = "Karteninhaber ist erforderlich";
      if (cardNumber.replace(/\s/g, "").length !== 16)
        errors.cardNumber =
          "Gültige Kreditkartennummer erforderlich (16 Ziffern)";
      if (!cardExpiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/))
        errors.cardExpiry = "Korrektes Datum erforderlich (MM/JJ)";
      if (cardCvv.length !== 3)
        errors.cardCvv = "CVC Code ist erforderlich (3 Ziffern)";
    } else if (paymentMethod === "paypal") {
      if (!paypalEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
        errors.paypalEmail = "Gültige PayPal E-Mail erforderlich";
    } else if (paymentMethod === "klarna") {
      if (!klarnaEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
        errors.klarnaEmail = "Gültige E-Mail erforderlich";
      if (!klarnaBirthdate)
        errors.klarnaBirthdate = "Geburtsdatum erforderlich";
    }

    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitAddressForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAddress()) {
      setStep(3);
    }
  };

  const submitPaymentForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePayment()) {
      setStep(4);
    }
  };

  // Secure connection simulation
  useEffect(() => {
    if (step === 4) {
      const phrases = [
        "Verschlüsselte Verbindung mit Bankdienst aufbauen...",
        "Sicherheitszertifikate prüfen und validieren...",
        "Händlerkonto mit Zahlungsstelle abgleichen...",
        "Zahlungsabsicherung und Autorisierung läuft...",
        "Transaktionsnachweis generieren...",
        "Warenbestand wird reserviert und aktualisiert...",
      ];

      let idx = 0;
      const interval = setInterval(() => {
        if (idx < phrases.length - 1) {
          idx++;
          setLoadingText(phrases[idx]);
        } else {
          clearInterval(interval);
          const generatedId = `SIN-FULL-${Math.floor(100000 + Math.random() * 900000)}`;
          const formattedDate = new Date().toLocaleDateString("de-DE", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
          setOrderId(generatedId);
          setOrderDate(formattedDate);

          const completedOrder: Order = {
            id: generatedId,
            items: [...cartItems],
            subtotal,
            shipping: shippingCost,
            total,
            customerName: customerName || "Christian Müller",
            email: email || "christian.mueller@example.com",
            address: address || "Musterweg 123",
            city: city || "Berlin",
            zipCode: zipCode || "12345",
            paymentMethod: paymentMethod === "card" ? "Kreditkarte" : paymentMethod === "paypal" ? "PayPal" : "Klarna",
            date: formattedDate,
          };

          setStep(5);
          onOrderCompleted(completedOrder);
          onClearCart();
        }
      }, 600);

      return () => clearInterval(interval);
    }
  }, [step, onOrderCompleted, onClearCart]);

  // Printable document
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 pb-12 text-gray-900" id="cart-page-view">
      {/* Page Title & Navigation Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-150 pb-5">
        <div>
          <button
            onClick={onBackToShop}
            className="group mb-2 inline-flex items-center gap-1.5 text-xs font-black text-orange-605 hover:text-orange-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Zurück zum Store
          </button>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-orange-600" />
            Ihr Warenkorb & Checkout
          </h1>
          <p className="text-xs text-gray-500 font-bold">
            Transparenter Bestellvorgang mit erstklassigem Käuferschutz
          </p>
        </div>

        {/* Dynamic Horizontal Stepper indicator */}
        {step !== 5 && (
          <div className="flex items-center gap-2 rounded-xl bg-gray-100 border border-gray-200 px-4 py-2 text-xs">
            <button
              onClick={() => step > 1 && setStep(1)}
              disabled={step === 4}
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                step >= 1
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              1
            </button>
            <span
              className={`font-black ${step === 1 ? "text-orange-600" : "text-gray-550"}`}
            >
              Warenkorb
            </span>

            <ChevronRight className="h-3 w-3 text-gray-350" />

            <button
              onClick={() => step > 2 && setStep(2)}
              disabled={step < 2 || step === 4}
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                step >= 2
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              2
            </button>
            <span
              className={`font-black ${step === 2 ? "text-orange-600" : "text-gray-550"}`}
            >
              Versand
            </span>

            <ChevronRight className="h-3 w-3 text-gray-350" />

            <button
              onClick={() => step > 3 && setStep(3)}
              disabled={step < 3 || step === 4}
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                step >= 3
                  ? "bg-orange-500 text-white shadow-sm"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              3
            </button>
            <span
              className={`font-black ${step === 3 ? "text-orange-600" : "text-gray-550"}`}
            >
              Zahlung
            </span>
          </div>
        )}
      </div>

      {cartItems.length === 0 && step !== 4 && step !== 5 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 text-center space-y-4 shadow-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-50 border border-gray-150 text-gray-450 animate-bounce">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-black text-gray-800">
            Ihr Warenkorb ist derzeit leer
          </h3>
          <p className="text-xs text-gray-500 max-w-sm font-bold">
            Fügen Sie einige unserer sorgfältig hergestellten
            Bestseller-Designprodukte hinzu, um mit der sicheren Kasse
            fortzufahren.
          </p>
          <button
            onClick={onBackToShop}
            className="mt-2 rounded-xl bg-orange-500 px-6 py-3 text-xs font-black text-white hover:bg-orange-600 active:scale-95 transition-all shadow-md shadow-orange-500/10 cursor-pointer"
          >
            Jetzt Store erkunden
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* LEFT AREA: Depends on current Checkout Step */}
          <div className="lg:col-span-7 space-y-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Detail List */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-4"
                >
                  <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 shadow-sm">
                    <h2 className="text-base font-black text-gray-950 flex items-center gap-2 border-b border-gray-100 pb-3">
                      <ShoppingBag className="h-4 w-4 text-orange-605" />
                      Ausgewählte Artikel (
                      {cartItems.reduce((acc, i) => acc + i.quantity, 0)})
                    </h2>

                    <div className="divide-y divide-gray-100">
                      {cartItems.map((item, idx) => (
                        <div
                          key={`${item.product.id}-${idx}`}
                          className="flex flex-col sm:flex-row gap-4 py-4 first:pt-0 last:pb-0"
                        >
                          {/* Image thumbnail */}
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white border border-gray-200 shadow-xs">
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.title}
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover"
                            />
                          </div>

                          {/* Titles / Adjustments */}
                          <div className="flex flex-1 flex-col justify-between">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-sans text-sm font-bold text-gray-900">
                                  {item.product.title}
                                </h4>
                                <span className="flex items-center gap-2 mt-1">
                                  <span className="text-[9px] text-gray-400 uppercase font-extrabold tracking-wider bg-gray-50 border border-gray-150 px-1.5 py-0.5 rounded">
                                    {item.product.category}
                                  </span>
                                  {item.selectedColor && (
                                    <span
                                      className="h-2 w-2 rounded-full border border-gray-300"
                                      style={{
                                        backgroundColor: item.selectedColor,
                                      }}
                                      title="Gewählte Farbe"
                                    />
                                  )}
                                  {item.selectedSize && (
                                    <span className="text-[9px] text-gray-600 bg-gray-100 rounded px-1 min-w-4 text-center font-black">
                                      {item.selectedSize}
                                    </span>
                                  )}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  onRemoveItem(
                                    item.product.id,
                                    item.selectedColor,
                                    item.selectedSize,
                                  )
                                }
                                className="text-gray-400 transition-colors hover:text-red-650 p-1 cursor-pointer"
                                title="Produkt entfernen"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between gap-4 mt-3">
                              {/* Quantity inputs */}
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
                                  className="flex h-6 w-6 items-center justify-center rounded text-gray-450 hover:bg-gray-50 hover:text-gray-950 disabled:pointer-events-none disabled:opacity-20 cursor-pointer"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-8 text-center text-xs font-black text-gray-900">
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
                                  className="flex h-6 w-6 items-center justify-center rounded text-gray-450 hover:bg-gray-50 hover:text-gray-950 disabled:pointer-events-none disabled:opacity-20 cursor-pointer"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              {/* Price tags */}
                              <div className="text-right">
                                <p className="font-mono text-sm font-black text-orange-600">
                                  {(item.product.price * item.quantity).toFixed(
                                    2,
                                  )}{" "}
                                  €
                                </p>
                                <p className="text-[10px] text-gray-400 font-bold">
                                  ({item.product.price.toFixed(2)} € / Stk.)
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick navigation actions */}
                    <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <p className="text-xs text-gray-505 font-semibold">
                        Bestellungen über 150 € qualifizieren sich für{" "}
                        <span className="text-emerald-600 font-black">
                          Gratis Premium-Versand
                        </span>
                        !
                      </p>
                      <button
                        onClick={() => setStep(2)}
                        className="rounded-xl bg-orange-500 px-6 py-3 text-xs font-black text-white flex items-center gap-1.5 transition-all hover:bg-orange-600 active:scale-95 shadow-md shadow-orange-500/10 cursor-pointer"
                      >
                        Weiter zum Versand
                        <ChevronRight className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Shipping Info Form */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                >
                  <form
                    onSubmit={submitAddressForm}
                    className="rounded-2xl border border-gray-200 bg-white p-5 space-y-6 shadow-sm"
                  >
                    <h3 className="text-base font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                      <MapPin className="h-5 w-5 text-orange-600" />
                      1. Lieferanschrift & Kontaktempfänger
                    </h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="col-span-1 sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-gray-650">
                          Vollständiger Name des Empfängers
                        </label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="z. B. Christian Müller"
                          className="w-full rounded-xl border border-gray-250 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 focus:bg-white transition-all font-semibold"
                        />
                        {addressErrors.customerName && (
                          <p className="text-[11px] text-red-650 font-bold">
                            {addressErrors.customerName}
                          </p>
                        )}
                      </div>

                      <div className="col-span-1 sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-gray-650">
                          E-Mail-Adresse für Bestellbestätigung
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="z. B. christian.mueller@example.com"
                          className="w-full rounded-xl border border-gray-250 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 focus:bg-white transition-all font-semibold"
                        />
                        {addressErrors.email && (
                          <p className="text-[11px] text-red-650 font-bold">
                            {addressErrors.email}
                          </p>
                        )}
                      </div>

                      <div className="col-span-1 sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-gray-650">
                          Straße und Hausnummer
                        </label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Musterweg 127b"
                          className="w-full rounded-xl border border-gray-250 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 focus:bg-white transition-all font-semibold"
                        />
                        {addressErrors.address && (
                          <p className="text-[11px] text-red-650 font-bold">
                            {addressErrors.address}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-650">
                          Postleitzahl (PLZ)
                        </label>
                        <input
                          type="text"
                          required
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          placeholder="z. B. 10115"
                          className="w-full rounded-xl border border-gray-250 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 focus:bg-white transition-all font-semibold"
                        />
                        {addressErrors.zipCode && (
                          <p className="text-[11px] text-red-650 font-bold">
                            {addressErrors.zipCode}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-650">
                          Ort / Stadt
                        </label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="z. B. Berlin"
                          className="w-full rounded-xl border border-gray-250 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 focus:bg-white transition-all font-semibold"
                        />
                        {addressErrors.city && (
                          <p className="text-[11px] text-red-650 font-bold">
                            {addressErrors.city}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-2.5 text-xs font-black text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        Zurück zum Warenkorb
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-orange-500 px-6 py-3 text-xs font-black text-white flex items-center gap-1.5 transition-all hover:bg-orange-650 active:scale-95 shadow-md shadow-orange-500/10 cursor-pointer"
                      >
                        Weiter zur Bezahlung
                        <ChevronRight className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 3: Payment Choice */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                >
                  <form
                    onSubmit={submitPaymentForm}
                    className="rounded-2xl border border-gray-200 bg-white p-5 space-y-6 shadow-sm"
                  >
                    <h3 className="text-base font-black text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                      <CreditCard className="h-5 w-5 text-orange-600" />
                      2. Sichere Zahlungsabwicklung wählen
                    </h3>

                    {/* Tabs switcher */}
                    <div className="grid grid-cols-3 gap-2 border bg-gray-50 p-1 border-gray-200 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`flex flex-col sm:flex-row items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all cursor-pointer ${
                          paymentMethod === "card"
                            ? "bg-orange-50 text-orange-600 border border-orange-200 shadow-xs"
                            : "text-gray-500 hover:bg-gray-105"
                        }`}
                      >
                        <CreditCard className="h-4 w-4" />
                        Kreditkarte
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("paypal")}
                        className={`flex flex-col sm:flex-row items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all cursor-pointer ${
                          paymentMethod === "paypal"
                            ? "bg-orange-50 text-orange-600 border border-orange-200 shadow-xs"
                            : "text-gray-500 hover:bg-gray-105"
                        }`}
                      >
                        <Mail className="h-4 w-4" />
                        PayPal
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("klarna")}
                        className={`flex flex-col sm:flex-row items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all cursor-pointer ${
                          paymentMethod === "klarna"
                            ? "bg-orange-50 text-orange-600 border border-orange-200 shadow-xs"
                            : "text-gray-500 hover:bg-gray-105"
                        }`}
                      >
                        <Landmark className="h-4 w-4" />
                        Klarna
                      </button>
                    </div>

                    {/* Kreditkarte options */}
                    {paymentMethod === "card" && (
                      <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-650">
                            Name des Karteninhabers
                          </label>
                          <input
                            type="text"
                            required
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            placeholder="z. B. Christian Müller"
                            className="w-full rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 transition-all font-semibold"
                          />
                          {paymentErrors.cardHolder && (
                            <p className="text-[11px] text-red-650 font-bold">
                              {paymentErrors.cardHolder}
                            </p>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-650">
                            Kreditkartennummer
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              value={cardNumber}
                              onChange={(e) =>
                                handleCardNumberChange(e.target.value)
                              }
                              placeholder="4123 4567 8901 2345"
                              className="w-full rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 pl-10 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 transition-all font-semibold"
                            />
                            <CreditCard className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                          </div>
                          {paymentErrors.cardNumber && (
                            <p className="text-[11px] text-red-650 font-bold">
                              {paymentErrors.cardNumber}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-650">
                              Ablaufdatum (MM/JJ)
                            </label>
                            <input
                              type="text"
                              required
                              value={cardExpiry}
                              onChange={(e) =>
                                handleExpiryChange(e.target.value)
                              }
                              placeholder="12/29"
                              className="w-full rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 text-xs text-center text-gray-900 placeholder-gray-700 outline-none focus:border-orange-500 font-semibold"
                            />
                            {paymentErrors.cardExpiry && (
                              <p className="text-[11px] text-red-650 font-bold">
                                {paymentErrors.cardExpiry}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-650">
                              CVV / CVC Code
                            </label>
                            <input
                              type="password"
                              required
                              value={cardCvv}
                              onChange={(e) => handleCvvChange(e.target.value)}
                              placeholder="123"
                              className="w-full rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 text-xs text-center text-gray-900 placeholder-gray-700 outline-none focus:border-orange-500 font-semibold"
                            />
                            {paymentErrors.cardCvv && (
                              <p className="text-[11px] text-red-650 font-bold">
                                {paymentErrors.cardCvv}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PayPal choice */}
                    {paymentMethod === "paypal" && (
                      <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs text-gray-500 font-semibold">
                          Sie werden zur Autorisierung direkt in einem sicheren
                          Fenster zu PayPal weitergeleitet.
                        </p>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-650">
                            PayPal E-Mail-Adresse
                          </label>
                          <input
                            type="email"
                            required
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                            placeholder="z. B. kundenkonto@paypal.de"
                            className="w-full rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 transition-all font-semibold"
                          />
                          {paymentErrors.paypalEmail && (
                            <p className="text-[11px] text-red-650 font-bold">
                              {paymentErrors.paypalEmail}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Klarna choice */}
                    {paymentMethod === "klarna" && (
                      <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs text-gray-500 font-semibold">
                          Mit Klarna kaufen Sie bequem auf Rechnung. Zahlung
                          erst nach Erhalt der Ware innerhalb von 30 Tagen.
                        </p>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-650">
                              Klarna E-Mail-Adresse
                            </label>
                            <input
                              type="email"
                              required
                              value={klarnaEmail}
                              onChange={(e) => setKlarnaEmail(e.target.value)}
                              placeholder="kundendienst@klarna.de"
                              className="w-full rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 font-semibold"
                            />
                            {paymentErrors.klarnaEmail && (
                              <p className="text-[11px] text-red-650 font-bold">
                                {paymentErrors.klarnaEmail}
                              </p>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-650">
                              Geburtsdatum
                            </label>
                            <input
                              type="date"
                              required
                              value={klarnaBirthdate}
                              onChange={(e) =>
                                setKlarnaBirthdate(e.target.value)
                              }
                              className="w-full rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 text-xs text-gray-900 outline-none focus:border-orange-500 font-semibold"
                            />
                            {paymentErrors.klarnaBirthdate && (
                              <p className="text-[11px] text-red-650 font-bold">
                                {paymentErrors.klarnaBirthdate}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-2.5 text-xs font-black text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        Zurück zum Versand
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-black text-white hover:bg-orange-660 active:scale-95 transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                      >
                        Kauf abschließen ({total.toFixed(2)} €)
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 4: Loading progress processing */}
              {step === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl border border-gray-250 bg-gray-50 p-8 text-center space-y-6 shadow-sm"
                >
                  <div className="relative flex items-center justify-center py-4">
                    <Loader2 className="h-14 w-14 animate-spin text-orange-500" />
                    <div className="absolute h-8 w-8 rounded-full bg-orange-500/10 blur-md"></div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-gray-900">
                      Sichere Abrechnung wird verarbeitet
                    </h3>
                    <p className="text-xs text-gray-550 max-w-sm mx-auto font-bold">
                      Bitte aktualisieren oder verlassen Sie diese Seite nicht.
                      Wir verarbeiten Ihre Zahlung absolut verschlüsselt und
                      sicher.
                    </p>
                  </div>

                  <div className="inline-block rounded-full bg-orange-50 border border-orange-100 px-5 py-1.5 text-xs font-mono font-bold text-orange-650">
                    {loadingText}
                  </div>
                </motion.div>
              )}

              {/* Step 5: Success Receipt Panel */}
              {step === 5 && (
                <motion.div
                  key="step-5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div
                    className="rounded-2xl border border-gray-200 bg-white p-6 space-y-6 shadow-sm"
                    id="printable-area"
                  >
                    {/* Tick box banner */}
                    <div className="text-center py-4 space-y-2 border-b border-gray-100">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20">
                        <CheckCircle2 className="h-7 w-7 text-white" />
                      </div>
                      <h2 className="text-xl font-black text-gray-950">
                        Bestellung erfolgreich abgeschlossen!
                      </h2>
                      <p className="text-xs text-gray-500 max-w-sm mx-auto font-bold">
                        Vielen Dank für Ihre Bestellung! Die Auftragsbestätigung
                        und Rechnung wurden an Ihre E-Mail gesendet.
                      </p>
                    </div>

                    {/* Detailed Invoice summary values */}
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100 text-xs">
                      <div>
                        <p className="font-bold text-gray-400 text-[9px] uppercase">
                          Bestellnummer
                        </p>
                        <p className="font-mono text-xs font-extrabold text-gray-900 mt-1">
                          {orderId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-400 text-[9px] uppercase">
                          Bestelldatum
                        </p>
                        <p className="font-sans text-xs font-extrabold text-gray-900 mt-1">
                          {orderDate}
                        </p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-400 text-[9px] uppercase">
                          Versandadresse
                        </p>
                        <div className="text-gray-900 mt-1 font-extrabold">
                          {customerName}
                        </div>
                        <div className="text-gray-500 font-medium">
                          {address}
                        </div>
                        <div className="text-gray-500 font-medium">
                          {zipCode} {city}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-400 text-[9px] uppercase">
                          Zahlungsmethode
                        </p>
                        <p className="text-gray-900 font-extrabold uppercase mt-1">
                          {paymentMethod}
                        </p>
                        <p className="text-gray-500 font-medium">{email}</p>
                      </div>
                    </div>

                    {/* Interactive buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handlePrint}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-xs font-black text-gray-700 transition-all hover:bg-gray-55 active:scale-95 cursor-pointer"
                      >
                        <Printer className="h-4 w-4 text-orange-600" />
                        Bestellbeleg drucken / PDF
                      </button>
                      <button
                        onClick={onBackToShop}
                        className="flex-1 rounded-xl bg-orange-500 py-3 text-xs font-black text-white hover:bg-orange-600 active:scale-95 shadow-md shadow-orange-500/10 cursor-pointer"
                      >
                        Einkauf fortsetzen
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT AREA: Permanent Order Invoice Summary Details */}
          {step !== 5 && (
            <div className="lg:col-span-12 xl:col-span-5 space-y-6">
              {/* Stepper Summary invoice paper */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 border-b border-gray-100 pb-3">
                  Bestellzusammenfassung
                </h3>

                {/* Micro Item Row Lists */}
                <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1.5 scrollbar-thin">
                  {cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex justify-between items-center text-xs"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-gray-800 font-extrabold truncate max-w-[150px]">
                          {item.product.title}
                        </span>
                        <span className="text-[10px] font-black text-orange-600 uppercase">
                          x{item.quantity}
                        </span>
                      </div>
                      <span className="font-mono text-gray-700 font-bold">
                        {(item.product.price * item.quantity).toFixed(2)} €
                      </span>
                    </div>
                  ))}
                </div>

                {/* Promo Code input block */}
                {step !== 4 && (
                  <form
                    onSubmit={handleApplyCoupon}
                    className="flex gap-2 border-t border-gray-100 pt-3"
                  >
                    <div className="relative flex-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                        <Ticket className="h-3.5 w-3.5" />
                      </div>
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Gutscheincode"
                        className="w-full rounded-xl border border-gray-250 bg-gray-50 py-2 pl-9 pr-3 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 focus:bg-white transition-all font-semibold"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-extrabold text-gray-700 hover:bg-gray-50"
                    >
                      Anwenden
                    </button>
                  </form>
                )}

                {/* Coupon Feedback alert lines */}
                {couponError && (
                  <p className="text-[10px] text-red-650 font-bold">
                    {couponError}
                  </p>
                )}
                {couponSuccess && (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                    <Percent className="h-3 w-3 shrink-0" />
                    {couponSuccess}
                  </div>
                )}

                {/* Invoice rows calculation details */}
                <div className="border-t border-gray-150 pt-3.5 space-y-2.5 text-xs text-gray-500 font-semibold">
                  <div className="flex justify-between">
                    <span>Zwischensumme:</span>
                    <span className="font-mono text-gray-900">
                      {subtotal.toFixed(2)} €
                    </span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-600 font-extrabold">
                      <span>Rabatt ({discountPercent}%):</span>
                      <span className="font-mono">
                        -{discountValue.toFixed(2)} €
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Versand:</span>
                    <span className="font-mono">
                      {shippingCost === 0 ? (
                        <span className="text-emerald-600 font-black">
                          KOSTENLOS
                        </span>
                      ) : (
                        `${shippingCost.toFixed(2)} €`
                      )}
                    </span>
                  </div>

                  {shippingCost > 0 && (
                    <p className="text-[10px] text-gray-400 leading-normal font-bold">
                      (Tipp: Fügen Sie Artikel für {(150 - subtotal).toFixed(2)}{" "}
                      € hinzu für kostenfreien Versand!)
                    </p>
                  )}

                  <div className="border-t border-gray-100 pt-2.5 flex justify-between text-sm font-black text-gray-900">
                    <span>Gesamtsumme (inkl. MwSt.):</span>
                    <span className="font-mono text-orange-605 text-base">
                      {total.toFixed(2)} €
                    </span>
                  </div>
                </div>

                {/* Käuferschutz banner list */}
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 space-y-2 text-[10px] text-gray-505 font-bold">
                  <div className="flex items-start gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-orange-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>100% SSL Verschlüsselt</strong>: Ihre
                      Zahlungsdaten werden niemals gespeichert.
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-orange-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>CO2-Neutraler Premium-Versand</strong>:
                      Blitzschnelle Auslieferung via DHL GoGreen.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
