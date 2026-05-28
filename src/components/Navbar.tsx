/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ============================================================================
 * NAVBAR COMPONENT - SIN-SHOP Navigation
 * ============================================================================
 * 
 * FEATURES:
 * - Responsive navigation (Desktop + Mobile)
 * - Search bar with clear functionality
 * - Cart badge with item count
 * - Wishlist badge with item count
 * - User profile widget (Login/Logout)
 * - Category dropdown with subcategory filter (NEW)
 * 
 * PROPS:
 * - activeTab: Current active navigation tab
 * - setActiveTab: Function to change active tab
 * - cartCount: Number of items in cart
 * - wishlistCount: Number of items in wishlist
 * - onCartToggle: Callback when cart icon clicked
 * - searchQuery: Current search input value
 * - setSearchQuery: Function to update search
 * - currentUser: User object with login state
 * - onToggleUser: Callback to open auth modal
 * - selectedCategory: Currently selected main category (NEW)
 * - setSelectedCategory: Function to change category (NEW)
 * - selectedSubcategory: Currently selected subcategory (NEW)
 * - setSelectedSubcategory: Function to change subcategory (NEW)
 * - availableSubcategories: List of subcategories for current category (NEW)
 * - categories: List of all main categories (NEW)
 * - subcategoryCounts: Map of subcategory -> product count (NEW)
 * 
 * TODO:
 * - [ ] Add keyboard navigation for dropdowns (A11y)
 * - [ ] Add ARIA labels for screen readers
 * - [ ] Implement focus trap in mobile menu
 * ============================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Search, Store, Menu, X, UserCheck, LogIn, Heart, ChevronDown, Filter, Layers } from 'lucide-react';
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
  /** Currently selected main category - passed from App.tsx */
  selectedCategory?: string;
  /** Callback to change the main category filter */
  setSelectedCategory?: (cat: string) => void;
  /** Currently selected subcategory - passed from App.tsx */
  selectedSubcategory?: string;
  /** Callback to change the subcategory filter */
  setSelectedSubcategory?: (sub: string) => void;
  /** Dynamic list of subcategories based on selected category */
  availableSubcategories?: string[];
  /** All available main categories */
  categories?: string[];
  /** Map: subcategory name -> number of products in that subcategory */
  subcategoryCounts?: Record<string, number>;
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
  selectedCategory = 'All Products',
  setSelectedCategory,
  selectedSubcategory = 'All Subcategories',
  setSelectedSubcategory,
  availableSubcategories = [],
  categories = [],
  subcategoryCounts = {},
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  /**
   * State for category/subcategory dropdown visibility
   * Desktop: Shows on hover, Mobile: Shows on click
   */
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  
  /**
   * Close dropdown when clicking outside
   * Uses mousedown to catch clicks before they propagate
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /**
   * Handler for category selection
   * Resets subcategory when main category changes (handled in App.tsx via useEffect)
   */
  const handleCategorySelect = (cat: string) => {
    if (setSelectedCategory) {
      setSelectedCategory(cat);
      setActiveTab('shop');
    }
    setIsCategoryDropdownOpen(false);
  };

  /**
   * Handler for subcategory selection
   * Keeps current category, just filters by subcategory
   */
  const handleSubcategorySelect = (sub: string) => {
    if (setSelectedSubcategory) {
      setSelectedSubcategory(sub);
      setActiveTab('shop');
    }
    setIsCategoryDropdownOpen(false);
  };

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
            {/* 
              ============================================================
              CATEGORY/SUBCATEGORY DROPDOWN (Desktop)
              ============================================================
              - Shows current category + subcategory
              - Click to open dropdown with all categories
              - Each category expands to show its subcategories
              - Product counts shown next to subcategories
              ============================================================
            */}
            {categories.length > 0 && setSelectedCategory && (
              <div className="relative" ref={categoryDropdownRef}>
                <button
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-black transition-all duration-200 cursor-pointer ${
                    isCategoryDropdownOpen
                      ? 'bg-orange-100 text-orange-700 border border-orange-200 shadow-sm'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                  aria-expanded={isCategoryDropdownOpen}
                  aria-haspopup="true"
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span className="max-w-[120px] truncate">
                    {selectedCategory === 'All Products' ? 'Kategorie' : selectedCategory}
                  </span>
                  {selectedSubcategory !== 'All Subcategories' && (
                    <span className="text-orange-500 text-[10px]">
                      / {selectedSubcategory}
                    </span>
                  )}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Panel */}
                {isCategoryDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                    {/* Dropdown Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-orange-600" />
                        <span className="text-xs font-black text-gray-900 uppercase tracking-wider">
                          Kategorien & Filter
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Wähle Kategorie und Unterkategorie
                      </p>
                    </div>

                    {/* Category List */}
                    <div className="max-h-80 overflow-y-auto py-2">
                      {categories.map((cat) => {
                        const isSelected = selectedCategory === cat;
                        /** 
                         * Get subcategories for this specific category
                         * Only show subcategories when this category is selected
                         */
                        const catSubcategories = isSelected ? availableSubcategories.filter(s => s !== 'All Subcategories') : [];
                        
                        return (
                          <div key={cat}>
                            {/* Main Category Button */}
                            <button
                              onClick={() => handleCategorySelect(cat)}
                              className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-all ${
                                isSelected
                                  ? 'bg-orange-50 text-orange-700 font-black'
                                  : 'text-gray-700 hover:bg-gray-50 font-bold'
                              }`}
                            >
                              <span className="text-xs">
                                {cat === 'All Products' ? 'Alle Produkte' : cat}
                              </span>
                              {isSelected && (
                                <span className="h-2 w-2 rounded-full bg-orange-500" />
                              )}
                            </button>

                            {/* Subcategories (only when category is selected) */}
                            {isSelected && catSubcategories.length > 0 && (
                              <div className="bg-gray-50 border-y border-gray-100">
                                {/* "All Subcategories" option */}
                                <button
                                  onClick={() => handleSubcategorySelect('All Subcategories')}
                                  className={`w-full flex items-center justify-between pl-8 pr-4 py-2 text-left transition-all ${
                                    selectedSubcategory === 'All Subcategories'
                                      ? 'bg-orange-100/50 text-orange-700 font-bold'
                                      : 'text-gray-600 hover:bg-gray-100 font-medium'
                                  }`}
                                >
                                  <span className="text-[11px]">Alle Typen</span>
                                  {selectedSubcategory === 'All Subcategories' && (
                                    <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                                  )}
                                </button>
                                
                                {/* Individual Subcategories */}
                                {catSubcategories.map((sub) => {
                                  const count = subcategoryCounts[sub] || 0;
                                  return (
                                    <button
                                      key={sub}
                                      onClick={() => handleSubcategorySelect(sub)}
                                      className={`w-full flex items-center justify-between pl-8 pr-4 py-2 text-left transition-all ${
                                        selectedSubcategory === sub
                                          ? 'bg-orange-100/50 text-orange-700 font-bold'
                                          : 'text-gray-600 hover:bg-gray-100 font-medium'
                                      }`}
                                    >
                                      <span className="text-[11px]">{sub}</span>
                                      <div className="flex items-center gap-1.5">
                                        {count > 0 && (
                                          <span className="text-[9px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-bold">
                                            {count}
                                          </span>
                                        )}
                                        {selectedSubcategory === sub && (
                                          <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Dropdown Footer */}
                    <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
                      <button
                        onClick={() => {
                          handleCategorySelect('All Products');
                          if (setSelectedSubcategory) setSelectedSubcategory('All Subcategories');
                        }}
                        className="text-[10px] text-orange-600 hover:text-orange-700 font-bold hover:underline"
                      >
                        Filter zurücksetzen
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

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
          {/* 
            ============================================================
            MOBILE CATEGORY/SUBCATEGORY FILTER
            ============================================================
            - Accordion-style expandable sections
            - Shows all categories with expand arrow
            - Subcategories appear when category is tapped
            ============================================================
          */}
          {categories.length > 0 && setSelectedCategory && (
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-3">
              <button
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-50 to-amber-50"
              >
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-orange-600" />
                  <div className="text-left">
                    <span className="block text-xs font-black text-gray-900">
                      {selectedCategory === 'All Products' ? 'Alle Kategorien' : selectedCategory}
                    </span>
                    {selectedSubcategory !== 'All Subcategories' && (
                      <span className="block text-[10px] text-orange-600 font-bold">
                        {selectedSubcategory}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryDropdownOpen && (
                <div className="border-t border-gray-200 bg-white">
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat;
                    const catSubcategories = isSelected ? availableSubcategories.filter(s => s !== 'All Subcategories') : [];
                    
                    return (
                      <div key={cat}>
                        <button
                          onClick={() => handleCategorySelect(cat)}
                          className={`w-full flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 ${
                            isSelected ? 'bg-orange-50 text-orange-700' : 'text-gray-700'
                          }`}
                        >
                          <span className="text-xs font-bold">
                            {cat === 'All Products' ? 'Alle Produkte' : cat}
                          </span>
                          {isSelected && <span className="h-2 w-2 rounded-full bg-orange-500" />}
                        </button>

                        {isSelected && catSubcategories.length > 0 && (
                          <div className="bg-gray-50 px-2 py-2 space-y-1">
                            <button
                              onClick={() => handleSubcategorySelect('All Subcategories')}
                              className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${
                                selectedSubcategory === 'All Subcategories'
                                  ? 'bg-orange-100 text-orange-700 font-bold'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              Alle Typen anzeigen
                            </button>
                            {catSubcategories.map((sub) => {
                              const count = subcategoryCounts[sub] || 0;
                              return (
                                <button
                                  key={sub}
                                  onClick={() => handleSubcategorySelect(sub)}
                                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${
                                    selectedSubcategory === sub
                                      ? 'bg-orange-100 text-orange-700 font-bold'
                                      : 'text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  <span>{sub}</span>
                                  {count > 0 && (
                                    <span className="text-[9px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">
                                      {count}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

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
