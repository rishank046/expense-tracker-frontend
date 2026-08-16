import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

const sanitizeToastMessage = (msg) => {
  if (typeof msg === 'string') return msg;
  if (msg === null || msg === undefined) return 'An error occurred';
  if (typeof msg === 'object') {
    if (typeof msg.customMessage === 'string') return msg.customMessage;
    if (typeof msg.detail === 'string') return msg.detail;
    if (typeof msg.message === 'string') return msg.message;
    try {
      return JSON.stringify(msg);
    } catch {
      return 'An error occurred';
    }
  }
  return String(msg);
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 4);
    const cleanMsg = sanitizeToastMessage(message);
    setToasts((prev) => [...prev, { id, message: cleanMsg, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
    warning: (msg, duration) => addToast(msg, 'warning', duration),
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      {/* Render Toast Notifications Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-slide-in ${
              t.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200'
                : t.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200'
                : t.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
                : 'bg-slate-50 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
              {t.type === 'error' && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
              {t.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-blue-500 shrink-0" />}
              <span className="text-sm font-medium leading-tight">
                {typeof t.message === 'string' ? t.message : JSON.stringify(t.message)}
              </span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context.toast;
};
