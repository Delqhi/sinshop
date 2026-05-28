/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'info' | 'error';
}

interface NotificationProps {
  toasts: ToastMessage[];
  onRemoveToast: (id: string) => void;
}

export default function Notification({ toasts, onRemoveToast }: NotificationProps) {
  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 pointer-events-none md:bottom-6 sm:right-6 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemoveToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="pointer-events-auto flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xl shadow-gray-200/20"
    >
      {/* Dynamic Type icon representation */}
      <div className="shrink-0">
        {toast.type === 'success' && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-550/10 text-orange-600 border border-orange-550/15">
            <Check className="h-4 w-4" />
          </div>
        )}
        {toast.type === 'info' && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Info className="h-4 w-4" />
          </div>
        )}
        {toast.type === 'error' && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-650 border border-red-100">
            <AlertTriangle className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Message Label */}
      <p className="flex-1 font-sans text-xs font-bold text-gray-800">
        {toast.text}
      </p>

      {/* Close cross */}
      <button
        onClick={() => onRemove(toast.id)}
        className="text-gray-400 transition-colors hover:text-gray-800"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
