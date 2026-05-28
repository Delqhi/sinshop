/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import { INITIAL_PRODUCTS, CATEGORIES } from "./data";
import { Product, CartItem, Order, User, Review } from "./types";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProductCard from "./components/ProductCard";
import CartDrawer from "./components/CartDrawer";
import CheckoutModal from "./components/CheckoutModal";
import ProductDetailsModal from "./components/ProductDetailsModal";
import CartPage from "./components/CartPage";
import CustomerDashboard from "./components/CustomerDashboard";
import Notification, { ToastMessage } from "./components/Notification";
import MobileNav from "./components/MobileNav";
import AuthModal from "./components/AuthModal";
import TemuLuckyBox from "./components/TemuLuckyBox";
import {
  Store,
  ShieldCheck,
  Heart,
  Mail,
  Lock,
  ShieldAlert,
  Key,
  ArrowLeft,
  AlertTriangle,
  Zap,
  Sparkles,
  Facebook,
  Instagram,
  Youtube,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  Send,
} from "lucide-react";
import { motion } from "motion/react";

export default function App() {
  // Sync state with localStorage if preset
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("sin_shop_products");
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("sin_shop_cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Track user's wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem("sin_shop_wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  // Track product browsing history for local smart recommendations
  const [browsingHistory, setBrowsingHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem("sin_shop_history");
    return saved ? JSON.parse(saved) : [];
  });

  // Dynamic user profile support for test reviews
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem("sin_shop_user");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.role) parsed.role = "buyer";
      return parsed;
    }
    return {
      name: "Christian Müller",
      email: "christian.mueller@example.de",
      isLoggedIn: true,
      avatar: "CM",
      role: "buyer",
    };
  });

  // Synchronize customer orders list
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("sin_shop_orders");
    return saved ? JSON.parse(saved) : [];
  });

  // UI state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"shop" | "cart" | "wishlist" | "account">(
    "shop",
  );
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All Subcategories");
  const [sortBy, setSortBy] = useState<string>("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [discount, setDiscount] = useState<{ code: string; percent: number }>({
    code: "",
    percent: 0,
  });

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Temu style live flash discount timer state
  const [countdown, setCountdown] = useState({
    hours: 14,
    minutes: 24,
    seconds: 54,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen for instant checkout trigger from Product Card Sofort-Kauf
  useEffect(() => {
    const handleOpenCartCheckout = () => {
      setActiveTab("cart");
    };
    window.addEventListener("open-cart-checkout", handleOpenCartCheckout);
    return () => window.removeEventListener("open-cart-checkout", handleOpenCartCheckout);
  }, []);

  // Save state on alterations
  useEffect(() => {
    localStorage.setItem("sin_shop_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("sin_shop_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("sin_shop_history", JSON.stringify(browsingHistory));
  }, [browsingHistory]);

  useEffect(() => {
    localStorage.setItem("sin_shop_user", JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem("sin_shop_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("sin_shop_orders", JSON.stringify(orders));
  }, [orders]);

  // Reset selected subcategory when parent category changes
  useEffect(() => {
    setSelectedSubcategory("All Subcategories");
  }, [selectedCategory]);

  // Synchronize deep-linked products from URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("product");
    if (productId) {
      const foundProduct = products.find((p) => p.id === productId);
      if (foundProduct) {
        setSelectedProduct(foundProduct);
      }
    }
  }, [products]);

  // Listens to browser back/forward buttons (popstate events) and synchronizes product open state
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const productId = params.get("product");
      if (productId) {
        const foundProduct = products.find((p) => p.id === productId);
        setSelectedProduct(foundProduct || null);
      } else {
        setSelectedProduct(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [products]);

  // Dynamically update URL and Head Meta Tags based on selectedProduct state for best SEO and indexing
  useEffect(() => {
    const originalTitle = "SIN_WEBSHOP | Premium Tech, Lifestyle & Home Goods";
    const defaultMetaDesc = "Ihr exklusiver Concept-Store für kuratierte Tech-Gadgets, minimalistische Einrichtungsgegenstände und zeitlose Lifestyle-Accessoires mit kompromisslosem Anspruch an Design und Material.";

    if (selectedProduct) {
      // 1. Update document title
      document.title = `${selectedProduct.title} | Premium Concept Goods & Design | SIN_WEBSHOP`;

      // 2. Set dynamic meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", selectedProduct.description);

      // 3. Update browser history path to support indexed deep links without full reload
      const newUrl = `${window.location.origin}${window.location.pathname}?product=${selectedProduct.id}`;
      if (window.location.href !== newUrl) {
        window.history.pushState({ productId: selectedProduct.id }, "", newUrl);
      }
    } else {
      // Restore standard site defaults when closing product details
      document.title = originalTitle;
      
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute("content", defaultMetaDesc);
      }

      // Restore base URL when clear
      const baseUrl = `${window.location.origin}${window.location.pathname}`;
      if (window.location.search.includes("product=")) {
        window.history.pushState({}, "", baseUrl);
      }
    }
  }, [selectedProduct]);

  // Toast Helpers
  const showToast = (
    text: string,
    type: "success" | "info" | "error" = "success",
  ) => {
    const freshToast: ToastMessage = {
      id: `toast-${Date.now()}`,
      text,
      type,
    };
    setToasts((prev) => [...prev, freshToast]);
  };

  const handleRemoveToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const isWished = prev.includes(productId);
      if (isWished) {
        showToast("Von der Wunschliste entfernt", "info");
        return prev.filter((id) => id !== productId);
      } else {
        showToast("Zur Wunschliste hinzugefügt", "success");
        return [...prev, productId];
      }
    });
  };

  // Cart Management
  const handleAddToCart = (
    product: Product,
    quantity = 1,
    selectedColor?: string,
    selectedSize?: string,
  ) => {
    if (product.stock === 0) {
      showToast("Dieses Produkt ist ausverkauft!", "error");
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize,
      );
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast(
            `Verzeihung, nur ${product.stock} Stück auf Lager!`,
            "info",
          );
          return prev;
        }
        showToast(
          `${product.title} wurde aktualisiert (${existing.quantity + quantity} Stk.)`,
          "success",
        );
        return prev.map((item) =>
          item.product.id === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      showToast(`${product.title} in den Warenkorb gelegt`, "success");
      return [...prev, { product, quantity, selectedColor, selectedSize }];
    });
  };

  const handleUpdateQuantity = (
    productId: string,
    quantity: number,
    selectedColor?: string,
    selectedSize?: string,
  ) => {
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return;

    if (quantity > targetProduct.stock) {
      showToast(
        `Derzeit sind nur maximal ${targetProduct.stock} Stück lieferbar`,
        "info",
      );
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize
          ? { ...item, quantity }
          : item,
      ),
    );
  };

  const handleRemoveItem = (
    productId: string,
    selectedColor?: string,
    selectedSize?: string,
  ) => {
    const target = cartItems.find(
      (item) =>
        item.product.id === productId &&
        item.selectedColor === selectedColor &&
        item.selectedSize === selectedSize,
    );
    if (!target) return;
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedColor === selectedColor &&
            item.selectedSize === selectedSize
          ),
      ),
    );
    showToast(`${target.product.title} wurde entfernt.`, "info");
  };

  // Order Complete
  const handleOrderCompleted = (completedOrder: Order) => {
    // Decrease stock count for each item purchased
    setProducts((prevProducts) => {
      return prevProducts.map((p) => {
        const cartMatch = cartItems.find((it) => it.product.id === p.id);
        if (cartMatch) {
          const freshStock = Math.max(0, p.stock - cartMatch.quantity);
          return { ...p, stock: freshStock };
        }
        return p;
      });
    });

    // Record order in state
    setOrders((prev) => [completedOrder, ...prev]);

    showToast(`Bestellung ${completedOrder.id} erfolgreich übermittelt!`, "success");
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
  };

  const handleClearCart = () => {
    setCartItems([]);
    setDiscount({ code: "", percent: 0 });
  };

  const handleCheckoutTrigger = (appliedDiscount: {
    code: string;
    percent: number;
  }) => {
    setDiscount(appliedDiscount);
    setIsCartOpen(false);
    // Switch directly to full page CartPage checkout step 2
    setActiveTab("cart");
  };

  const handleApplyLuckyDiscount = (code: string, percent: number) => {
    setDiscount({ code, percent });
    showToast(
      `Gutschein "${code}" (-${percent}%) erfolgreich an der Kasse aktiviert!`,
      "success",
    );
  };

  // Profile status togglers & Auth flow callbacks
  const handleToggleUser = () => {
    setIsAuthModalOpen(true);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    showToast(`Erfolgreich eingeloggt als ${user.name}!`, "success");
  };

  const handleLogout = () => {
    const guestUser: User = {
      name: "Gast",
      email: "",
      isLoggedIn: false,
      role: "buyer",
    };
    setCurrentUser(guestUser);
    showToast("Erfolgreich abgemeldet. Sie surfen jetzt als Gast.", "info");
  };

  // Review publish handles
  const handleAddReview = (
    productId: string,
    rating: number,
    comment: string,
  ) => {
    const newReview: Review = {
      id: `rev-${Date.now()}`,
      userName: currentUser.isLoggedIn
        ? currentUser.name
        : "Anonymer Gastkunde",
      rating,
      comment,
      date: new Date().toLocaleDateString("de-DE"),
      isRegistered: currentUser.isLoggedIn,
    };

    setProducts((prevProducts) => {
      return prevProducts.map((p) => {
        if (p.id === productId) {
          const currentReviews = p.reviews || [];
          const updatedReviews = [...currentReviews, newReview];

          // Recompute stars average
          const totalRating = updatedReviews.reduce(
            (sum, r) => sum + r.rating,
            0,
          );
          const newAvg = Number(
            (totalRating / updatedReviews.length).toFixed(1),
          );

          return {
            ...p,
            rating: newAvg,
            ratingCount: updatedReviews.length,
            reviews: updatedReviews,
          };
        }
        return p;
      });
    });

    // Mirror on currently selected product inside detail modal
    setSelectedProduct((prev) => {
      if (prev && prev.id === productId) {
        const currentReviews = prev.reviews || [];
        const updatedReviews = [...currentReviews, newReview];
        const totalRating = updatedReviews.reduce(
          (sum, r) => sum + r.rating,
          0,
        );
        const newAvg = Number((totalRating / updatedReviews.length).toFixed(1));
        return {
          ...prev,
          rating: newAvg,
          ratingCount: updatedReviews.length,
          reviews: updatedReviews,
        };
      }
      return prev;
    });

    showToast("Ihre Bewertung wurde erfolgreich übermittelt!", "success");
  };

  // Detailed Modal Launch + Browsing history updates
  const handleViewProduct = (product: Product | null) => {
    setSelectedProduct(product);
    if (product) {
      setBrowsingHistory((prev) => {
        // Keep unique active records up to last 8
        const filtered = prev.filter((id) => id !== product.id);
        return [product.id, ...filtered].slice(0, 8);
      });
    }
  };

  // Filtered Products computations with dynamic sorting support
  const getFilteredAndSortedProducts = () => {
    const filtered = products.filter((product) => {
      const matchesCategory =
        selectedCategory === "All Products" ||
        product.category === selectedCategory;
      const matchesSubcategory =
        selectedSubcategory === "All Subcategories" ||
        product.subcategory === selectedSubcategory;
      const matchesSearch =
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSubcategory && matchesSearch;
    });

    if (sortBy === "price-asc") {
      return [...filtered].sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price-desc") {
      return [...filtered].sort((a, b) => b.price - a.price);
    }
    if (sortBy === "rating-desc") {
      return [...filtered].sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  };

  const filteredProducts = getFilteredAndSortedProducts();

  // Dynamically compute list of subcategories depending on selected parent category
  const availableSubcategories = useMemo(() => {
    const subs = products
      .filter((p) => selectedCategory === "All Products" || p.category === selectedCategory)
      .map((p) => p.subcategory)
      .filter((sub): sub is string => !!sub);
    return ["All Subcategories", ...Array.from(new Set(subs))];
  }, [products, selectedCategory]);

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f6f8] pb-20 md:pb-0 text-gray-900 font-sans selection:bg-orange-550 selection:text-white">
      {selectedProduct ? (
        <>
          <title>{`${selectedProduct.title} | Premium Concept Goods & Design | SIN_WEBSHOP`}</title>
          <meta name="description" content={selectedProduct.description} />
        </>
      ) : (
        <>
          <title>SIN_WEBSHOP | Premium Tech, Lifestyle &amp; Home Goods</title>
          <meta name="description" content="Ihr exklusiver Concept-Store für kuratierte Tech-Gadgets, minimalistische Einrichtungsgegenstände und zeitlose Lifestyle-Accessoires mit kompromisslosem Anspruch an Design und Material." />
        </>
      )}
      {/* Temu & Amazon Promos Urgency Ticker Header */}
      <div className="w-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 py-2 px-4 text-slate-950 font-black text-center flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-5 text-xs shadow-md border-b border-orange-700/60 select-none">
        <div className="flex items-center gap-1.5 justify-center">
          <span className="bg-slate-950 text-orange-400 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider animate-pulse shrink-0">
            Blitzangebot
          </span>
          <span className="font-black text-[11px] text-slate-950">
            Rabatte von bis zu 80% + Kostenloser Versand auf ALLES heute!
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-950 font-bold justify-center shrink-0">
          <span>Gutscheincode: </span>
          <span className="font-mono bg-slate-950 text-white px-2 py-0.5 rounded font-black text-[10px] select-all border border-slate-900/40">
            TEMU20
          </span>
          <div className="h-3 w-px bg-slate-950/20 hidden md:block" />
          <span className="flex items-center gap-1 font-mono font-black text-rose-950">
            ⏰ Endet in: {String(countdown.hours).padStart(2, "0")}:
            {String(countdown.minutes).padStart(2, "0")}:
            {String(countdown.seconds).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Dynamic Glow Accents page-wide */}
      <div className="pointer-events-none fixed top-0 left-1/2 -z-30 h-100 w-200 -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl"></div>

      {/* Main Glassy Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        wishlistCount={wishlist.length}
        onCartToggle={() => setActiveTab("cart")}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentUser={currentUser}
        onToggleUser={handleToggleUser}
      />

      {/* Central Content Container Frame */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === "shop" ? (
          <div className="space-y-5">
            {/* The Visual Hero Banner */}
            <Hero
              products={products}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onAddToCart={handleAddToCart}
              onViewDetails={handleViewProduct}
              onApplyDiscount={handleApplyLuckyDiscount}
            />

            {/* Shop Section Anchor */}
            <div id="products-explore" className="scroll-mt-24 space-y-4">
              {/* Category Filter Title */}
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 border-b border-gray-150 pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-black text-[#ef5006] uppercase tracking-wider border border-orange-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-600 animate-ping"></span>
                    <span>⚡ LIVE-BESTÄNDE BEGRENZT</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-gray-950 tracking-tight leading-none">
                    {selectedCategory === "All Products"
                      ? "Alle Angebote"
                      : selectedCategory}{" "}
                    <span className="text-gray-400 font-medium text-xs sm:text-sm">
                      ({filteredProducts.length} Artikel gefunden)
                    </span>
                  </h2>
                </div>

                <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
                  {/* Dynamic subcategory filter dropdown */}
                  {availableSubcategories.length > 1 && (
                    <div className="flex items-center gap-1.5 bg-white border border-gray-150 rounded-xl px-2.5 py-1.5 shadow-xs">
                      <label
                        htmlFor="product-subcategory"
                        className="text-[10px] sm:text-[11px] font-black uppercase text-gray-450 tracking-wider whitespace-nowrap"
                      >
                        Typ/Sub:
                      </label>
                      <select
                        id="product-subcategory"
                        value={selectedSubcategory}
                        onChange={(e) => setSelectedSubcategory(e.target.value)}
                        className="bg-transparent text-gray-800 text-xs font-bold focus:outline-none cursor-pointer pr-1"
                      >
                        {availableSubcategories.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub === "All Subcategories" ? "Alle Typen" : sub}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Sorting dropdown */}
                  <div className="flex items-center gap-1.5 bg-white border border-gray-150 rounded-xl px-2.5 py-1.5 shadow-xs">
                    <label
                      htmlFor="product-sort"
                      className="text-[10px] sm:text-[11px] font-black uppercase text-gray-450 tracking-wider"
                    >
                      Sortieren:
                    </label>
                    <select
                      id="product-sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent text-gray-800 text-xs font-bold focus:outline-none cursor-pointer pr-1"
                    >
                      <option value="default">Standard-Angebote</option>
                      <option value="price-asc">Preis: Niedrig zu Hoch</option>
                      <option value="price-desc">Preis: Hoch zu Niedrig</option>
                      <option value="rating-desc">Beliebteste (Sterne)</option>
                    </select>
                  </div>

                  <div className="text-[10px] sm:text-[11px] text-gray-550 font-bold bg-gray-50 border border-gray-150 rounded-xl px-3 py-1.5">
                    ⚡ Preise gelten nur für kurze Zeit &amp; solange der Vorrat
                    reicht!
                  </div>
                </div>
              </div>

              {/* Grid of Product Cards */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isWished={wishlist.includes(product.id)}
                      onToggleWishlist={handleToggleWishlist}
                      onAddToCart={handleAddToCart}
                      onViewDetails={handleViewProduct}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 text-center space-y-3 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 text-gray-400">
                    <Store className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800">
                    Keine Produkte gefunden
                  </h3>
                  <p className="text-xs text-gray-500 max-w-sm">
                    Für "{searchQuery}" in der Kategorie "{selectedCategory}"
                    konnten wir leider kein Produkt finden. Versuchen Sie es mit
                    anderen Begriffen.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("All Products");
                    }}
                    className="mt-2 text-xs font-bold text-orange-500 hover:underline"
                  >
                    Filter zurücksetzen
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === "cart" ? (
          /* Dedicated detailed Cart & Stepped Checkout page */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CartPage
              cartItems={cartItems}
              products={products}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onOrderCompleted={handleOrderCompleted}
              onBackToShop={() => setActiveTab("shop")}
            />
          </motion.div>
        ) : activeTab === "account" ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CustomerDashboard
              orders={orders}
              currentUser={currentUser}
              wishlistCount={wishlist.length}
              onUpdateProfile={(updatedUser) => {
                setCurrentUser(updatedUser);
              }}
              onAddToCart={handleAddToCart}
              onNavigateToShop={() => setActiveTab("shop")}
              onOpenCart={() => setActiveTab("cart")}
              showToast={showToast}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="border-b border-gray-150 pb-4">
              <h2 className="text-xl sm:text-2xl font-black text-gray-950 tracking-tight flex items-center gap-2">
                <Heart className="h-6 w-6 fill-orange-500 text-orange-500" />{" "}
                Meine Wunschliste
              </h2>
            </div>

            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products
                  .filter((p) => wishlist.includes(p.id))
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isWished={true}
                      onToggleWishlist={handleToggleWishlist}
                      onAddToCart={handleAddToCart}
                      onViewDetails={handleViewProduct}
                    />
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-16 text-center space-y-3 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 border border-orange-100 text-orange-500">
                  <Heart className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-gray-800">
                  Ihre Wunschliste ist leer
                </h3>
                <p className="text-xs text-gray-500 max-w-sm">
                  Klicken Sie auf das Herzsymbol eines Produkts, um es für
                  später zu speichern.
                </p>
                <button
                  onClick={() => setActiveTab("shop")}
                  className="mt-4 rounded-xl bg-gray-900 px-6 py-2.5 text-xs font-bold text-white transition-all hover:bg-gray-800"
                >
                  Produkte entdecken
                </button>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Premium Multi-Column Experience Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white pt-16 pb-12 text-xs text-gray-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Trust badges strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-gray-150">
            <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900">Gratis Premium-Versand</h4>
                <p className="text-[11px] text-gray-400 font-bold">Kostenfrei ab 50 € in ganz EU</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900">100% Sicherer Check-out</h4>
                <p className="text-[11px] text-gray-400 font-bold">Verschlüsselte SSL-Sicherheit</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900">Zufriedenheitsgarantie</h4>
                <p className="text-[11px] text-gray-400 font-bold">30 Tage Rückgaberecht / Umtausch</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-900">24/7 Premium-Support</h4>
                <p className="text-[11px] text-gray-400 font-bold">Schnelle Hilfe per Mail &amp; Chat</p>
              </div>
            </div>
          </div>

          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            
            {/* Column 1: Store Intro & Slogan */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-transparent bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-lg tracking-tight">
                  SIN_WEBSHOP
                </span>
                <span className="text-[10px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Est. 2026
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                Ihr exklusiver Concept-Store für kuratierte Tech-Gadgets, minimalistische Einrichtungsgegenstände und zeitlose Lifestyle-Accessoires mit kompromisslosem Anspruch an Design und Material.
              </p>
              
              <div className="space-y-2 pt-2">
                <span className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Social Media</span>
                <div className="flex gap-2.5">
                  <a href="#" onClick={(e) => { e.preventDefault(); showToast("Folgen Sie uns auf Instagram für Insights!", "info"); }} className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 transition-all cursor-pointer">
                    <Instagram className="h-4 w-4" />
                  </a>
                  <a href="#" onClick={(e) => { e.preventDefault(); showToast("Werden Sie Teil unserer Facebook-Community!", "info"); }} className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 transition-all cursor-pointer">
                    <Facebook className="h-4 w-4" />
                  </a>
                  <a href="#" onClick={(e) => { e.preventDefault(); showToast("Sehen Sie unsere Reviews auf YouTube!", "info"); }} className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 transition-all cursor-pointer">
                    <Youtube className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: Direct Navigation */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-900 border-b border-gray-150 pb-2">Kategorien</h3>
              <ul className="space-y-2.5 font-bold text-gray-600 font-sans">
                <li>
                  <button onClick={() => { setSelectedCategory("All Products"); setActiveTab("shop"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-orange-600 hover:underline transition-colors cursor-pointer text-left">
                    Alle Produkte
                  </button>
                </li>
                <li>
                  <button onClick={() => { setSelectedCategory("Tech & Gadgets"); setActiveTab("shop"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-orange-600 hover:underline transition-colors cursor-pointer text-left flex items-center gap-1.5">
                    <span className="h-1 w-1 bg-orange-500 rounded-full" /> Tech &amp; Gadgets
                  </button>
                </li>
                <li>
                  <button onClick={() => { setSelectedCategory("Lifestyle & Accessories"); setActiveTab("shop"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-orange-600 hover:underline transition-colors cursor-pointer text-left flex items-center gap-1.5">
                    <span className="h-1 w-1 bg-orange-500 rounded-full" /> Lifestyle &amp; Accessoires
                  </button>
                </li>
                <li>
                  <button onClick={() => { setSelectedCategory("Home & Living"); setActiveTab("shop"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-orange-600 hover:underline transition-colors cursor-pointer text-left flex items-center gap-1.5">
                    <span className="h-1 w-1 bg-orange-500 rounded-full" /> Home &amp; Living
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Service Links & Help */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-900 border-b border-gray-150 pb-2">Hilfe &amp; Service</h3>
              <ul className="space-y-2.5 font-bold text-gray-600">
                <li>
                  <button onClick={() => { setActiveTab("account"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="hover:text-orange-600 hover:underline transition-colors cursor-pointer text-left">
                    Kundenkonto &amp; Bestellverlauf
                  </button>
                </li>
                <li>
                  <button onClick={() => { showToast("Sichere SSL-Bezahlung über Stripe, PayPal, Klarna und Sofortüberweisung ist standardmäßig aktiv.", "info"); }} className="hover:text-orange-600 hover:underline transition-colors cursor-pointer text-left">
                    Zahlungsarten &amp; Sicherheit
                  </button>
                </li>
                <li>
                  <button onClick={() => { showToast("EU-Premium-Versand mit Sendungsverfolgung. Lieferdauer 1-3 Werktage. DHL Express zubuchbar.", "info"); }} className="hover:text-orange-600 hover:underline transition-colors cursor-pointer text-left">
                    Versand &amp; Sendungsverfolgung
                  </button>
                </li>
                <li>
                  <button onClick={() => { showToast("Unser Support steht Ihnen rund um die Uhr zur Verfügung! Schreiben Sie uns an: support@sin-webshop.de", "info"); }} className="hover:text-orange-600 hover:underline transition-colors cursor-pointer text-left">
                    Kontakt &amp; Supportanfragen
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Exquisite Newsletter Card */}
            <div className="space-y-4">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-900 border-b border-gray-150 pb-2">Newsletter</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Melden Sie sich an und erhalten Sie sofort einen <strong className="text-orange-600">10% Gutscheincode</strong> für Ihre nächste Bestellung sowie Zugang zu exklusiven Produktlaunches.
              </p>
              
              {!newsletterSubscribed ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newsletterEmail.trim()) {
                      setNewsletterSubscribed(true);
                      showToast("Newsletter erfolgreich abonniert! Gutschein 'SINNEW10' wurde in die Zwischenablage kopiert.", "success");
                      try {
                        navigator.clipboard.writeText("SINNEW10");
                      } catch (err) {
                        console.error("Clipboard copy failed", err);
                      }
                    }
                  }}
                  className="flex gap-2"
                >
                  <div className="relative flex-grow">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Ihre E-Mail..."
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-3 py-2.5 text-xs font-bold text-gray-900 outline-hidden focus:border-orange-500 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/10 cursor-pointer"
                    title="Abonnieren"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4 space-y-2 text-center">
                  <span className="block text-xs font-black text-orange-600">Abonnement erfolgreich! 🎉</span>
                  <div className="flex flex-col items-center gap-1 bg-white border border-dashed border-orange-200 rounded-xl p-2">
                    <span className="text-[10px] text-gray-450 font-black tracking-widest uppercase">Ihr Rabattcode</span>
                    <strong className="text-sm font-mono font-black text-gray-950 select-all tracking-wider">SINNEW10</strong>
                  </div>
                  <p className="text-[10px] text-gray-500 font-semibold">-10% Coupon in Zwischenablage kopiert &amp; bereit für Check-out.</p>
                </div>
              )}
            </div>

          </div>

          {/* Divider and Footer Meta row */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-gray-150 text-[10px] font-semibold text-gray-400">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-center md:justify-start">
              <span>© 2026 SIN_WEBSHOP Concept Goods. Alle Rechte vorbehalten.</span>
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 bg-gray-200 rounded-full" />
                <button type="button" onClick={() => showToast("Rechtshinweis: SIN_WEBSHOP ist ein fiktives Konzept-Demo-System.", "info")} className="hover:text-gray-600 transition-colors cursor-pointer">Impressum</button>
                <span className="h-1 w-1 bg-gray-200 rounded-full" />
                <button type="button" onClick={() => showToast("Datenverwendung: Alle Profildaten verbleiben lokal in Ihrem Browser (Sicherheitsstandard).", "info")} className="hover:text-gray-600 transition-colors cursor-pointer">Datenschutz</button>
                <span className="h-1 w-1 bg-gray-200 rounded-full" />
                <button type="button" onClick={() => showToast("Hier gelten die Standard-Demobestellungsbedingungen von SIN.", "info")} className="hover:text-gray-600 transition-colors cursor-pointer">Allgemeine Geschäftsbedingungen</button>
              </div>
            </div>

            {/* Payment security badges */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] font-extrabold uppercase tracking-widest text-gray-300 mr-1 hidden sm:inline">PAYMENT METHODS</span>
              <span className="font-mono text-[8.5px] tracking-wider text-gray-500 font-extrabold border border-gray-200 px-1.5 py-0.5 rounded-md bg-white">VISA</span>
              <span className="font-mono text-[8.5px] tracking-wider text-gray-500 font-extrabold border border-gray-200 px-1.5 py-0.5 rounded-md bg-white">MC</span>
              <span className="font-mono text-[8.5px] tracking-wider text-gray-500 font-extrabold border border-gray-200 px-1.5 py-0.5 rounded-md bg-white">AMEX</span>
              <span className="font-mono text-[8.5px] tracking-wider text-gray-500 font-extrabold border border-gray-200 px-1.5 py-0.5 rounded-md bg-white">PAYPAL</span>
              <span className="font-mono text-[8.5px] tracking-wider text-gray-500 font-extrabold border border-gray-200 px-1.5 py-0.5 rounded-md bg-white">KLARNA</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Absolute state flyouts overlays */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckoutTrigger}
      />

      {/* Dynamic details modal layout */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        allProducts={products}
        browsingHistory={browsingHistory}
        currentUser={currentUser}
        onToggleUser={handleToggleUser}
        onAddReview={handleAddReview}
        onViewProduct={handleViewProduct}
      />

      <Notification toasts={toasts} onRemoveToast={handleRemoveToast} />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      <TemuLuckyBox onApplyDiscount={handleApplyLuckyDiscount} />

      {/* Floating Persisting bar for mobile layouts */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        wishlistCount={wishlist.length}
        onCartToggle={() => setActiveTab("cart")}
      />
    </div>
  );
}
