'use client';

import { AlertTriangle, Zap, XCircle, Info } from 'lucide-react';

export default function AlertBanner({ type = 'error', message, details, onClose }) {
  if (!message) return null;

  const configs = {
    error: {
      bg: 'bg-rose-950/40 border-rose-800/60 text-rose-200',
      icon: XCircle,
      iconColor: 'text-rose-400',
    },
    rateLimit: {
      bg: 'bg-amber-950/40 border-amber-800/60 text-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
    },
    cache: {
      bg: 'bg-emerald-950/40 border-emerald-800/50 text-emerald-200',
      icon: Zap,
      iconColor: 'text-emerald-400',
    },
    info: {
      bg: 'bg-indigo-950/40 border-indigo-800/50 text-indigo-200',
      icon: Info,
      iconColor: 'text-indigo-400',
    },
  };

  const config = configs[type] || configs.error;
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 my-4 ${config.bg} animate-fadeIn`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
      <div className="flex-1 text-sm">
        <p className="font-semibold">{message}</p>
        {details && <p className="mt-1 text-xs opacity-80 leading-relaxed">{details}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-xs opacity-60 hover:opacity-100 p-1 rounded hover:bg-white/5 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  );
}
