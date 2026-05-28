/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, CreditCard, Mail, CheckCircle2, ChevronRight, Loader2, Landmark, Printer } from 'lucide-react';
import { CartItem } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  discountPercent: number;
  onOrderCompleted: (orderId: string) => void;
  onClearCart: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  discountPercent,
  onOrderCompleted,
  onClearCart,
}: CheckoutModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loadingText, setLoadingText] = useState('Verbindung mit dem Bankenserver herstellen...');
  
  // Deliver Address form state
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [addressErrors, setAddressErrors] = useState<{ [key: string]: string }>({});

  // Payment gateway states
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'klarna'>('card');
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [klarnaEmail, setKlarnaEmail] = useState('');
  const [klarnaBirthdate, setKlarnaBirthdate] = useState('');
  const [paymentErrors, setPaymentErrors] = useState<{ [key: string]: string }>({});

  // Generated Order Details State
  const [orderId, setOrderId] = useState('');
  const [orderDate, setOrderDate] = useState('');

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountValue = subtotal * (discountPercent / 100);
  const shippingCost = subtotal > 150 || subtotal === 0 ? 0 : 4.90;
  const total = subtotal - discountValue + shippingCost;

  // Mask/Format inputs helper
  const handleCardNumberChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').substring(0, 16);
    const masked = cleanValue.match(/.{1,4}/g)?.join(' ') || cleanValue;
    setCardNumber(masked);
  };

  const handleExpiryChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').substring(0, 4);
    if (cleanValue.length >= 3) {
      setCardExpiry(`${cleanValue.substring(0, 2)}/${cleanValue.substring(2, 4)}`);
    } else {
      setCardExpiry(cleanValue);
    }
  };

  const handleCvvChange = (value: string) => {
    setCardCvv(value.replace(/\D/g, '').substring(0, 3));
  };

  // Step 1: Address validations
  const validateAddress = () => {
    const errors: { [key: string]: string } = {};
    if (!customerName.trim()) errors.customerName = 'Vollständiger Name ist erforderlich';
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = 'Gültige E-Mail-Adresse erforderlich';
    if (!address.trim()) errors.address = 'Straße und Hausnummer sind erforderlich';
    if (!city.trim()) errors.city = 'Stadt ist erforderlich';
    if (!zipCode.trim()) errors.zipCode = 'Postleitzahl ist erforderlich';
    
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step 2: Payment gate validations
  const validatePayment = () => {
    const errors: { [key: string]: string } = {};
    if (paymentMethod === 'card') {
      if (!cardHolder.trim()) errors.cardHolder = 'Name des Karteninhabers ist erforderlich';
      if (cardNumber.replace(/\s/g, '').length !== 16) errors.cardNumber = 'Gültige 16-stellige Kreditkartennummer erforderlich';
      if (!cardExpiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) errors.cardExpiry = 'Gültiges Ablaufdatum erforderlich (MM/JJ)';
      if (cardCvv.length !== 3) errors.cardCvv = '3-stelliger CVV-Code erforderlich';
    } else if (paymentMethod === 'paypal') {
      if (!paypalEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.paypalEmail = 'Gültige PayPal E-Mail erforderlich';
    } else if (paymentMethod === 'klarna') {
      if (!klarnaEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.klarnaEmail = 'Gültige E-Mail erforderlich';
      if (!klarnaBirthdate) errors.klarnaBirthdate = 'Geburtsdatum ist erforderlich';
    }

    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitAddressForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAddress()) {
      setStep(2);
    }
  };

  // Start checkout simulation triggers
  const submitPaymentForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePayment()) {
      setStep(3);
    }
  };

  // Verification milestones effect
  useEffect(() => {
    if (step === 3) {
      const texts = [
        'Sichere SSL-Verbindung wird aufgebaut...',
        'Händlerzertifikat wird verifiziert...',
        'Zahlungsmethode wird autorisiert...',
        'Guthaben wird gedeckt...',
        'Transaktions-Quittung wird ausgestellt...',
        'Bestellmappe wird angelegt...'
      ];
      
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex < texts.length - 1) {
          currentIndex++;
          setLoadingText(texts[currentIndex]);
        } else {
          clearInterval(interval);
          // Transition to order success step 4
          const generatedId = `SIN-${Math.floor(100000 + Math.random() * 900000)}`;
          setOrderId(generatedId);
          setOrderDate(new Date().toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }));
          setStep(4);
          onOrderCompleted(generatedId);
          onClearCart();
        }
      }, 700);

      return () => clearInterval(interval);
    }
  }, [step, onOrderCompleted, onClearCart]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-6">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={step !== 3 ? onClose : undefined}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl sm:p-8 text-gray-900"
          >
            {/* Header close button */}
            {step !== 3 && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-950 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            {/* Stepper Status Indicators */}
            {step !== 4 && (
              <div className="mb-8 flex items-center justify-center gap-2 sm:gap-4 border-b border-gray-100 pb-5">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    step >= 1 ? 'bg-orange-500 text-white font-extrabold shadow-sm' : 'bg-gray-100 text-gray-400 border border-gray-150'
                  }`}
                >
                  1
                </span>
                <span className="text-xs font-bold text-gray-500">Versand</span>
                <ChevronRight className="h-3 w-3 text-gray-300" />
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    step >= 2 ? 'bg-orange-500 text-white font-extrabold shadow-sm' : 'bg-gray-100 text-gray-400 border border-gray-150'
                  }`}
                >
                  2
                </span>
                <span className="text-xs font-bold text-gray-500">Zahlung</span>
                <ChevronRight className="h-3 w-3 text-gray-300" />
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    step >= 3 ? 'bg-orange-500 text-white font-extrabold shadow-sm' : 'bg-gray-100 text-gray-400 border border-gray-150'
                  }`}
                >
                  3
                </span>
                <span className="text-xs font-bold text-gray-500">Abschluss</span>
              </div>
            )}

            {/* Step 1: Address Details */}
            {step === 1 && (
              <form onSubmit={submitAddressForm} className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-orange-500" />
                    Lieferadresse & Kontaktdaten
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 font-semibold">
                    Bitte füllen Sie alle markierten Daten aus, um den Versand optimal zu steuern.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="col-span-1 sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-gray-650">Vollständiger Name</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Max Mustermann"
                      className="w-full rounded-xl border border-gray-250 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 focus:bg-white font-semibold"
                    />
                    {addressErrors.customerName && <p className="text-xs text-red-650 font-bold">{addressErrors.customerName}</p>}
                  </div>

                  <div className="col-span-1 sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-gray-650">E-Mail-Adresse</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="maxtest@webshop.de"
                      className="w-full rounded-xl border border-gray-250 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 focus:bg-white font-semibold"
                    />
                    {addressErrors.email && <p className="text-xs text-red-650 font-bold">{addressErrors.email}</p>}
                  </div>

                  <div className="col-span-1 sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-gray-650">Straße und Hausnummer</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Musterallee 99"
                      className="w-full rounded-xl border border-gray-250 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 focus:bg-white font-semibold"
                    />
                    {addressErrors.address && <p className="text-xs text-red-650 font-bold">{addressErrors.address}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-650">Postleitzahl (PLZ)</label>
                    <input
                      type="text"
                      required
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      placeholder="10115"
                      className="w-full rounded-xl border border-gray-250 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 focus:bg-white font-semibold"
                    />
                    {addressErrors.zipCode && <p className="text-xs text-red-650 font-bold">{addressErrors.zipCode}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-650">Stadt</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Berlin"
                      className="w-full rounded-xl border border-gray-250 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 focus:bg-white font-semibold"
                    />
                    {addressErrors.city && <p className="text-xs text-red-650 font-bold">{addressErrors.city}</p>}
                  </div>
                </div>

                <div className="mt-8 flex justify-end border-t border-gray-100 pt-4">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-black text-white hover:bg-orange-600 active:scale-95 transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                  >
                    Weiter zur Zahlung
                    <ChevronRight className="h-4 w-4 text-white" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Payment Selector */}
            {step === 2 && (
              <form onSubmit={submitPaymentForm} className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-orange-500" />
                    Zahlungsmethode auswählen
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 font-bold">
                    Sichere, SSL-verschlüsselte Transaktion. Geben Sie Ihre Details ein.
                  </p>
                </div>

                {/* Gateway trigger tabs */}
                <div className="grid grid-cols-3 gap-2 border bg-gray-50 p-1 border-gray-200 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-orange-50 text-orange-600 border border-orange-200'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    Kreditkarte
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all cursor-pointer ${
                      paymentMethod === 'paypal'
                        ? 'bg-orange-50 text-orange-600 border border-orange-200'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                    PayPal
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('klarna')}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all cursor-pointer ${
                      paymentMethod === 'klarna'
                        ? 'bg-orange-50 text-orange-600 border border-orange-200'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Landmark className="h-4 w-4" />
                    Klarna
                  </button>
                </div>

                {/* Card Fields forms */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-650">Name des Karteninhabers</label>
                      <input
                        type="text"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Max Mustermann"
                        className="w-full rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 font-semibold"
                      />
                      {paymentErrors.cardHolder && <p className="text-xs text-red-650 font-bold">{paymentErrors.cardHolder}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-650">Kreditkartennummer</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          placeholder="4512 8934 1123 4567"
                          className="w-full rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 pl-10 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 font-semibold"
                        />
                        <CreditCard className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                      </div>
                      {paymentErrors.cardNumber && <p className="text-xs text-red-650 font-bold">{paymentErrors.cardNumber}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-650">Gültig bis (MM/JJ)</label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          placeholder="12/28"
                          className="w-full rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 text-center font-semibold"
                        />
                        {paymentErrors.cardExpiry && <p className="text-xs text-red-650 font-bold">{paymentErrors.cardExpiry}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-650">CVC / CVV</label>
                        <input
                          type="password"
                          required
                          value={cardCvv}
                          onChange={(e) => handleCvvChange(e.target.value)}
                          placeholder="789"
                          className="w-full rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 text-center font-semibold"
                        />
                        {paymentErrors.cardCvv && <p className="text-xs text-red-650 font-bold">{paymentErrors.cardCvv}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* PayPal Fields forms */}
                {paymentMethod === 'paypal' && (
                  <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs text-gray-500 font-semibold">
                      Zahlen Sie unkompliziert und geschützt mit Ihrem PayPal-Konto.
                    </p>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-650">PayPal E-Mail-Adresse</label>
                      <input
                        type="email"
                        required
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        placeholder="ihr-konto@paypal.de"
                        className="w-full rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 font-semibold"
                      />
                      {paymentErrors.paypalEmail && <p className="text-xs text-red-650 font-bold">{paymentErrors.paypalEmail}</p>}
                    </div>
                  </div>
                )}

                {/* Klarna Fields forms */}
                {paymentMethod === 'klarna' && (
                  <div className="space-y-4 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs text-gray-500 font-semibold">
                      Klarna Rechnungskauf. Erst testen, dann nach 30 Tagen bequem überweisen.
                    </p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-650">Klarna E-Mail-Adresse</label>
                        <input
                          type="email"
                          required
                          value={klarnaEmail}
                          onChange={(e) => setKlarnaEmail(e.target.value)}
                          placeholder="kunde@klarna.de"
                          className="w-full rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 font-semibold"
                        />
                        {paymentErrors.klarnaEmail && <p className="text-xs text-red-650 font-bold">{paymentErrors.klarnaEmail}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-650">Geburtsdatum</label>
                        <input
                          type="date"
                          required
                          value={klarnaBirthdate}
                          onChange={(e) => setKlarnaBirthdate(e.target.value)}
                          className="w-full rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none focus:border-orange-500 font-semibold"
                        />
                        {paymentErrors.klarnaBirthdate && <p className="text-xs text-red-650 font-bold">{paymentErrors.klarnaBirthdate}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Grand totals invoice preview */}
                <div className="flex items-center justify-between rounded-xl bg-orange-50 px-4 py-3 border border-orange-100 font-sans shadow-sm">
                  <span className="text-xs font-bold text-orange-600">Sicherer Zahlungsbetrag (gesamt):</span>
                  <span className="font-mono text-base font-black text-orange-600">{total.toFixed(2)} €</span>
                </div>

                {/* Actions */}
                <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 text-xs font-black text-gray-600 hover:text-gray-900 hover:bg-gray-105 transition-all active:scale-95 cursor-pointer"
                  >
                    Zurück zur Adresse
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-black text-white hover:bg-orange-600 active:scale-95 transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                  >
                    Jetzt {total.toFixed(2)} € Bezahlen
                    <ShieldCheck className="h-4 w-4 text-white" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Loading Processing Verifications */}
            {step === 3 && (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                <div className="relative flex items-center justify-center">
                  <Loader2 className="h-16 w-16 animate-spin text-orange-550" />
                  <div className="absolute h-10 w-10 rounded-full bg-orange-500/10 blur-md"></div>
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">Sichere Abrechnung wird bearbeitet</h3>
                  <p className="mt-2 text-sm text-gray-500 max-w-sm font-semibold">
                    Bitte schließen oder aktualisieren Sie das Browserfenster nicht. Ihre Transaktion wird in Echtzeit geschützt verarbeitet.
                  </p>
                </div>
                <div className="rounded-full bg-orange-50 border border-orange-100 px-5 py-1.5 text-xs font-mono font-bold text-orange-600">
                  {loadingText}
                </div>
              </div>
            )}

            {/* Step 4: Success confirmation screen / Print receipt */}
            {step === 4 && (
              <div id="printable-receipt" className="space-y-6">
                
                {/* Visual success banner */}
                <div className="text-center space-y-3 pb-6 border-b border-gray-200">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg">
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">Vielen Dank für Ihren Einkauf!</h2>
                  <p className="text-sm text-gray-500 max-w-md mx-auto font-bold">
                    Ihre Bestellung wurde erfolgreich aufgegeben und wird umgehend dem Premium-Blitzversand übergeben.
                  </p>
                </div>

                {/* Quittung / Detailed Receipt Grid */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 space-y-4 text-xs font-sans">
                  
                  {/* Quittung Header Info metadata */}
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                    <div>
                      <p className="font-bold text-gray-400">BESTELL-ID</p>
                      <p className="font-mono text-sm font-extrabold text-gray-900 mt-0.5">{orderId}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-400">DATUM</p>
                      <p className="text-sm font-extrabold text-gray-900 mt-0.5">{orderDate}</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-400">SPEDITIONSADRESSE</p>
                      <p className="text-gray-900 font-extrabold mt-0.5">{customerName}</p>
                      <p className="text-gray-500 font-medium">{address}</p>
                      <p className="text-gray-500 font-medium">{zipCode} {city}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-400">ZAHLUNGSART</p>
                      <p className="text-gray-900 font-extrabold uppercase mt-0.5">{paymentMethod}</p>
                      <p className="text-gray-500 font-medium">{email}</p>
                    </div>
                  </div>

                  {/* Items list receipt lines */}
                  <div className="space-y-3">
                    <p className="font-bold text-gray-400">BESTELLTE ARTIKEL</p>
                    {cartItems.map((item, idx) => (
                      <div key={`${item.product.id}-${idx}`} className="flex justify-between items-start text-xs">
                        <div className="flex flex-col text-left gap-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-gray-800">{item.product.title}</span>
                            <span className="text-[11px] font-black text-orange-550">x{item.quantity}</span>
                          </div>
                          {(item.selectedColor || item.selectedSize) && (
                            <div className="flex items-center gap-1.5">
                              {item.selectedColor && (
                                <span className="h-2 w-2 rounded-full border border-gray-300" style={{ backgroundColor: item.selectedColor }} title="Gekaufte Farbe" />
                              )}
                              {item.selectedSize && (
                                <span className="text-[9px] text-gray-500 font-bold bg-white border border-gray-200 px-1 rounded-sm">Gr. {item.selectedSize}</span>
                              )}
                            </div>
                          )}
                        </div>
                        <span className="font-mono text-gray-700 font-extrabold mt-0.5">
                          {(item.product.price * item.quantity).toFixed(2)} €
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Calculations total receipt panel */}
                  <div className="border-t border-gray-200 pt-3 space-y-2">
                    <div className="flex justify-between text-gray-500 font-bold">
                      <span>Zwischensumme:</span>
                      <span className="font-mono">{(subtotal).toFixed(2)} €</span>
                    </div>
                    {discountPercent > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Rabatt ({discountPercent}%):</span>
                        <span className="font-mono">-{discountValue.toFixed(2)} €</span>
                      </div>
                    )}
                    <div className="flex justify-between text-gray-500 font-bold">
                      <span>Premium Fast Versand:</span>
                      <span>{shippingCost === 0 ? 'Kostenlos' : `${shippingCost.toFixed(2)} €`}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-black text-gray-900 text-sm">
                      <span>Bezifferte Gesamtsumme:</span>
                      <span className="font-mono text-orange-600">{(total).toFixed(2)} €</span>
                    </div>
                  </div>

                </div>

                {/* Print/Dismiss Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handlePrint}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-xs font-black text-gray-700 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
                  >
                    <Printer className="h-4 w-4" />
                    Quittung drucken / PDF
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 rounded-xl bg-orange-500 py-3 text-xs font-black text-white hover:bg-orange-600 active:scale-95 shadow-md shadow-orange-500/10 cursor-pointer"
                  >
                    Einkauf beenden
                  </button>
                </div>

              </div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
