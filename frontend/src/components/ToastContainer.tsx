import React from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 lg:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 rounded-xl bg-[#3D160F] text-[#FFF8EF] px-4 py-3 shadow-lg border border-[#5D291C]"
        >
          {toast.type === 'success' && (
            <CheckCircle2 className="w-5 h-5 text-[#E9A36F] shrink-0 mt-0.5" />
          )}
          {toast.type === 'info' && <Info className="w-5 h-5 text-[#F7DCC3] shrink-0 mt-0.5" />}
          {toast.type === 'error' && (
            <AlertCircle className="w-5 h-5 text-[#FF8A65] shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight">{toast.title}</p>
            {toast.description && (
              <p className="text-xs text-[#F7DCC3]/85 mt-0.5 leading-snug">{toast.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
            className="text-[#F7DCC3]/70 hover:text-white transition-colors p-0.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
