/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  LogIn, 
  ShoppingBag, 
  Store, 
  Lock, 
  Mail, 
  CheckCircle,
  Gem
} from 'lucide-react';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
  onLogin: (user: UserType) => void;
  onLogout: () => void;
  initialMode?: 'buyer' | 'seller';
}

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  initialMode = 'buyer'
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'seller'>(initialMode);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (activeTab === 'register' && !name.trim()) {
      setError('Bitte geben Sie Ihren Namen ein.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Bitte eine gültige E-Mail-Adresse angeben.');
      return;
    }
    if (password.length < 5) {
      setError('Das Passwort muss mindestens 5 Zeichen lang sein.');
      return;
    }

    // Success simulation
    const finalName = activeTab === 'register' ? name : (selectedRole === 'seller' ? 'Sinan Verkäufer (Admin)' : 'Christian Müller');
    
    const newUser: UserType = {
      name: finalName,
      email: email.toLowerCase(),
      isLoggedIn: true,
      avatar: finalName.substring(0, 2).toUpperCase(),
      role: selectedRole
    };

    setSuccess(`Erfolgreich als ${selectedRole === 'seller' ? 'Verkäufer (Admin)' : 'Käufer'} angemeldet!`);
    
    setTimeout(() => {
      onLogin(newUser);
      onClose();
      // Clear forms
      setName('');
      setEmail('');
      setPassword('');
      setSuccess('');
    }, 800);
  };

  const handleQuickLogin = (role: 'buyer' | 'seller') => {
    setError('');
    setSuccess('');
    
    let quickUser: UserType;
    if (role === 'seller') {
      quickUser = {
        name: 'Sinan Verkäufer (Admin)',
        email: 'admin.seller@sin-concept.de',
        isLoggedIn: true,
        avatar: 'SV',
        role: 'seller'
      };
    } else {
      quickUser = {
        name: 'Christian Müller',
        email: 'christian.buyer@temu-deals.de',
        isLoggedIn: true,
        avatar: 'CM',
        role: 'buyer'
      };
    }

    setSuccess(`Schnellzugriff erfolgreich: ${role === 'seller' ? 'Verkäufer' : 'Käufer'} angemeldet!`);
    setTimeout(() => {
      onLogin(quickUser);
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-6">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        />

        {/* Modal body container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl sm:p-8 text-gray-900"
        >
          {/* Close trigger */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-950 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header Logos */}
          <div className="text-center pb-4">
            <div className="inline-flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-3 shadow-xs">
              <Gem className="h-3 w-3 shrink-0 text-white" />
              TEMU & AMAZON DEAL PORTAL
            </div>
            
            <h3 className="text-xl font-black text-gray-900">
              {currentUser.isLoggedIn ? 'Konto verwalten' : 'Kunden- & Händlerportal'}
            </h3>
            <p className="text-xs text-gray-500 mt-1 font-bold">
              {currentUser.isLoggedIn 
                ? `Eingeloggt als ${currentUser.role === 'seller' ? 'Verkäufer (Admin)' : 'Käufer'}`
                : 'Tritt dem Concept Store bei für unschlagbare Rabatte'
              }
            </p>
          </div>

          {currentUser.isLoggedIn ? (
            /* Logged In View */
            <div className="space-y-4 pt-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-white font-black text-lg shadow-sm">
                    {currentUser.avatar || 'U'}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-955">{currentUser.name}</h4>
                    <p className="text-xs text-gray-400 font-bold">{currentUser.email}</p>
                    <span className="inline-flex mt-1.5 rounded-full bg-orange-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-orange-600 border border-orange-100">
                      {currentUser.role === 'seller' ? 'Verkäufer / Admin-Bereich freigeschaltet' : 'Standard Käufer-Konto'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-orange-50 rounded-xl border border-orange-100 text-center">
                <p className="text-[11px] text-orange-700 leading-normal font-bold">
                  {currentUser.role === 'seller' 
                    ? 'Sie haben vollen Zugriff auf das Produktdesign, können Lagerbestände aktualisieren und Statistiken einsehen.' 
                    : 'Sie können Bestellungen abschicken, Coupons anwenden und verifizierte Kundenstimmen abgeben.'
                  }
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => {
                    onLogout();
                    setActiveTab('login');
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-black text-red-600 hover:bg-red-100 active:scale-98 transition-all cursor-pointer"
                >
                  <LogIn className="h-4 w-4" />
                  Abmelden / Logout
                </button>
                <button
                  onClick={onClose}
                  className="w-full text-center py-2 text-xs font-bold text-gray-400 hover:text-gray-550 transition-colors cursor-pointer"
                >
                  Schließen
                </button>
              </div>
            </div>
          ) : (
            /* Login Form View */
            <div className="space-y-4 pt-2">
              
              {/* Role Toggle Tab selectors */}
              <div className="grid grid-cols-2 gap-2 bg-gray-105 p-1 rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('buyer');
                    setError('');
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    selectedRole === 'buyer'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <ShoppingBag className="h-3.5 w-3.5 animate-pulse" />
                  Käufer (Kunde)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('seller');
                    setError('');
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                    selectedRole === 'seller'
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Store className="h-3.5 w-3.5" />
                  Verkäufer (Admin)
                </button>
              </div>

              {/* Login/Register Tabs switcher */}
              <div className="flex border-b border-gray-150">
                <button
                  onClick={() => { setActiveTab('login'); setError(''); }}
                  className={`flex-1 text-center pb-2 text-xs font-black border-b-2 transition-all cursor-pointer ${
                    activeTab === 'login' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'
                  }`}
                >
                  Einloggen
                </button>
                <button
                  onClick={() => { setActiveTab('register'); setError(''); }}
                  className={`flex-1 text-center pb-2 text-xs font-black border-b-2 transition-all cursor-pointer ${
                    activeTab === 'register' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'
                  }`}
                >
                  Registrieren
                </button>
              </div>

              {/* Core form */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-1">
                {activeTab === 'register' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase">Vollständiger Name</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="z.B. Christian Müller"
                        className="w-full rounded-xl border border-gray-250 bg-gray-50 py-2 pl-9 pr-4 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 focus:bg-white font-semibold"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-gray-500 uppercase">E-Mail Adresse</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={selectedRole === 'seller' ? 'admin@sin-concept.de' : 'kunde@temu-deals.de'}
                      className="w-full rounded-xl border border-gray-250 bg-gray-50 py-2 pl-9 pr-4 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 focus:bg-white font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold text-gray-500 uppercase">Passwort</label>
                    <span className="text-[9px] text-gray-400 font-bold">mind. 5 Zeichen</span>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-gray-250 bg-gray-50 py-2 pl-9 pr-4 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-orange-500 focus:bg-white font-semibold"
                    />
                  </div>
                </div>

                {error && <p className="text-[11px] text-red-650 font-bold">{error}</p>}
                {success && (
                  <p className="text-[11px] text-emerald-600 font-extrabold flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 shrink-0" />
                    {success}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-xs font-black text-white hover:bg-orange-600 active:scale-95 transition-all shadow-md shadow-orange-500/10 cursor-pointer"
                >
                  <LogIn className="h-4 w-4 text-white" />
                  {activeTab === 'login' ? 'Jetzt einloggen' : 'Konto erstellen'}
                </button>
              </form>

              {/* Divider for Quick Access */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-150"></div>
                <span className="flex-shrink mx-3 text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">Schnellzugriff (Demo)</span>
                <div className="flex-grow border-t border-gray-150"></div>
              </div>

              {/* Temu-like instant test buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('buyer')}
                  className="flex flex-col items-center justify-center border border-gray-200 bg-gray-55 p-2.5 rounded-xl hover:bg-gray-100 transition-all cursor-pointer text-center"
                >
                  <span className="text-[10px] font-black text-gray-900 mb-0.5">Demokunde</span>
                  <span className="text-[8px] text-gray-500 font-bold">1-Klick Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('seller')}
                  className="flex flex-col items-center justify-center border border-orange-100 bg-orange-50 p-2.5 rounded-xl hover:bg-orange-100 transition-all cursor-pointer text-center animate-pulse"
                >
                  <span className="text-[10px] font-black text-orange-600 mb-0.5">Verkäufer (Admin)</span>
                  <span className="text-[8px] text-orange-500 font-bold">1-Klick Login</span>
                </button>
              </div>

              <div className="text-center">
                <p className="text-[9px] text-gray-400 leading-normal font-bold">
                  Hinweis: Das Verkäufer-Konto gewährt Ihnen den Zugriff auf den geschützten Admin-Bereich mit Statistiken, Charts und Produkten.
                </p>
              </div>

            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
