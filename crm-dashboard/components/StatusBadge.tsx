'use client';

import { Check, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'In Attesa', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  confirmed: { label: 'Confermato', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  preparing: { label: 'In Preparazione', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
  ready: { label: 'Pronto', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  completed: { label: 'Completato', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  cancelled: { label: 'Annullato', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
};

const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];

interface StatusBadgeProps {
  status: string;
  onChange?: (newStatus: string) => void;
  clickable?: boolean;
}

export default function StatusBadge({ status, onChange, clickable = false }: StatusBadgeProps) {
  const [open, setOpen] = useState(false);
  const config = statusConfig[status] || { label: status, color: 'text-[#5a5650]', bg: 'bg-white/5 border-[#2a2725]' };

  if (!clickable || !onChange) {
    return (
      <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-medium border ${config.bg} ${config.color}`}>
        {config.label}
      </span>
    );
  }

  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-medium border ${config.bg} ${config.color} hover:opacity-80 transition-opacity cursor-pointer`}
      >
        {config.label}
        <ChevronDown size={10} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 bg-[#161616] border border-[#2a2725] rounded-xl shadow-xl shadow-black/40 z-50 min-w-[180px] animate-scale-in overflow-hidden">
          {statusOrder.map((s) => {
            const sc = statusConfig[s];
            const isCurrent = s === status;
            const isPrev = statusOrder.indexOf(s) < currentIndex;
            return (
              <button
                key={s}
                onClick={() => { onChange(s); setOpen(false); }}
                disabled={isPrev}
                className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between gap-2 transition-colors ${
                  isCurrent
                    ? 'bg-primary/10 text-primary'
                    : isPrev
                    ? 'text-[#3a3530] cursor-not-allowed'
                    : 'text-[#a8a39e] hover:bg-white/5 hover:text-[#f0ece6]'
                }`}
              >
                <span className={sc.color}>{sc.label}</span>
                {isCurrent && <Check size={12} className="text-primary" />}
              </button>
            );
          })}
          <div className="border-t border-[#2a2725]">
            <button
              onClick={() => { onChange('cancelled'); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/5 transition-colors flex items-center justify-between gap-2"
            >
              Annullato
              {status === 'cancelled' && <Check size={12} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
