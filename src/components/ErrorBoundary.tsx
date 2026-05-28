import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    // Attempt standard browser reload and clear temporary states if needed
    try {
      localStorage.removeItem("sin_cart_items"); // Clear potentially corrupt cart in case that caused the crash
    } catch (e) {
      console.error(e);
    }
    window.location.href = window.location.origin;
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16 font-sans">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-250 bg-white p-8 text-center shadow-2xl transition-all">
            {/* Top decorative gradient or border */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500" />

            {/* Error Graphic Card */}
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 border border-orange-100/60 animate-pulse">
              <AlertTriangle className="h-8 w-8" />
            </div>

            {/* Title / Description */}
            <div className="space-y-2">
              <h2 className="text-xl font-black text-gray-950 tracking-tight">
                Ein unerwarteter Fehler ist aufgetreten
              </h2>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Der Webshop konnte eine Komponente nicht wie gewohnt laden. Keine Sorge: Ihre Profildaten verbleiben sicher in Ihrem lokalen Speicher.
              </p>
            </div>

            {/* Error Message Details box */}
            {this.state.error && (
              <div className="my-5 rounded-2xl bg-slate-50 border border-gray-200 p-4 text-left">
                <span className="block text-[10px] uppercase tracking-wider font-extrabold text-gray-400">
                  Fehlerdetails
                </span>
                <span className="block mt-1.5 font-mono text-[11px] font-black text-red-600 line-clamp-3 bg-red-50/40 p-2.5 rounded-xl border border-red-100/50 break-all select-all">
                  {this.state.error.name}: {this.state.error.message}
                </span>
              </div>
            )}

            {/* Elegant action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-orange-500 text-white hover:bg-orange-600 px-4 py-3 text-xs font-black transition-all shadow-md shadow-orange-500/10 hover:shadow-lg cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5 animate-spin-reverse" />
                <span>Seite neu laden</span>
              </button>
              
              <button
                type="button"
                onClick={this.handleReset}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-gray-200 text-gray-750 bg-white hover:bg-slate-50 px-4 py-3 text-xs font-black transition-all cursor-pointer"
              >
                <Home className="h-3.5 w-3.5 text-gray-400" />
                <span>Shop zurücksetzen</span>
              </button>
            </div>

            <div className="mt-8 text-[10px] font-semibold text-gray-400">
              Gerbrauchsgüter Concept Goods &bull; SIN_WEBSHOP 2026
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
