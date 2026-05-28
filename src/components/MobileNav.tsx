/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Store, ShoppingBag, Heart, User } from 'lucide-react';

interface MobileNavProps {
  activeTab: 'shop' | 'cart' | 'wishlist' | 'account';
  setActiveTab: (tab: 'shop' | 'cart' | 'wishlist' | 'account') => void;
  cartCount: number;
  wishlistCount: number;
  onCartToggle: () => void;
}

export default function MobileNav({
  activeTab,
  setActiveTab,
  cartCount,
  wishlistCount,
  onCartToggle,
}: MobileNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-md md:hidden px-4 py-2 shadow-lg">
      <div className="flex items-center justify-around gap-2 max-w-md mx-auto">
        
        {/* Store Shop tab */}
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'shop' ? 'text-orange-600 font-extrabold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Store className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Store</span>
        </button>

        {/* Wishlist tab */}
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'wishlist' ? 'text-orange-600 font-extrabold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Heart className={`h-5 w-5 ${activeTab === 'wishlist' ? 'fill-orange-600' : ''}`} />
          <span className="text-[9px] font-bold uppercase tracking-wider">Wunschliste</span>
          {wishlistCount > 0 && (
            <span className="absolute top-0 right-2 flex min-w-4 h-4 items-center justify-center rounded-full bg-orange-600 px-1 text-[9px] font-black text-white ring-1 ring-white">
              {wishlistCount}
            </span>
          )}
        </button>

        {/* Floating Core Cart Trigger - transitions to cart page */}
        <button
          onClick={onCartToggle}
          className={`relative -mt-6 flex h-14 w-14 items-center justify-center rounded-full shadow-lg active:scale-95 transition-all ${
            activeTab === 'cart'
              ? 'bg-white border-2 border-orange-500 text-orange-600'
              : 'bg-gradient-to-tr from-orange-500 to-amber-400 text-white shadow-orange-500/10'
          }`}
        >
          <ShoppingBag className="h-6 w-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 flex min-w-5 h-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
              {cartCount}
            </span>
          )}
        </button>

        {/* Account tab */}
        <button
          onClick={() => setActiveTab('account')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'account' ? 'text-orange-600 font-extrabold' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Konto</span>
        </button>

      </div>
    </div>
  );
}
