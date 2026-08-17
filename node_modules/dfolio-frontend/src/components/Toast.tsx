import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-4 rounded-xl shadow-2xl backdrop-blur-xl border transition-all duration-300 transform translate-y-0 animate-fade-in ${
              isSuccess
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-100'
                : isError
                ? 'bg-rose-950/80 border-rose-500/40 text-rose-100'
                : isWarning
                ? 'bg-amber-950/80 border-amber-500/40 text-amber-100'
                : 'bg-slate-900/90 border-brand-500/40 text-slate-100'
            }`}
          >
            <div className="mr-3 mt-0.5 shrink-0">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {isError && <XCircle className="w-5 h-5 text-rose-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-brand-400" />}
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <h4 className="font-semibold text-sm leading-tight">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs opacity-80 mt-1 line-clamp-2 leading-relaxed">{toast.message}</p>
              )}
            </div>

            <button
              onClick={() => onClose(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
