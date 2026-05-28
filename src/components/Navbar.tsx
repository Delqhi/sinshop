/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingBag, Search, LayoutDashboard, Store, Menu, X, UserCheck, LogIn, Heart } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  activeTab: 'shop' | 'cart' | 'wishlist' | 'account';
  setActiveTab: (tab: 'shop' | 'cart' | 'wishlist' | 'account') => void;
  cartCount: number;
  wishlistCount: number;
  onCartToggle: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUser: User;
  onToggleUser: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  cartCount,
  wishlistCount,
  onCartToggle,
  searchQuery,
  setSearchQuery,
  currentUser,
  onToggleUser,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('shop')}>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 font-extrabold text-white shadow-md shadow-orange-500/20">
              <span className="text-xl tracking-wider font-black">S</span>
              <div className="absolute -top-1 -right-1 h-3 w-3 animate-ping rounded-full bg-orange-400 opacity-75"></div>
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-orange-300"></div>
            </div>
            <div className="hidden sm:block">
              <span className="font-sans text-sm font-black tracking-tight text-slate-900 line-height-1">
                BLITZ<span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">_SHOP</span>
              </span>
              <p className="text-[9px] uppercase tracking-widest text-orange-500 font-black -mt-1">Concept Portal</p>
            </div>
          </div>

          {/* Search Bar */}
          {activeTab === 'shop' && (
            <div className="relative flex max-w-xs sm:max-w-md flex-1 items-center">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Suche nach Knaller-Deals oder Kategorien..."
                className="w-full rounded-full border border-gray-300 bg-gray-50 py-1.5 pl-9 pr-10 text-xs text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-orange-500 focus:bg-white focus:ring-1 focus:ring-orange-500/40 font-semibold"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Navigation Items - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setActiveTab('shop')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-black transition-all duration-200 cursor-pointer ${
                activeTab === 'shop'
                  ? 'bg-orange-50 text-orange-600 border border-orange-100 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
              }`}
            >
              <Store className="h-4 w-4" />
              Blitzangebote
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`relative flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-black transition-all duration-200 cursor-pointer ${
                activeTab === 'wishlist'
                  ? 'bg-orange-50 text-orange-600 border border-orange-100 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
              }`}
            >
              <Heart className={`h-4 w-4 ${activeTab === 'wishlist' ? 'fill-orange-600' : ''}`} />
              Wunschliste
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex min-w-5 h-5 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-1 text-[10px] font-black text-slate-950 ring-2 ring-white shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-black transition-all duration-200 cursor-pointer ${
                activeTab === 'cart'
                  ? 'bg-orange-50 text-orange-600 border border-orange-100 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              Einkaufswagen
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-black transition-all duration-200 cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-orange-50 text-orange-600 border border-orange-100 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              Mein Konto
            </button>
          </div>

          {/* Profile Switcher Widget & Cart Count */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Interactive Profile Widget */}
            <button
              onClick={() => {
                if (currentUser.isLoggedIn) {
                  setActiveTab('account');
                } else {
                  onToggleUser();
                }
              }}
              title={currentUser.isLoggedIn ? `Eingeloggt als ${currentUser.name} (${currentUser.role === 'seller' ? 'Verkäufer' : 'Käufer'})` : "Klicken zum Einloggen (Käufer & Verkäufer)"}
              className="hidden lg:flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-3 py-1.5 text-[11px] font-bold text-gray-700 hover:border-gray-300 hover:bg-gray-100 transition-all cursor-pointer"
            >
              {currentUser.isLoggedIn ? (
                <>
                  <UserCheck className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  <div className="flex flex-col items-start leading-tight">
                    <span className="max-w-[100px] truncate text-gray-900 font-extrabold">{currentUser.name}</span>
                    <span className="text-[8px] uppercase tracking-wider text-orange-500 font-bold">
                      {currentUser.role === 'seller' ? 'Verkäufer' : 'Käufer'}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <LogIn className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                  <span className="text-gray-600">Einloggen</span>
                </>
              )}
            </button>

            {/* Cart Icon Button triggers page switch to 'cart' page */}
            <button
              onClick={onCartToggle}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 active:scale-95 cursor-pointer ${
                activeTab === 'cart'
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100'
              }`}
              aria-label="Warenkorb öffnen"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 flex items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-1 text-[10px] font-black text-slate-950 ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 md:hidden"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation links */}
      {isMobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden px-4 py-4 space-y-2.5 shadow-xl">
          <button
            onClick={() => {
              setActiveTab('shop');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'shop'
                ? 'bg-orange-50 text-orange-600 border border-orange-100'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Store className="h-4 w-4" />
            Blitzangebote durchstöbern
          </button>
          <button
            onClick={() => {
              setActiveTab('wishlist');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'wishlist'
                ? 'bg-orange-50 text-orange-600 border border-orange-100'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Heart className={`h-4 w-4 ${activeTab === 'wishlist' ? 'fill-orange-600' : ''}`} />
            Meine Wunschliste
            {wishlistCount > 0 && (
              <span className="ml-auto flex min-w-5 h-5 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-[10px] font-black">
                {wishlistCount}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('cart');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'cart'
                ? 'bg-orange-50 text-orange-600 border border-orange-100'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Warenkorb & Kasse
          </button>
          <button
            onClick={() => {
              setActiveTab('account');
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'account'
                ? 'bg-orange-50 text-orange-600 border border-orange-100'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            Mein Konto & Bestellungen
          </button>

          {/* Mobile Profile Switcher quick status */}
          <div className="border-t border-gray-100 pt-3 flex items-center justify-between px-2">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Status</span>
            <button
              onClick={() => {
                onToggleUser();
              }}
              className="flex items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs text-gray-700"
            >
              {currentUser.isLoggedIn ? (
                <>
                  <UserCheck className="h-3.5 w-3.5 text-orange-500" />
                  <span>{currentUser.name} ({currentUser.role === 'seller' ? 'Partner/Verkäufer' : 'Käufer'})</span>
                </>
              ) : (
                <>
                  <LogIn className="h-3.5 w-3.5 text-orange-500" />
                  <span>Einloggen / Registrieren</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
