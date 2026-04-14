'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((t: string, m?: string) => toast('success', t, m), [toast]);
  const error = useCallback((t: string, m?: string) => toast('error', t, m), [toast]);
  const warning = useCallback((t: string, m?: string) => toast('warning', t, m), [toast]);
  const info = useCallback((t: string, m?: string) => toast('info', t, m), [toast]);

  const icons: Record<ToastType, ReactNode> = {
    success: <CheckCircle size={18} className="text-green-400 shrink-0 mt-0.5" />,
    error: <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />,
    info: <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />,
  };

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role="alert">
            <div className="flex items-start gap-3">
              {icons[t.type]}
              <div className="flex-1 min-w-0">
                <p className="text-[#f0ece6] text-sm font-medium">{t.title}</p>
                {t.message && <p className="text-[#a8a39e] text-xs mt-0.5">{t.message}</p>}
              </div>
              <button onClick={() => remove(t.id)} className="text-[#5a5650] hover:text-[#f0ece6] transition-colors shrink-0" aria-label="Chiudi">
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
