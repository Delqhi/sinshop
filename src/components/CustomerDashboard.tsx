/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  User,
  ShoppingBag,
  MapPin,
  Mail,
  Truck,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ShieldCheck,
  Heart,
  Save,
  ChevronRight,
  ExternalLink,
  Copy,
  Calendar,
  Lock,
  Headphones,
  HelpCircle,
  FileText,
  ArrowLeftRight,
  AlertCircle
} from "lucide-react";
import { Order, User as UserType, Product } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CustomerDashboardProps {
  orders: Order[];
  currentUser: UserType;
  wishlistCount: number;
  onUpdateProfile: (updatedUser: UserType) => void;
  onAddToCart: (product: Product, quantity: number, color?: string, size?: string) => void;
  onNavigateToShop: () => void;
  onOpenCart: () => void;
  showToast: (text: string, type: "success" | "info" | "error") => void;
}

export default function CustomerDashboard({
  orders,
  currentUser,
  wishlistCount,
  onUpdateProfile,
  onAddToCart,
  onNavigateToShop,
  onOpenCart,
  showToast,
}: CustomerDashboardProps) {
  // Navigation tabs for the professional dashboard area
  const [dashboardTab, setDashboardTab] = useState<"orders" | "discounts" | "profile" | "support">("orders");

  // Expanded order details mapper
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  // Address & Profile Form states
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [street, setStreet] = useState(() => localStorage.getItem("sin_shop_user_street") || "");
  const [zip, setZip] = useState(() => localStorage.getItem("sin_shop_user_zip") || "");
  const [city, setCity] = useState(() => localStorage.getItem("sin_shop_user_city") || "");

  // Support / Return interactive elements
  const [selectedReturnOrder, setSelectedReturnOrder] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [isReturnProcessing, setIsReturnProcessing] = useState(false);
  const [returnSuccessData, setReturnSuccessData] = useState<{ labelId: string; qrCodeUrl: string } | null>(null);

  // Active FAQ toggler
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Status Filter for Bestellungen (In Bearbeitung, Versendet, Zugestellt)
  const [statusFilter, setStatusFilter] = useState<"all" | "processing" | "shipped" | "delivered">("all");

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "K";
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Der Name darf nicht leer sein.", "error");
      return;
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      showToast("Gültige E-Mail-Adresse erforderlich.", "error");
      return;
    }

    onUpdateProfile({
      ...currentUser,
      name: name.trim(),
      email: email.trim(),
    });

    localStorage.setItem("sin_shop_user_street", street.trim());
    localStorage.setItem("sin_shop_user_zip", zip.trim());
    localStorage.setItem("sin_shop_user_city", city.trim());

    showToast("Profildaten und primäre Lieferadresse erfolgreich gespeichert.", "success");
  };

  const handleReorder = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    let count = 0;
    order.items.forEach((item) => {
      onAddToCart(item.product, item.quantity, item.selectedColor, item.selectedSize);
      count += item.quantity;
    });
    showToast(`${count} Artikel direkt wieder in Ihren Warenkorb gelegt.`, "success");
    onOpenCart();
  };

  const handleReturnRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReturnOrder) {
      showToast("Bitte wählen Sie eine Bestellung für die Rückgabe aus.", "error");
      return;
    }
    if (!returnReason) {
      showToast("Bitte geben Sie einen Grund für Ihre Rückgabe an.", "error");
      return;
    }

    setIsReturnProcessing(true);
    setReturnSuccessData(null);

    // Simulate DHL QR code / Shipping label generation API call
    setTimeout(() => {
      setIsReturnProcessing(false);
      const generatedLabel = `DHL-RET-${Math.floor(100000 + Math.random() * 900000)}`;
      setReturnSuccessData({
        labelId: generatedLabel,
        qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + encodeURIComponent(generatedLabel)
      });
      showToast("DHL-Retourenschein und QR-Code erfolgreich generiert.", "success");
    }, 1200);
  };

  // Safe delivery status calculator matching DHL tracker API standard
  const getDeliveryStatus = (orderId: string) => {
    const num = orderId.charCodeAt(orderId.length - 1) || 0;
    const progressStep = (num % 3) + 1; // 1: Preparation, 2: In transit, 3: Delivered
    
    return {
      step: progressStep,
      text: progressStep === 1 
        ? "Wird verpackt" 
        : progressStep === 2 
        ? "Auf dem Versandweg (DHL)" 
        : "Zustellung erfolgt",
      color: progressStep === 3 
        ? "text-emerald-700 bg-emerald-50 border-emerald-150" 
        : progressStep === 2 
        ? "text-orange-700 bg-orange-50 border-orange-150" 
        : "text-blue-700 bg-blue-50 border-blue-150"
    };
  };

  // Spending trends calculations & Recharts helper objects
  const parseDEToDate = (dateStr: string): Date => {
    const parts = dateStr.split(".");
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateStr);
  };

  const getSortedOrders = () => {
    return [...orders].sort((a, b) => {
      return parseDEToDate(a.date).getTime() - parseDEToDate(b.date).getTime();
    });
  };

  const sortedOrders = getSortedOrders();
  let cumulativeSpend = 0;
  const chartData = sortedOrders.map((order, idx) => {
    cumulativeSpend += order.total;
    return {
      date: order.date,
      "Bestellwert": Number(order.total.toFixed(2)),
      "Gesamtausgaben": Number(cumulativeSpend.toFixed(2)),
      index: idx + 1,
    };
  });

  const maxOrderValue = orders.length > 0 ? Math.max(...orders.map(o => o.total)) : 0;
  const avgOrderValue = orders.length > 0 ? orders.reduce((sum, o) => sum + o.total, 0) / orders.length : 0;

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  const countByStatus = {
    all: orders.length,
    processing: orders.filter((o) => getDeliveryStatus(o.id).step === 1).length,
    shipped: orders.filter((o) => getDeliveryStatus(o.id).step === 2).length,
    delivered: orders.filter((o) => getDeliveryStatus(o.id).step === 3).length,
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "all") return true;
    const s = getDeliveryStatus(order.id);
    if (statusFilter === "processing" && s.step === 1) return true;
    if (statusFilter === "shipped" && s.step === 2) return true;
    if (statusFilter === "delivered" && s.step === 3) return true;
    return false;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Code "${text}" kopiert. Fügen Sie diesen im Checkout ein.`, "success");
  };

  const promoCodes = [
    { code: "BLITZ80", percent: 80, desc: "Sonderrabatt für ausgewählte Blitzdeal-Aktionen", status: "Aktiv" },
    { code: "WELCOME30", percent: 30, desc: "Ihr exklusiver Willkommensrabatt auf das gesamte Sortiment", status: "Aktiv" },
    { code: "FREESHIP15", percent: 15, desc: "15% Nachlass auf nationale Versandkosten bei DHL-Express", status: "Aktiv" }
  ];

  const faqItems = [
    {
      q: "Wie läuft der Versand und wann erhalte ich meine Lieferung?",
      a: "Alle Bestellungen werden direkt nach Zahlungseingang (Standard über Stripe) verarbeitet. Durch unsere integrierte Lieferantenkopplung mit DHL Express Premium beträgt die Lieferzeit im Regelfall 2 bis 3 Werktage. Sie erhalten Ihre Sendungsnummer direkt nach der Übergabe an den Paketdienst."
    },
    {
      q: "Sind meine Zahlungsdaten bei Ihnen sicher hinterlegt?",
      a: "Ja, absolut. Wir nützen zu keinem Zeitpunkt eigene Speichermethoden für vertrauliche Kreditkarten- oder Bankdaten. Deswegen arbeiten wir mit dem Branchenstandard Stripe zusammen, welcher alle Zahlungen Ende-zu-Ende verschlüsselt und nach höchsten Sicherheitsrichtlinien abwickelt."
    },
    {
      q: "Wie fordere ich eine Rücksendung oder Retoure an?",
      a: "Wir bieten ein volldigitales Retourencenter. Navigieren Sie im Dashboards einfach zum Reiter 'Retouren & Support', wählen Sie die betreffende Bestellung aus und geben Sie den Grund an. Es wird sofort ein DHL-QR-Code geladen, mit dem Sie das Paket kostenfrei in jeder DHL-Filiale abgeben können."
    },
    {
      q: "Kann ich meine Lieferadresse nach der Bestellung noch ändern?",
      a: "Wegen automatisierter Routenplanungen in unseren Logistikzentren können Adressänderungen nur innerhalb von 30 Minuten nach Abschluss der Bestellung berücksichtigt werden. Bitte wenden Sie sich in diesem Fall direkt via support@sinshop.de an unser Support-Team."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Prime Customer Overview Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 h-40 w-40 bg-gradient-to-br from-orange-500/10 to-amber-500/5 blur-3xl rounded-full" />
        <div className="absolute left-1/3 bottom-0 h-20 w-48 bg-slate-500/5 blur-2xl rounded-full" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            {/* Elegant Letter Avatar */}
            <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-700/60 flex items-center justify-center text-white font-black text-2xl shadow-lg">
              {getInitials(currentUser.name)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">{currentUser.name}</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                  Registriertes Kundenkonto
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-slate-500" /> {currentUser.email || "Gast-E-Mail"}
              </p>
            </div>
          </div>

          {/* Key Facts Summary Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-slate-950/50 p-4 rounded-2xl border border-white/5 backdrop-blur-md max-w-sm w-full md:w-auto shrink-0">
            <div className="text-center px-2">
              <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Umsatz</span>
              <span className="block font-mono text-xs sm:text-sm font-black text-orange-400 mt-1">
                {totalSpent.toFixed(2)} €
              </span>
            </div>
            <div className="text-center px-2 border-x border-white/10">
              <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider">Käufe</span>
              <span className="block font-mono text-xs sm:text-sm font-black text-amber-400 mt-1">
                {orders.length}
              </span>
            </div>
            <div className="text-center px-2">
              <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">Merkzettel</span>
              <span className="block font-sans text-xs sm:text-sm font-black text-emerald-400 mt-1 flex items-center justify-center gap-0.5">
                <Heart className="h-3 w-3 fill-emerald-400 text-emerald-400 shrink-0" /> {wishlistCount}
              </span>
            </div>
          </div>
        </div>

        {/* Professional Navigation Tabs */}
        <div id="customer-nav-tabs" className="flex flex-wrap gap-2 border-t border-slate-800 mt-6 pt-5">
          <button
            onClick={() => setDashboardTab("orders")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              dashboardTab === "orders"
                ? "bg-[#ef5006] text-white shadow-md shadow-orange-500/20"
                : "text-slate-405 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Bestellverlauf ({orders.length})</span>
          </button>
          
          <button
            onClick={() => setDashboardTab("discounts")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              dashboardTab === "discounts"
                ? "bg-[#ef5006] text-white shadow-md shadow-orange-500/20"
                : "text-slate-405 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Rabattcodes &amp; Angebote</span>
          </button>

          <button
            onClick={() => setDashboardTab("profile")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              dashboardTab === "profile"
                ? "bg-[#ef5006] text-white shadow-md shadow-orange-500/20"
                : "text-slate-405 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Adresse &amp; Daten</span>
          </button>

          <button
            onClick={() => setDashboardTab("support")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              dashboardTab === "support"
                ? "bg-[#ef5006] text-white shadow-md shadow-orange-500/20"
                : "text-slate-405 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Headphones className="h-3.5 w-3.5" />
            <span>Retouren &amp; Hilfe</span>
          </button>
        </div>
      </div>

      {/* Main Tab Render Space */}
      <AnimatePresence mode="wait">
        {/* Tab 1: Orders Tab */}
        {dashboardTab === "orders" && (
          <motion.div
            key="dashboard-orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white py-16 text-center space-y-4 shadow-xs">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 border border-orange-100 text-orange-500">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-950">Noch keine Einkäufe getätigt</h3>
                  <p className="text-xs text-gray-500 max-w-sm mt-1 font-semibold leading-relaxed">
                    Ihr Kundenkonto hat aktuell noch keine aktiven Bestellungen registriert. Entdecken Sie erstklassige Gadgets und exklusive Tagesangebote direkt in unserer Kollektion.
                  </p>
                </div>
                <button
                  onClick={onNavigateToShop}
                  className="rounded-xl bg-[#ef5006] px-6 py-3 text-xs font-black text-white hover:bg-orange-600 transition-all active:scale-95 shadow-md shadow-orange-500/10 cursor-pointer"
                >
                  Kollation durchstöbern
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h2 className="text-xs font-black uppercase text-gray-400 tracking-wider">
                    Einkaufshistorie ({orders.length} Bestellungen)
                  </h2>
                  <span className="text-[10px] bg-slate-50 text-slate-600 font-extrabold border border-slate-200/80 px-2.5 py-0.5 rounded-full">
                    Sichere Verbindung via Stripe OCI
                  </span>
                </div>

                {/* Spending Trends Chart Card */}
                <div id="ausgaben-trends-chart" className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-150/60 pb-4">
                    <div>
                      <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-orange-500" />
                        Ausgaben-Analyse &amp; Bestelltrends
                      </h3>
                      <p className="text-[11px] text-gray-400 font-bold">
                        Wachstum Ihrer Gesamtausgaben und Verteilung der Bestellwerte über die Zeit
                      </p>
                    </div>
                    <span className="text-[10px] bg-orange-50 text-orange-600 font-black border border-orange-100 px-2.5 py-0.5 rounded-full w-fit">
                      Echtzeit-Statistik
                    </span>
                  </div>

                  {/* Analytic cards/KPI row inside the chart card */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-gray-200 p-3.5 rounded-2xl">
                      <span className="block text-[10px] text-gray-450 font-black uppercase tracking-wider">Gesamtausgaben</span>
                      <span className="block font-mono text-base font-black text-slate-900 mt-1">
                        {totalSpent.toFixed(2)} €
                      </span>
                    </div>
                    <div className="bg-slate-50 border border-gray-200 p-3.5 rounded-2xl">
                      <span className="block text-[10px] text-gray-450 font-black uppercase tracking-wider">Durchschnittl. Bestellwert</span>
                      <span className="block font-mono text-base font-black text-slate-900 mt-1">
                        {avgOrderValue.toFixed(2)} €
                      </span>
                    </div>
                    <div className="bg-slate-50 border border-gray-200 p-3.5 rounded-2xl">
                      <span className="block text-[10px] text-gray-450 font-black uppercase tracking-wider">Höchster Einkauf</span>
                      <span className="block font-mono text-base font-black text-slate-900 mt-1">
                        {maxOrderValue.toFixed(2)} €
                      </span>
                    </div>
                  </div>

                  {/* Recharts Area Chart */}
                  <div className="w-full h-[240px] pt-2" style={{ minWidth: '0' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef5006" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#ef5006" stopOpacity={0.01}/>
                          </linearGradient>
                          <linearGradient id="colorOrder" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#fb923c" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#fb923c" stopOpacity={0.01}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fill: '#64748b', fontSize: 9, fontWeight: 'bold' }} 
                          axisLine={false} 
                          tickLine={false} 
                          dy={6}
                        />
                        <YAxis 
                          tick={{ fill: '#64748b', fontSize: 9, fontWeight: 'bold' }} 
                          axisLine={false} 
                          tickLine={false} 
                          dx={-4}
                          tickFormatter={(v) => `${v} €`}
                        />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-slate-950 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 text-xs font-sans space-y-1.5 min-w-[150px]">
                                  <p className="font-extrabold text-slate-400 text-[10px] uppercase tracking-wider">Datum: <span className="text-white normal-case font-bold">{label}</span></p>
                                  <div className="h-[1px] bg-slate-800 my-1" />
                                  {payload.map((entry: any, index: number) => (
                                    <div key={index} className="flex justify-between items-center gap-4">
                                      <span className="font-semibold text-slate-300 flex items-center gap-1.5 text-[11px]">
                                        <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: entry.stroke || entry.fill }} />
                                        {entry.name}:
                                      </span>
                                      <span className="font-mono text-orange-500 font-extrabold text-[11px]">{entry.value.toFixed(2)} €</span>
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="Gesamtausgaben" 
                          stroke="#ef5006" 
                          strokeWidth={3} 
                          fillOpacity={1} 
                          fill="url(#colorSpend)" 
                          name="Gesamtausgaben"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="Bestellwert" 
                          stroke="#fb923c" 
                          strokeWidth={1.5} 
                          strokeDasharray="4 4"
                          fillOpacity={1} 
                          fill="url(#colorOrder)" 
                          name="Bestellwert"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[10px] text-gray-500 font-bold px-1 pt-1 justify-center sm:justify-start">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-4 rounded-xs bg-[#ef5006] inline-block" />
                      Gesamtausgaben (Kumulierter Trend)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-4 border-b border-orange-400 border-dashed inline-block" />
                      Bestellwert (Einzelner Einkaufswert)
                    </span>
                  </div>
                </div>

                {/* Status-based Filter Pills */}
                <div id="order-status-filter-bar" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border border-gray-200/80 p-4 rounded-3xl">
                  <div className="space-y-1">
                    <span className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Bestellliste filtern
                    </span>
                    <p className="text-[11px] text-gray-500 font-bold">
                      Schnellsuche nach DHL-Versandstatus
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { key: "all", label: "Alle", count: countByStatus.all, color: "bg-slate-400" },
                      { key: "processing", label: "In Bearbeitung", count: countByStatus.processing, color: "bg-blue-500" },
                      { key: "shipped", label: "Versendet", count: countByStatus.shipped, color: "bg-orange-500" },
                      { key: "delivered", label: "Zugestellt", count: countByStatus.delivered, color: "bg-emerald-500" }
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => {
                          setStatusFilter(item.key as any);
                          showToast(`Filter geändert: ${item.label}`, "info");
                        }}
                        className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-black transition-all cursor-pointer border ${
                          statusFilter === item.key
                            ? "bg-slate-900 border-slate-950 text-white shadow-xs"
                            : "bg-white border-gray-200 text-gray-650 hover:bg-gray-100 hover:border-gray-300"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
                        <span>{item.label}</span>
                        <span className={`inline-flex h-4 min-w-4 items-center justify-center rounded-md px-1 text-[9px] font-mono leading-none ${
                          statusFilter === item.key
                            ? "bg-slate-800 text-slate-200 font-bold"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {item.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white py-14 text-center space-y-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-gray-100 text-gray-400">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-black text-gray-900">Keine passenden Bestellungen</h4>
                        <p className="text-xs text-gray-500 max-w-xs font-semibold leading-relaxed">
                          Es liegen aktuell keine Einkäufe mit dem Status &bdquo;{
                            statusFilter === "processing" ? "In Bearbeitung" : statusFilter === "shipped" ? "Versendet" : "Zugestellt"
                          }&ldquo; vor.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setStatusFilter("all");
                          showToast("Alle Bestellungen werden angezeigt.", "info");
                        }}
                        className="rounded-xl border border-gray-200 text-gray-750 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-extrabold transition-all cursor-pointer"
                      >
                        Filter zurücksetzen
                      </button>
                    </div>
                  ) : (
                    filteredOrders.map((order) => {
                      const status = getDeliveryStatus(order.id);
                      const isExpanded = !!expandedOrders[order.id];

                      return (
                        <div
                          key={order.id}
                          className="rounded-2xl border border-gray-200 bg-white shadow-xs overflow-hidden transition-all hover:shadow-sm"
                        >
                          {/* Summary Header of Order Card */}
                          <div
                            onClick={() => toggleOrderExpand(order.id)}
                            className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 hover:bg-gray-50/40 cursor-pointer select-none"
                          >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
                              <div>
                                <span className="block text-[9px] uppercase font-bold text-gray-400">Auftrags-ID</span>
                                <span className="block font-mono text-xs font-black text-slate-900 mt-0.5 select-all">
                                  {order.id}
                                </span>
                              </div>
                              <div>
                                <span className="block text-[9px] uppercase font-bold text-gray-400">Rechnungsdatum</span>
                                <span className="block text-xs font-bold text-gray-700 mt-0.5">
                                  {order.date}
                                </span>
                              </div>
                              <div>
                                <span className="block text-[9px] uppercase font-bold text-gray-400">Betrag</span>
                                <span className="block font-mono text-xs font-black text-orange-600 mt-0.5">
                                  {order.total.toFixed(2)} €
                                </span>
                              </div>
                              <div>
                                <span className="block text-[9px] uppercase font-bold text-gray-400">Zustellung</span>
                                <span className={`block text-[10px] font-black px-2 py-0.5 rounded border mt-0.5 w-fit ${status.color}`}>
                                  {status.text}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 w-full lg:w-auto justify-end border-t border-gray-100 pt-3 lg:border-none lg:pt-0">
                              <button
                                onClick={(e) => handleReorder(order, e)}
                                className="rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100/80 border border-orange-200/50 px-3 py-1.5 text-xs font-black flex items-center gap-1 cursor-pointer transition-colors"
                                title="Erneut bestellen"
                              >
                                <RefreshCw className="h-3 w-3" />
                                <span>Wiederholen</span>
                              </button>
                              <button className="text-gray-400 p-1">
                                {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                              </button>
                            </div>
                          </div>

                          {/* Interactive live delivery progress meter */}
                          <div className="bg-gray-50/60 border-t border-b border-gray-150/40 py-3.5 px-5 grid grid-cols-3 gap-2 text-center text-[10px]">
                            <div className="flex flex-col items-center gap-1">
                              <div className={`h-5 w-5 rounded-full flex items-center justify-center border font-black text-[9px] ${
                                status.step >= 1 
                                  ? "bg-orange-600 text-white border-orange-600" 
                                  : "bg-gray-200 text-gray-400 border-gray-300"
                              }`}>
                                1
                              </div>
                              <span className={`font-black ${status.step >= 1 ? "text-slate-800" : "text-gray-400"}`}>
                                Eingegangen
                              </span>
                            </div>
                            
                            <div className="flex flex-col items-center gap-1 relative">
                              <div className="absolute top-2.5 -left-[45%] right-[45%] h-0.5 bg-gray-200 -z-10" />
                              <div className="absolute top-2.5 -right-[45%] left-[45%] h-0.5 bg-gray-200 -z-10" />

                              <div className={`h-5 w-5 rounded-full flex items-center justify-center border font-black text-[9px] relative z-10 ${
                                status.step >= 2 
                                  ? "bg-orange-600 text-white border-orange-600" 
                                  : "bg-gray-200 text-gray-400 border-gray-300"
                              }`}>
                                2
                              </div>
                              <span className={`font-black ${status.step >= 2 ? "text-slate-800" : "text-gray-400"}`}>
                                Unterwegs (DHL)
                              </span>
                            </div>

                            <div className="flex flex-col items-center gap-1">
                              <div className={`h-5 w-5 rounded-full flex items-center justify-center border font-black text-[9px] ${
                                status.step >= 3 
                                  ? "bg-emerald-600 text-white border-emerald-600" 
                                  : "bg-gray-200 text-gray-400 border-gray-300"
                              }`}>
                                3
                              </div>
                              <span className={`font-black ${status.step >= 3 ? "text-emerald-700" : "text-gray-400"}`}>
                                Zugestellt
                              </span>
                            </div>
                          </div>

                          {/* Collapsible Details */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="p-5 bg-white border-t border-gray-100 space-y-4">
                                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                    Enthaltene Positionen
                                  </h4>

                                  <div className="divide-y divide-gray-100">
                                    {order.items.map((item, idx) => (
                                      <div key={`${item.product.id}-${idx}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                        <img
                                          src={item.product.imageUrl}
                                          alt={item.product.title}
                                          referrerPolicy="no-referrer"
                                          className="h-10 w-10 object-cover rounded-md border border-gray-200 shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                          <h5 className="text-xs font-bold text-gray-900 truncate">
                                            {item.product.title}
                                          </h5>
                                          <div className="flex items-center gap-2 text-[9px] text-gray-400 font-extrabold tracking-wider uppercase mt-0.5">
                                            <span>{item.product.category}</span>
                                            {item.selectedColor && (
                                              <span className="inline-flex items-center gap-1">
                                                <span>• Farbe:</span>
                                                <span className="h-2.5 w-2.5 rounded-full border border-gray-300" style={{ backgroundColor: item.selectedColor }} />
                                              </span>
                                            )}
                                            {item.selectedSize && (
                                              <span>• Größe: {item.selectedSize}</span>
                                            )}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <span className="block font-mono text-xs font-black text-slate-900">
                                            {(item.product.price * item.quantity).toFixed(2)} €
                                          </span>
                                          <span className="block text-[9px] text-gray-450 font-bold">
                                            {item.quantity}x {item.product.price.toFixed(2)} €
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-200 text-xs">
                                    <div className="space-y-1">
                                      <h5 className="font-black text-gray-800 uppercase text-[9px] tracking-wider flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-orange-500" />
                                        Lieferadresse &amp; Logistik
                                      </h5>
                                      <p className="font-bold text-gray-705">{order.customerName}</p>
                                      <p className="text-gray-500">
                                        {order.address}, {order.zipCode} {order.city}
                                      </p>
                                      <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 pt-1 border-t border-gray-200/50 mt-1.5">
                                        <Truck className="h-3.5 w-3.5 text-emerald-600" />
                                        DHL National Premium Paket (Inkl. Tracking)
                                      </p>
                                    </div>

                                    <div className="space-y-1.5 lg:pl-6 border-t md:border-t-0 md:border-l border-gray-250/55 pt-3 md:pt-0 pb-1">
                                      <h5 className="font-black text-gray-800 uppercase text-[9px] tracking-wider">
                                        Abrechnungsdetails
                                      </h5>
                                      <div className="flex justify-between text-gray-500 text-[11px]">
                                        <span>Zwischensumme:</span>
                                        <span className="font-mono">{order.subtotal.toFixed(2)} €</span>
                                      </div>
                                      <div className="flex justify-between text-gray-500 text-[11px]">
                                        <span>Logistik &amp; Versand:</span>
                                        <span>{order.shipping === 0 ? "KOSTENFREI" : `${order.shipping.toFixed(2)} €`}</span>
                                      </div>
                                      <div className="flex justify-between font-black border-t border-dashed border-gray-200 pt-1 text-[11px] text-slate-900">
                                        <span>Gesamtsumme (inkl. USt):</span>
                                        <span className="font-mono text-orange-600">{order.total.toFixed(2)} €</span>
                                      </div>
                                      <p className="text-[9px] text-gray-400 font-bold text-right pt-0.5">
                                        Sichere Zahlung über {order.paymentMethod}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Tab 2: Discounts & Offers */}
        {dashboardTab === "discounts" && (
          <motion.div
            key="dashboard-discounts"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-orange-500" /> Aktive Aktionscodes und Gutscheine
                </h3>
                <p className="text-xs text-gray-500 mt-1 font-semibold leading-relaxed">
                  Fügen Sie diese Spar-Coupons während des Bezahlvorgangs im Warenkorb oder auf der Checkout-Seite ein. Es ist kein spielebasiertes Freischalten nötig – alle Rabatte stehen Ihnen ab sofort uneingeschränkt zur Verfügung.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {promoCodes.map((p) => (
                  <div
                    key={p.code}
                    className="p-5 bg-gray-50/60 rounded-2xl border border-gray-200 flex flex-col justify-between hover:bg-gray-50 transition-all gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] bg-orange-100 text-orange-850 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                          Rabatt {p.percent}%
                        </span>
                        <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                          ● Sofort nutzbar
                        </span>
                      </div>
                      <h4 className="font-mono text-sm font-black text-slate-900 select-all tracking-wider py-1">
                        {p.code}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed leading-tight">
                        {p.desc}
                      </p>
                    </div>

                    <button
                      onClick={() => copyToClipboard(p.code)}
                      className="w-full bg-white hover:bg-gray-100 border border-gray-250 py-2.5 rounded-xl text-[10px] font-black tracking-wider uppercase text-gray-700 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Code kopieren</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Informative Security Notice */}
              <div className="mt-4 pt-4 border-t border-gray-150 flex items-start gap-2.5 text-xs text-gray-500 font-medium leading-relaxed">
                <AlertCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Hinweis: Pro Bestellung kann systembedingt immer nur ein Gutscheincode bei Stripe angewendet werden. Die Rabatte werden direkt im Kassenformular in Abzug gebracht.
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Edit Profile Address Form */}
        {dashboardTab === "profile" && (
          <motion.div
            key="dashboard-profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <form
              onSubmit={handleProfileSave}
              className="rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 space-y-6 shadow-xs"
            >
              <div className="border-b border-gray-150 pb-4">
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-500" /> Stamm- &amp; Rechnungsanschrift hinterlegen
                </h3>
                <p className="text-xs text-gray-500 mt-1 font-semibold leading-relaxed">
                  Tragen Sie Ihre primäre Anschrift hier ein, um Ihre zukünftigen Bestellungen mit unserem automatisierten Express-Checkout noch schneller zu initiieren.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600">Vollständiger Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 font-semibold focus:bg-white focus:border-orange-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600">E-Mail-Adresse</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 font-semibold focus:bg-white focus:border-orange-500 outline-none transition-all"
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-600">Straße &amp; Hausnummer</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Musterstraße 12b"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 font-semibold focus:bg-white focus:border-orange-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600">Postleitzahl (PLZ)</label>
                  <input
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="12345"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 font-semibold focus:bg-white focus:border-orange-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600">Stadt / Ort</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Berlin"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 font-semibold focus:bg-white focus:border-orange-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="border-t border-gray-150 pt-5 flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl bg-[#ef5006] px-6 py-3 text-xs font-black text-white flex items-center gap-1.5 transition-all hover:bg-orange-600 active:scale-95 shadow-md shadow-orange-500/10 cursor-pointer animate-none"
                >
                  <Save className="h-4 w-4" />
                  <span>Stammdaten sichern</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Tab 4: Returns Center & Support FAQ */}
        {dashboardTab === "support" && (
          <motion.div
            key="dashboard-support"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Interactive Returns Center Form */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <ArrowLeftRight className="h-5 w-5 text-orange-500" /> Digitales Retouren-Center (DHL Kooperation)
                </h3>
                <p className="text-xs text-gray-500 mt-1 font-semibold leading-relaxed">
                  Sie planen ein Produkt innerhalb der 14-tägigen gesetzlichen Frist zurückzusenden? Wählen Sie einfach Ihre Bestellung aus. Sie erhalten sofort ein kostenfreies DHL-Rücksende-Etikett sowie einen QR-Code zur direkten Abgabe.
                </p>
              </div>

              {orders.length === 0 ? (
                <div className="bg-gray-50 text-center rounded-2xl p-6 border border-gray-200/60 text-xs text-gray-500 font-semibold leading-relaxed">
                  Retouren können erst angefordert werden, sobald Sie mindestens einen Kauf getätigt haben.
                </div>
              ) : (
                <form onSubmit={handleReturnRequest} className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
                  <div className="md:col-span-4 space-y-1.5">
                    <label className="text-xs font-black text-gray-700">Betreffende Bestellung auswählen</label>
                    <select
                      value={selectedReturnOrder}
                      required
                      onChange={(e) => {
                        setSelectedReturnOrder(e.target.value);
                        setReturnSuccessData(null); // Reset preview on change
                      }}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 font-semibold outline-none focus:bg-white focus:border-orange-500"
                    >
                      <option value="">-- Bestellung auswählen --</option>
                      {orders.map((o) => (
                        <option key={o.id} value={o.id}>
                          Bestellung vom {o.date} (Kaufwert: {o.total.toFixed(2)} €)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-5 space-y-1.5">
                    <label className="text-xs font-black text-gray-700">Grund für die Rückgabe</label>
                    <input
                      type="text"
                      required
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      placeholder="z.B. Passt nicht / gefällt nicht"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 font-semibold outline-none focus:bg-white focus:border-orange-500"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <button
                      type="submit"
                      disabled={isReturnProcessing}
                      className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs px-4 py-3 cursor-pointer select-none transition-all active:scale-95 disabled:bg-gray-400"
                    >
                      {isReturnProcessing ? "Wird generiert..." : "Rücksende-Label erstellen"}
                    </button>
                  </div>
                </form>
              )}

              {/* Dynamic DHL Shipping Sheet Render */}
              <AnimatePresence>
                {returnSuccessData && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-5 bg-emerald-50 rounded-2xl border border-emerald-150 flex flex-col md:flex-row items-center gap-5 justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-800">
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                        <span className="font-extrabold text-sm uppercase">Retourenschein bereit</span>
                      </div>
                      <p className="text-xs text-emerald-700 font-semibold leading-relaxed max-w-md">
                        Ihr versandkostenfreies DHL Retouren-Label wurde erstellt. Zeigen Sie den untenstehenden QR-Code einfach auf Ihrem Smartphone in einer DHL Station vor – DHL druckt das Label kostenlos für Sie aus, oder laden Sie es ausgedruckt auf Ihr Paket.
                      </p>
                      <div className="pt-1.5 flex items-center gap-3 text-[11px] font-bold text-slate-800">
                        <span>Rücksende-Code:</span>
                        <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-emerald-200 uppercase select-all">
                          {returnSuccessData.labelId}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-emerald-150 shrink-0 shadow-xs flex flex-col items-center gap-1.5">
                      <img src={returnSuccessData.qrCodeUrl} alt="DHL QR Code" className="h-28 w-28 object-contain" />
                      <span className="text-[8px] text-gray-400 font-black uppercase tracking-wider">MUSTER DHL QR CODE</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Help FAQs / Knowledge database */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-orange-500" /> Hilfe &amp; Kundenservice FAQs
              </h3>

              <div className="divide-y divide-gray-150">
                {faqItems.map((faq, index) => {
                  const isOpen = activeFaq === index;
                  return (
                    <div key={index} className="py-3.5 first:pt-0 last:pb-0">
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : index)}
                        className="w-full flex items-center justify-between text-left gap-4 font-extrabold text-xs text-gray-850 hover:text-orange-500 transition-colors cursor-pointer select-none"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-2 pl-1 bg-slate-50/50 p-3 rounded-lg border border-gray-200/40">
                              {faq.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Still have questions? Block */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ready-support">
                <div>
                  <span className="block font-black text-slate-800 uppercase text-[9px] tracking-wider">Noch Unklarheiten?</span>
                  <span className="text-[11px] text-gray-500 font-semibold">Unser Service steht Ihnen jederzeit via E-Mail zur Verfügung.</span>
                </div>
                <a
                  href="mailto:support@sinshop.de"
                  className="rounded-lg bg-slate-900 text-white font-extrabold text-[10px] px-3.5 py-2 hover:bg-slate-805 flex items-center gap-1 shadow-sm transition-transform active:scale-95 text-center"
                >
                  <Mail className="h-3 w-3 shrink-0" />
                  <span>support@sinshop.de</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
